const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');

// Rotas do funil
router.get('/', funnelController.getAllStages);
router.post('/', funnelController.createStage);
router.put('/:id', funnelController.updateStage);
router.delete('/:id', funnelController.deleteStage);
router.post('/reorder', funnelController.reorderStages);
router.post('/move-contact', funnelController.moveContact);

module.exports = router;
