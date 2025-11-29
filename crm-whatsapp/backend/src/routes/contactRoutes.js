const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Rotas de contatos
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.post('/:id/notes', contactController.addNote);

module.exports = router;
