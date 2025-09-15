const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: 1940,
    max: 2030
  },
  month: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['inicio', 'instalacion', 'material', 'prueba', 'uso', 'evento', 'desarrollo', 'crisis', 'tratado', 'desarme', 'accidente', 'presente']
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  details: {
    type: String,
    required: true,
    maxlength: 1000
  },
  impact: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  location: {
    type: String,
    required: true,
    maxlength: 100
  },
  image: {
    type: String,
    required: true,
    maxlength: 10
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  sources: [{
    type: String,
    maxlength: 500
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
timelineEventSchema.index({ year: 1, category: 1 });
timelineEventSchema.index({ title: 'text', description: 'text', details: 'text' });
timelineEventSchema.index({ location: 1 });
timelineEventSchema.index({ impact: 1 });

// Virtual para calcular la importancia del evento
timelineEventSchema.virtual('importance').get(function() {
  const impactWeight = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  
  const ageWeight = Math.max(1, (2030 - this.year) / 100);
  const likesWeight = this.likes.length / 10;
  const viewsWeight = this.views / 1000;
  
  return impactWeight[this.impact] + ageWeight + likesWeight + viewsWeight;
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);