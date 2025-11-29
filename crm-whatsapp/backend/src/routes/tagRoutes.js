const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Rotas de tags
router.get('/', tagController.getAllTags);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
