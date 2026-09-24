// backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    location: {
      type: String,
      required: [true, 'Job location or remote status is required'],
      trim: true
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time'],
        message: 'Job type must be either full-time or part-time'
      },
      default: 'full-time'
    },
    salaryRange: {
      type: String,
      trim: true,
      default: 'Competitive'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User posting this job is required']
    },
    applicants: [
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

module.exports = mongoose.model('Job', jobSchema);
