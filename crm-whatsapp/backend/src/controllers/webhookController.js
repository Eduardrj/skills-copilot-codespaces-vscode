const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controlador de Webhooks da Evolution API
 * Recebe eventos em tempo real do WhatsApp
 */

// Processar webhook da Evolution API
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    const io = req.app.get('io');
    
    console.log('📨 Webhook recebido:', event.event);
    
    switch (event.event) {
      case 'messages.upsert':
        await handleNewMessage(event.data, io);
        break;
        
      case 'messages.update':
        await handleMessageUpdate(event.data, io);
        break;
        
      case 'connection.update':
        await handleConnectionUpdate(event.data, io);
        break;
        
      case 'qrcode.updated':
        io.emit('qrcode-updated', event.data);
        break;
        
      default:
        console.log('Evento não tratado:', event.event);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};

// Processar nova mensagem recebida
async function handleNewMessage(data, io) {
  try {
    const messageData = data.message;
    
    // Ignorar mensagens enviadas por nós
    if (messageData.key.fromMe) {
      return;
    }
    
    // Extrair número do remetente
    const phone = messageData.key.remoteJid.replace('@s.whatsapp.net', '');
    
    // Buscar ou criar contato
    let contact = await prisma.contact.findUnique({
      where: { phone }
    });
    
    if (!contact) {
      // Criar novo contato
      contact = await prisma.contact.create({
        data: {
          name: messageData.pushName || phone,
          phone
        }
      });
    }
    
    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        status: { not: 'closed' }
      }
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          status: 'open'
        }
      });
    }
    
    // Determinar tipo e conteúdo da mensagem
    let content = '';
    let type = 'text';
    let mediaUrl = null;
    
    if (messageData.message.conversation) {
      content = messageData.message.conversation;
    } else if (messageData.message.extendedTextMessage) {
      content = messageData.message.extendedTextMessage.text;
    } else if (messageData.message.imageMessage) {
      content = messageData.message.imageMessage.caption || '📷 Imagem';
      type = 'image';
      mediaUrl = messageData.message.imageMessage.url;
    } else if (messageData.message.audioMessage) {
      content = '🎵 Áudio';
      type = 'audio';
      mediaUrl = messageData.message.audioMessage.url;
    } else if (messageData.message.documentMessage) {
      content = `📄 ${messageData.message.documentMessage.fileName || 'Documento'}`;
      type = 'document';
      mediaUrl = messageData.message.documentMessage.url;
    } else if (messageData.message.videoMessage) {
      content = messageData.message.videoMessage.caption || '🎥 Vídeo';
      type = 'video';
      mediaUrl = messageData.message.videoMessage.url;
    }
    
    // Salvar mensagem
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        contactId: contact.id,
        content,
        type,
        mediaUrl,
        isFromMe: false,
        status: 'received',
        externalId: messageData.key.id,
        timestamp: new Date(messageData.messageTimestamp * 1000)
      }
    });
    
    // Atualizar conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 }
      }
    });
    
    // Emitir eventos via Socket.io
    io.to(`conversation-${conversation.id}`).emit('new-message', message);
    io.emit('conversation-updated', {
      id: conversation.id,
      contactId: contact.id,
      lastMessage: content,
      lastMessageAt: new Date(),
      unreadCount: conversation.unreadCount + 1
    });
    io.emit('new-message-notification', {
      conversationId: conversation.id,
      contactName: contact.name,
      message: content
    });
    
    console.log(`✅ Mensagem recebida de ${contact.name}: ${content}`);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
}

// Processar atualização de status da mensagem
async function handleMessageUpdate(data, io) {
  try {
    const { key, update } = data;
    
    if (!key.id) return;
    
    const message = await prisma.message.findFirst({
      where: { externalId: key.id }
    });
    
    if (message) {
      let status = 'sent';
      if (update.status === 2) status = 'delivered';
      if (update.status === 3 || update.status === 4) status = 'read';
      
      await prisma.message.update({
        where: { id: message.id },
        data: { status }
      });
      
      io.to(`conversation-${message.conversationId}`).emit('message-status-updated', {
        id: message.id,
        status
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
  }
}

// Processar atualização de conexão
async function handleConnectionUpdate(data, io) {
  console.log('🔌 Status da conexão:', data.state);
  io.emit('connection-update', data);
}
