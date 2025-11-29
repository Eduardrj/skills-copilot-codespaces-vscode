const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Rota de webhook da Evolution API
router.post('/', webhookController.handleWebhook);

module.exports = router;
