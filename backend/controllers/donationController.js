// backend/controllers/donationController.js
const Donation = require('../models/Donation');

// @desc    Get all donations & campaigns summary
// @route   GET /api/donations
// @access  Protected
const getDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email profilePic graduationYear degree currentCompany')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const statsResult = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);

    const stats = statsResult[0] || {
      totalAmount: 0,
      count: 0,
      avgDonation: 0
    };

    // Campaign breakdown
    const campaignBreakdown = await Donation.aggregate([
      {
        $group: {
          _id: '$campaignName',
          totalRaised: { $sum: '$amount' },
          donorCount: { $sum: 1 }
        }
      },
      {
        $project: {
          campaignName: '$_id',
          totalRaised: 1,
          donorCount: 1,
          _id: 0
        }
      },
      { $sort: { totalRaised: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAmount: stats.totalAmount,
        totalDonations: stats.count,
        avgDonation: Math.round(stats.avgDonation || 0),
        campaigns: campaignBreakdown
      },
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Make a donation
// @route   POST /api/donations
// @access  Protected
const createDonation = async (req, res, next) => {
  try {
    const { amount, campaignName, message } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donation amount greater than 0'
      });
    }

    if (!campaignName || !campaignName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name is required'
      });
    }

    const donation = await Donation.create({
      amount: Number(amount),
      campaignName: campaignName.trim(),
      message: message ? message.trim() : '',
      donor: req.user._id
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name email profilePic graduationYear degree');

    res.status(201).json({
      success: true,
      message: 'Thank you for your generous contribution!',
      donation: populatedDonation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation statistics for dashboard
// @route   GET /api/donations/stats
// @access  Protected
const getDonationStats = async (req, res, next) => {
  try {
    const statsResult = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);

    const stats = statsResult[0] || {
      totalAmount: 0,
      count: 0,
      avgDonation: 0
    };

    const campaignBreakdown = await Donation.aggregate([
      {
        $group: {
          _id: '$campaignName',
          totalRaised: { $sum: '$amount' },
          donorCount: { $sum: 1 }
        }
      },
      {
        $project: {
          campaignName: '$_id',
          totalRaised: 1,
          donorCount: 1,
          _id: 0
        }
      },
      { $sort: { totalRaised: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAmount: stats.totalAmount,
        totalDonations: stats.count,
        avgDonation: Math.round(stats.avgDonation || 0),
        campaigns: campaignBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonations,
  createDonation,
  getDonationStats
};
