// backend/controllers/eventController.js
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public / Protected
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email profilePic role')
      .populate('attendees', 'name email profilePic graduationYear')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public / Protected
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePic role')
      .populate('attendees', 'name email profilePic graduationYear degree');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Protected (Admin / Alumni)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, type } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, date, and location'
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      type: type || 'offline',
      organizer: req.user._id,
      attendees: [req.user._id] // Organizer automatically attends
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email profilePic role')
      .populate('attendees', 'name email profilePic');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to an event (Add user to attendees or toggle)
// @route   POST /api/events/:id/rsvp
// @access  Protected
const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyAttendingIndex = event.attendees.findIndex(
      (attendeeId) => attendeeId.toString() === userIdStr
    );

    let isAttending = false;

    if (alreadyAttendingIndex > -1) {
      // User is already attending -> Remove from attendees (cancel RSVP)
      event.attendees.splice(alreadyAttendingIndex, 1);
      isAttending = false;
    } else {
      // Add user to attendees
      event.attendees.push(req.user._id);
      isAttending = true;
    }

    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePic role')
      .populate('attendees', 'name email profilePic graduationYear');

    res.status(200).json({
      success: true,
      message: isAttending
        ? 'Successfully registered for event'
        : 'RSVP cancelled successfully',
      isAttending,
      event: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Protected (Organizer or Admin only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isOrganizer = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the organizer or an admin can delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  rsvpEvent,
  deleteEvent
};
