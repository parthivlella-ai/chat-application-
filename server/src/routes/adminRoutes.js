const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getAdminUsers,
  toggleBlockUser,
  getReports,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getSystemStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.get('/reports', getReports);

module.exports = router;
