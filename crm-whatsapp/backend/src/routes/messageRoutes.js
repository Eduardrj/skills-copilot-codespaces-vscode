const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Rotas de mensagens
router.get('/:conversationId', messageController.getMessages);
router.post('/:conversationId/text', messageController.sendTextMessage);
router.post('/:conversationId/media', messageController.sendMedia);
router.patch('/:id/status', messageController.updateMessageStatus);

module.exports = router;
