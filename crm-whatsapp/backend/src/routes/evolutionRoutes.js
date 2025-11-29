const express = require('express');
const router = express.Router();
const evolutionController = require('../controllers/evolutionController');

// Rotas de integração com Evolution API
router.get('/status', evolutionController.getStatus);
router.get('/qrcode', evolutionController.getQRCode);
router.get('/instances', evolutionController.listInstances);
router.post('/instance', evolutionController.createInstance);
router.post('/logout', evolutionController.logout);
router.post('/check-number', evolutionController.checkNumber);
router.post('/webhook', evolutionController.setWebhook);

module.exports = router;
