const express = require('express');
const router = express.Router();
const TimelineEvent = require('../models/Timeline');
const { auth, authorize } = require('../middleware/auth');

// GET /api/timeline - Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const {
      year,
      category,
      impact,
      location,
      search,
      sort = 'year',
      order = 'asc',
      limit = 100,
      page = 1
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (year) {
      if (year.includes('-')) {
        const [startYear, endYear] = year.split('-');
        filters.year = { $gte: parseInt(startYear), $lte: parseInt(endYear) };
      } else {
        filters.year = parseInt(year);
      }
    }
    
    if (category) filters.category = category;
    if (impact) filters.impact = impact;
    if (location) filters.location = new RegExp(location, 'i');
    
    if (search) {
      filters.$text = { $search: search };
    }

    // Construir consulta
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const events = await TimelineEvent.find(filters)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .lean();

    const total = await TimelineEvent.countDocuments(filters);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline events'
    });
  }
});

// GET /api/timeline/:id - Obtener evento específico
router.get('/:id', async (req, res) => {
  try {
    const event = await TimelineEvent.findById(req.params.id)
      .populate('createdBy', 'username profile')
      .populate('likes.user', 'username');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Incrementar contador de vistas
    await TimelineEvent.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching timeline event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline event'
    });
  }
});

// POST /api/timeline - Crear nuevo evento
router.post('/', auth, authorize(['contributor', 'moderator', 'admin']), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new TimelineEvent(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Timeline event created successfully'
    });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating timeline event',
      error: error.message
    });
  }
});

// PUT /api/timeline/:id - Actualizar evento
router.put('/:id', auth, authorize(['moderator', 'admin']), async (req, res) => {
  try {
    const event = await TimelineEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    res.json({
      success: true,
      data: event,
      message: 'Timeline event updated successfully'
    });
  } catch (error) {
    console.error('Error updating timeline event:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating timeline event',
      error: error.message
    });
  }
});

// DELETE /api/timeline/:id - Eliminar evento
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const event = await TimelineEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    res.json({
      success: true,
      message: 'Timeline event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting timeline event'
    });
  }
});

// POST /api/timeline/:id/like - Like/Unlike evento
router.post('/:id/like', auth, async (req, res) => {
  try {
    const event = await TimelineEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    const existingLike = event.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      event.likes = event.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      event.likes.push({ user: req.user.id });
    }

    await event.save();

    res.json({
      success: true,
      data: {
        liked: !existingLike,
        totalLikes: event.likes.length
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like'
    });
  }
});

// GET /api/timeline/stats/summary - Estadísticas del timeline
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await TimelineEvent.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              impact: '$impact'
            }
          },
          byDecade: {
            $push: {
              decade: {
                $multiply: [
                  { $floor: { $divide: ['$year', 10] } },
                  10
                ]
              }
            }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } }
        }
      }
    ]);

    const categoryStats = await TimelineEvent.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgViews: { $avg: '$views' }
        }
      }
    ]);

    const impactStats = await TimelineEvent.aggregate([
      {
        $group: {
          _id: '$impact',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0],
        byCategory: categoryStats,
        byImpact: impactStats
      }
    });
  } catch (error) {
    console.error('Error fetching timeline stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline stats'
    });
  }
});

module.exports = router;