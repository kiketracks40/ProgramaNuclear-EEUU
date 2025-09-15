const mongoose = require('mongoose');

const isotopeSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z][a-z]?-\d+$/
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  element: {
    name: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true,
      match: /^[A-Z][a-z]?$/
    },
    atomicNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 118
    }
  },
  nuclear: {
    massNumber: {
      type: Number,
      required: true,
      min: 1
    },
    atomicMass: {
      type: Number,
      required: true,
      min: 0
    },
    abundance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    halfLife: {
      value: {
        type: String,
        required: true
      },
      valueInSeconds: {
        type: Number // Para cálculos
      }
    },
    decayMode: {
      type: String,
      required: true,
      enum: ['Estable', 'α', 'β⁻', 'β⁺', 'EC', 'IT', 'SF', 'n', 'p', '2β⁻', '2EC']
    },
    bindingEnergy: {
      type: Number,
      required: true,
      min: 0
    }
  },
  neutronics: {
    fissionable: {
      type: Boolean,
      default: false
    },
    fusionable: {
      type: Boolean,
      default: false
    },
    crossSection: {
      thermal: {
        type: Number,
        min: 0
      },
      fast: {
        type: Number,
        min: 0
      },
      resonance: {
        type: Number,
        min: 0
      }
    },
    criticalMass: {
      sphere: Number,
      cylinder: Number,
      slab: Number
    },
    fissionEnergy: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  physical: {
    density: {
      type: Number,
      min: 0
    },
    meltingPoint: {
      type: Number
    },
    boilingPoint: {
      type: Number
    },
    thermalConductivity: {
      type: Number,
      min: 0
    },
    specificHeat: {
      type: Number,
      min: 0
    }
  },
  applications: {
    uses: [{
      type: String,
      maxlength: 200
    }],
    industry: [{
      type: String,
      enum: ['Nuclear Power', 'Nuclear Weapons', 'Medical', 'Research', 'Industrial', 'Agriculture', 'Space', 'Defense']
    }],
    safetyConcerns: [{
      type: String,
      maxlength: 300
    }]
  },
  discovery: {
    year: {
      type: Number,
      min: 1800,
      max: 2030
    },
    discoverer: {
      type: String,
      maxlength: 200
    },
    method: {
      type: String,
      maxlength: 300
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['fisil', 'fertil', 'combustible', 'moderador', 'structural', 'coolant', 'poison']
  },
  hazard: {
    radioactivity: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High', 'Extreme']
    },
    toxicity: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High', 'Extreme']
    },
    handling: {
      type: String,
      enum: ['Safe', 'Caution', 'Restricted', 'Controlled', 'Prohibited']
    }
  },
  economics: {
    productionMethod: [{
      type: String,
      maxlength: 200
    }],
    cost: {
      amount: Number,
      unit: String,
      currency: {
        type: String,
        default: 'USD'
      },
      date: Date
    },
    availability: {
      type: String,
      enum: ['Abundant', 'Common', 'Rare', 'Very Rare', 'Synthetic Only']
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
    sources: [{
      reference: String,
      url: String,
      date: Date
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
isotopeSchema.index({ symbol: 1 });
isotopeSchema.index({ 'element.symbol': 1 });
isotopeSchema.index({ 'element.atomicNumber': 1 });
isotopeSchema.index({ category: 1 });
isotopeSchema.index({ 'neutronics.fissionable': 1, 'neutronics.fusionable': 1 });
isotopeSchema.index({ 'applications.industry': 1 });

// Virtual para calcular estabilidad
isotopeSchema.virtual('stability').get(function() {
  if (this.nuclear.decayMode === 'Estable') return 'Stable';
  if (this.nuclear.halfLife.valueInSeconds > 1e9) return 'Very Long';
  if (this.nuclear.halfLife.valueInSeconds > 1e6) return 'Long';
  if (this.nuclear.halfLife.valueInSeconds > 1e3) return 'Medium';
  return 'Short';
});

// Virtual para calcular utilidad nuclear
isotopeSchema.virtual('nuclearUtility').get(function() {
  let score = 0;
  if (this.neutronics.fissionable) score += 3;
  if (this.neutronics.fusionable) score += 2;
  if (this.category === 'fertil') score += 1;
  if (this.category === 'moderador') score += 1;
  return score;
});

module.exports = mongoose.model('Isotope', isotopeSchema);