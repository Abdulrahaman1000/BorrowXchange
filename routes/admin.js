const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if needed
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');
const { getAllTransactions } = require('../controllers/transactionController');

// Make a user an admin
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
    res.json({ message: 'User granted admin rights', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: Get all transactions
router.get('/admin/transactions', auth, isAdmin, getAllTransactions);

module.exports = router;
