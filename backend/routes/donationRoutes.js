// backend/routes/donationRoutes.js
const express = require('express');
const {
  getDonations,
  createDonation,
  getDonationStats
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDonations);
router.post('/', protect, createDonation);
router.get('/stats', protect, getDonationStats);

module.exports = router;
