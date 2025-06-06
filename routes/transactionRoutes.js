const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');

const {
  transfer,
  acceptTransaction,
  declineTransaction,
  getTransactions,
  getAllTransactions
} = require('../controllers/transactionController');

const User = require('../models/User'); // Import User model for admin promotion

// Regular user routes
router.post('/transfer', auth, transfer);
router.post('/transactions/:id/accept', auth, acceptTransaction);
router.post('/transactions/:id/decline', auth, declineTransaction);
router.get('/transactions', auth, getTransactions);


router.get('/admin/transactions', auth, isAdmin, getAllTransactions);


router.put('/make-admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User promoted to admin successfully',
      user
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
