// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    date: {
      type: Date,
      required: [true, 'Event date and time are required']
    },
    location: {
      type: String,
      required: [true, 'Event location or meeting link is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['online', 'offline'],
        message: 'Type must be either online or offline'
      },
      default: 'offline'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event organizer reference is required']
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
