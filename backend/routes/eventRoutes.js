// backend/routes/eventRoutes.js
const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  rsvpEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, createEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
