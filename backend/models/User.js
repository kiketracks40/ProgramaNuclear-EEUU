const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String
    },
    bio: {
      type: String,
      maxlength: 500
    },
    organization: {
      type: String,
      maxlength: 200
    },
    position: {
      type: String,
      maxlength: 100
    },
    location: {
      country: String,
      state: String,
      city: String
    }
  },
  permissions: {
    role: {
      type: String,
      enum: ['user', 'contributor', 'moderator', 'admin'],
      default: 'user'
    },
    canCreateContent: {
      type: Boolean,
      default: false
    },
    canModifyContent: {
      type: Boolean,
      default: false
    },
    canDeleteContent: {
      type: Boolean,
      default: false
    },
    canVerifyContent: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'limited', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      }
    }
  },
  activity: {
    favorites: {
      facilities: [{
        facility: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Facility'
        },
        date: {
          type: Date,
          default: Date.now
        }
      }],
      timelineEvents: [{
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TimelineEvent'
        },
        date: {
          type: Date,
          default: Date.now
        }
      }],
      isotopes: [{
        isotope: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Isotope'
        },
        date: {
          type: Date,
          default: Date.now
        }
      }]
    },
    searches: [{
      query: String,
      module: {
        type: String,
        enum: ['timeline', 'facilities', 'materials', 'calculator', 'simulator']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    views: [{
      contentType: {
        type: String,
        enum: ['facility', 'timeline', 'isotope', 'simulation']
      },
      contentId: mongoose.Schema.Types.ObjectId,
      timestamp: {
        type: Date,
        default: Date.now
      },
      duration: Number // segundos
    }],
    contributions: {
      facilitiesAdded: {
        type: Number,
        default: 0
      },
      timelineEventsAdded: {
        type: Number,
        default: 0
      },
      isotopesAdded: {
        type: Number,
        default: 0
      },
      verificationsPerformed: {
        type: Number,
        default: 0
      }
    }
  },
  security: {
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String
    }
  },
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: {
      type: String
    },
    banExpires: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security.passwordResetToken;
      delete ret.security.emailVerificationToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Índices
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'permissions.role': 1 });
userSchema.index({ 'status.isActive': 1, 'status.isBanned': 1 });

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual para nivel de usuario
userSchema.virtual('userLevel').get(function() {
  const contributions = this.activity.contributions;
  const total = contributions.facilitiesAdded + 
                contributions.timelineEventsAdded + 
                contributions.isotopesAdded + 
                contributions.verificationsPerformed;
  
  if (total >= 100) return 'Expert';
  if (total >= 50) return 'Advanced';
  if (total >= 10) return 'Intermediate';
  return 'Beginner';
});

// Middleware para hashear password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar intentos de login
userSchema.methods.incrementLoginAttempts = function() {
  // Si tenemos un lockUntil anterior y ya pasó, reiniciamos
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Si alcanzamos el máximo de intentos y no está bloqueado, bloqueamos
  if (this.security.loginAttempts + 1 >= 5 && !this.security.accountLocked) {
    updates.$set = {
      'security.accountLocked': true,
      'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 // 2 horas
    };
  }
  
  return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema);