const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Importar rutas
//const timelineRoutes = require('./routes/timeline');
//const facilitiesRoutes = require('./routes/facilities');
//const materialsRoutes = require('./routes/materials');
//const usersRoutes = require('./routes/users');
//const predictionsRoutes = require('./routes/predictions');
//const authRoutes = require('./routes/auth');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nuclear-simulator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware de seguridad
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas principales
//app.use('/api/auth', authRoutes);
//app.use('/api/timeline', timelineRoutes);
//app.use('/api/facilities', facilitiesRoutes);
//app.use('/api/materials', materialsRoutes);
//app.use('/api/users', usersRoutes);
//app.use('/api/predictions', predictionsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nuclear Simulator API is running!',
    database: 'MongoDB Connected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de estadísticas generales
app.get('/api/stats', async (req, res) => {
  try {
    const TimelineEvent = require('./models/Timeline');
    const Facility = require('./models/Facility');
    const Isotope = require('./models/Material');
    const User = require('./models/User');

    const stats = {
      timeline: {
        total: await TimelineEvent.countDocuments(),
        byCategory: await TimelineEvent.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
      },
      facilities: {
        total: await Facility.countDocuments(),
        operational: await Facility.countDocuments({ 'operational.status': 'Operational' }),
        byType: await Facility.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      },
      materials: {
        total: await Isotope.countDocuments(),
        fissionable: await Isotope.countDocuments({ 'neutronics.fissionable': true }),
        fusionable: await Isotope.countDocuments({ 'neutronics.fusionable': true })
      },
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ 'status.isActive': true })
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
});