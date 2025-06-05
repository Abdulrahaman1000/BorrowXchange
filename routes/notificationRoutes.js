const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getNotifications } = require('../controllers/notificationController');

router.get('/notifications', auth, getNotifications);

module.exports = router;
