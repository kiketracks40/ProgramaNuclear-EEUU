const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ['reactor', 'test', 'enrichment', 'laboratory', 'production', 'research']
  },
  category: {
    type: String,
    required: true,
    enum: ['commercial', 'military', 'research', 'university', 'historical', 'industrial']
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: {
      street: String,
      city: String,
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'USA'
      },
      zipCode: String
    }
  },
  operator: {
    type: String,
    required: true,
    maxlength: 200
  },
  specifications: {
    reactors: {
      type: Number,
      min: 0,
      default: 0
    },
    capacity: {
      value: Number,
      unit: {
        type: String,
        enum: ['MW', 'MWe', 'MWt', 'GW', 'kW']
      }
    },
    reactorType: {
      type: String,
      enum: ['PWR', 'BWR', 'PHWR', 'AGR', 'RBMK', 'FBR', 'MSR', 'HTR', 'Other']
    },
    fuel: {
      type: String,
      enum: ['U-235', 'U-238', 'Pu-239', 'Th-232', 'MOX', 'LEU', 'HEU']
    }
  },
  operational: {
    firstCritical: {
      type: Date
    },
    lastOperation: {
      type: Date
    },
    status: {
      type: String,
      required: true,
      enum: ['Operational', 'Under Construction', 'Planned', 'Shutdown', 'Decommissioning', 'Decommissioned', 'Cancelled']
    },
    licenseExpiry: {
      type: Date
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  details: {
    type: String,
    maxlength: 2000
  },
  icon: {
    type: String,
    required: true,
    maxlength: 10
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  safety: {
    incidents: [{
      date: Date,
      severity: {
        type: String,
        enum: ['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7']
      },
      description: String
    }],
    lastInspection: Date,
    safetyRating: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F']
    }
  },
  environmental: {
    emissions: {
      co2Annual: Number, // tons per year
      radioactiveWaste: Number // cubic meters per year
    },
    cooling: {
      waterSource: String,
      consumptionDaily: Number // liters per day
    }
  },
  economics: {
    constructionCost: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      year: Number
    },
    operationalCost: {
      annual: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    electricity: {
      generationAnnual: Number, // MWh per year
      pricePerMWh: Number
    }
  },
  metadata: {
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Disputed'],
      default: 'Pending'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    sources: [{
      url: String,
      title: String,
      date: Date
    }],
    views: {
      type: Number,
      default: 0
    },
    favorites: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas optimizadas
facilitySchema.index({ 'location.coordinates': '2dsphere' });
facilitySchema.index({ type: 1, category: 1 });
facilitySchema.index({ 'operational.status': 1 });
facilitySchema.index({ 'location.address.state': 1 });
facilitySchema.index({ name: 'text', description: 'text', details: 'text' });

// Virtual para calcular la edad de la instalación
facilitySchema.virtual('age').get(function() {
  if (this.operational.firstCritical) {
    return new Date().getFullYear() - this.operational.firstCritical.getFullYear();
  }
  return null;
});

// Virtual para calcular eficiencia
facilitySchema.virtual('efficiency').get(function() {
  if (this.specifications.capacity?.value && this.economics.electricity?.generationAnnual) {
    const maxGeneration = this.specifications.capacity.value * 8760; // horas por año
    return (this.economics.electricity.generationAnnual / maxGeneration) * 100;
  }
  return null;
});

module.exports = mongoose.model('Facility', facilitySchema);