// backend/controllers/jobController.js
const Job = require('../models/Job');

// @desc    Get all jobs with optional filters
// @route   GET /api/jobs
// @access  Protected
const getJobs = async (req, res, next) => {
  try {
    const { jobType, search } = req.query;
    const query = {};

    if (jobType && ['full-time', 'part-time'].includes(jobType)) {
      query.jobType = jobType;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email profilePic currentCompany jobTitle')
      .populate('applicants', 'name email profilePic graduationYear degree')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Protected
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profilePic currentCompany jobTitle')
      .populate('applicants', 'name email profilePic graduationYear degree');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a new job opportunity
// @route   POST /api/jobs
// @access  Protected
const createJob = async (req, res, next) => {
  try {
    const { title, company, description, location, jobType, salaryRange } = req.body;

    if (!title || !company || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title, company, description, and location'
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location,
      jobType: jobType || 'full-time',
      salaryRange: salaryRange || 'Competitive',
      postedBy: req.user._id,
      applicants: []
    });

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email profilePic currentCompany jobTitle');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: populatedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Protected
const applyJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyApplied = job.applicants.some(
      (applicantId) => applicantId.toString() === userIdStr
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position'
      });
    }

    // Add user to applicants list
    job.applicants.push(req.user._id);
    await job.save();

    const updatedJob = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profilePic currentCompany jobTitle')
      .populate('applicants', 'name email profilePic graduationYear degree');

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      hasApplied: true,
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Protected (Job poster or Admin only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const isPoster = job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPoster && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the user who posted the job or an admin can delete it'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  applyJob,
  deleteJob
};
