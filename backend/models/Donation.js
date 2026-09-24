// backend/models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least 1']
    },
    campaignName: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: ''
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Donation', donationSchema);
