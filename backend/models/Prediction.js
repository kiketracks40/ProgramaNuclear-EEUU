const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  model: {
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    version: {
      type: String,
      required: true
    },
    algorithm: {
      type: String,
      required: true,
      enum: ['neural_network', 'linear_regression', 'random_forest', 'lstm', 'transformer']
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    trainedOn: {
      type: Date,
      default: Date.now
    }
  },
  prediction: {
    type: {
      type: String,
      required: true,
      enum: ['arsenal_size', 'nuclear_capacity', 'accident_probability', 'proliferation_risk', 'treaty_compliance']
    },
    target: {
      entity: {
        type: String,
        required: true // 'USA', 'Russia', 'China', 'Global', etc.
      },
      specificTarget: {
        type: String // Facility ID, Region, etc.
      }
    },
    timeframe: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      intervalType: {
        type: String,
        enum: ['daily', 'monthly', 'yearly'],
        default: 'yearly'
      }
    }
  },
  data: {
    historical: [{
      date: {
        type: Date,
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1
      }
    }],
    predicted: [{
      date: {
        type: Date,
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      upperBound: {
        type: Number
      },
      lowerBound: {
        type: Number
      }
    }],
    factors: [{
      name: {
        type: String,
        required: true
      },
      importance: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      description: {
        type: String,
        maxlength: 300
      }
    }]
  },
  validation: {
    crossValidationScore: {
      type: Number,
      min: 0,
      max: 1
    },
    testAccuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    meanAbsoluteError: {
      type: Number,
      min: 0
    },
    rootMeanSquareError: {
      type: Number,
      min: 0
    },
    rSquared: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  analysis: {
    insights: [{
      type: String,
      maxlength: 500
    }],
    risks: [{
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: {
        type: String,
        maxlength: 300
      },
      probability: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    recommendations: [{
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent']
      },
      action: {
        type: String,
        maxlength: 300
      },
      rationale: {
        type: String,
        maxlength: 500
      }
    }]
  },
  metadata: {
    createdBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      system: {
        type: String,
        default: 'AI_System'
      }
    },
    dataSource: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String
      },
      reliability: {
        type: Number,
        min: 0,
        max: 1
      },
      lastUpdated: {
        type: Date
      }
    }],
    computationTime: {
      type: Number // milliseconds
    },
    resourcesUsed: {
      cpu: Number,
      memory: Number,
      gpu: Number
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed', 'outdated'],
      default: 'generating'
    },
    public: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
    },
    comment: {
    type: String,
    maxlength: 500
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
// Índices para optimización
predictionSchema.index({ 'prediction.type': 1, 'prediction.target.entity': 1 });
predictionSchema.index({ 'prediction.timeframe.startDate': 1, 'prediction.timeframe.endDate': 1 });
predictionSchema.index({ 'model.name': 1, 'model.version': 1 });
predictionSchema.index({ 'metadata.status': 1 });
predictionSchema.index({ 'metadata.public': 1, 'metadata.featured': 1 });
predictionSchema.index({ createdAt: -1 });
// Virtual para calcular rating promedio
predictionSchema.virtual('averageRating').get(function() {
if (this.usage.ratings.length === 0) return 0;
const sum = this.usage.ratings.reduce((acc, rating) => acc + rating.rating, 0);
return sum / this.usage.ratings.length;
});
// Virtual para calcular confianza promedio
predictionSchema.virtual('averageConfidence').get(function() {
if (this.data.predicted.length === 0) return 0;
const sum = this.data.predicted.reduce((acc, pred) => acc + pred.confidence, 0);
return sum / this.data.predicted.length;
});
// Virtual para determinar si la predicción está actualizada
predictionSchema.virtual('isUpToDate').get(function() {
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
return this.updatedAt > thirtyDaysAgo;
});
module.exports = mongoose.model('Prediction', predictionSchema);