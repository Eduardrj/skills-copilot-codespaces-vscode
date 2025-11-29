const evolutionService = require('../services/evolutionService');

// Obter status da conexão
exports.getStatus = async (req, res) => {
  try {
    const status = await evolutionService.getConnectionState();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao verificar status',
      message: error.message 
    });
  }
};

// Criar instância
exports.createInstance = async (req, res) => {
  try {
    const { instanceName } = req.body;
    const result = await evolutionService.createInstance(instanceName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao criar instância',
      message: error.message 
    });
  }
};

// Obter QR Code
exports.getQRCode = async (req, res) => {
  try {
    const result = await evolutionService.getQRCode();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao obter QR Code',
      message: error.message 
    });
  }
};

// Desconectar
exports.logout = async (req, res) => {
  try {
    const result = await evolutionService.logout();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao desconectar',
      message: error.message 
    });
  }
};

// Listar instâncias
exports.listInstances = async (req, res) => {
  try {
    const instances = await evolutionService.listInstances();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar instâncias',
      message: error.message 
    });
  }
};

// Verificar número
exports.checkNumber = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await evolutionService.checkNumberExists(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao verificar número',
      message: error.message 
    });
  }
};

// Configurar webhook
exports.setWebhook = async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    const result = await evolutionService.setWebhook(webhookUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao configurar webhook',
      message: error.message 
    });
  }
};
