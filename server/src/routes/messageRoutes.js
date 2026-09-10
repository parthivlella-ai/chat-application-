const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageRead,
  markConversationRead,
  searchMessages,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/search', searchMessages);
router.get('/:conversationId', getMessages);
router.post('/', upload.single('attachment'), sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.put('/:id/read', markMessageRead);
router.put('/conversation/:conversationId/read', markConversationRead);

module.exports = router;
