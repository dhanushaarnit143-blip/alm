// backend/routes/jobRoutes.js
const express = require('express');
const {
  getJobs,
  getJobById,
  createJob,
  applyJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, createJob);
router.post('/:id/apply', protect, applyJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;
