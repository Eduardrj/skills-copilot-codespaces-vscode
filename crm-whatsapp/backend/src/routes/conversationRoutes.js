const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Rotas de conversas
router.get('/', conversationController.getAllConversations);
router.get('/stats', conversationController.getConversationStats);
router.get('/:id', conversationController.getConversationById);
router.post('/', conversationController.getOrCreateConversation);
router.patch('/:id/status', conversationController.updateConversationStatus);
router.delete('/:id', conversationController.deleteConversation);

module.exports = router;
