const axios = require('axios');

/**
 * Serviço de integração com a Evolution API
 * Documentação: https://doc.evolution-api.com/
 */
class EvolutionService {
  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'crm-whatsapp';
  }

  // Configurar headers da requisição
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey
    };
  }

  // ==================== INSTÂNCIA ====================

  /**
   * Criar uma nova instância do WhatsApp
   */
  async createInstance(instanceName = this.instanceName) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/instance/create`,
        {
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar instância:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obter QR Code para conexão
   */
  async getQRCode(instanceName = this.instanceName) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/connect/${instanceName}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verificar status da conexão
   */
  async getConnectionState(instanceName = this.instanceName) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/connectionState/${instanceName}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Desconectar instância
   */
  async logout(instanceName = this.instanceName) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/instance/logout/${instanceName}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao desconectar:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Listar todas as instâncias
   */
  async listInstances() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/fetchInstances`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar instâncias:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== MENSAGENS ====================

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(phone, message, instanceName = this.instanceName) {
    try {
      // Formatar número de telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        {
          number: formattedPhone,
          text: message
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar imagem
   */
  async sendImage(phone, imageUrl, caption = '', instanceName = this.instanceName) {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendMedia/${instanceName}`,
        {
          number: formattedPhone,
          mediatype: 'image',
          media: imageUrl,
          caption
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar documento
   */
  async sendDocument(phone, documentUrl, fileName, instanceName = this.instanceName) {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendMedia/${instanceName}`,
        {
          number: formattedPhone,
          mediatype: 'document',
          media: documentUrl,
          fileName
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar documento:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar áudio
   */
  async sendAudio(phone, audioUrl, instanceName = this.instanceName) {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/message/sendWhatsAppAudio/${instanceName}`,
        {
          number: formattedPhone,
          audio: audioUrl
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar áudio:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== CONTATOS ====================

  /**
   * Verificar se número tem WhatsApp
   */
  async checkNumberExists(phone, instanceName = this.instanceName) {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/chat/whatsappNumbers/${instanceName}`,
        {
          numbers: [formattedPhone]
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar número:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obter foto do perfil
   */
  async getProfilePicture(phone, instanceName = this.instanceName) {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      
      const response = await axios.post(
        `${this.baseUrl}/chat/fetchProfilePictureUrl/${instanceName}`,
        {
          number: formattedPhone
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter foto do perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Configurar webhook para receber mensagens
   */
  async setWebhook(webhookUrl, instanceName = this.instanceName) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/webhook/set/${instanceName}`,
        {
          webhook: {
            enabled: true,
            url: webhookUrl,
            webhookByEvents: true,
            events: [
              'MESSAGES_UPSERT',
              'MESSAGES_UPDATE',
              'CONNECTION_UPDATE',
              'QRCODE_UPDATED'
            ]
          }
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new EvolutionService();
