const express = require('express');
const router = express.Router();
const {
  getConversations,
  createOrGetConversation,
  getConversationById,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getConversations);
router.post('/', createOrGetConversation);
router.get('/:id', getConversationById);

module.exports = router;
