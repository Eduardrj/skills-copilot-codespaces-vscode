const { PrismaClient } = require('@prisma/client');
const evolutionService = require('../services/evolutionService');
const prisma = new PrismaClient();

// Listar mensagens de uma conversa
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
};

// Enviar mensagem de texto
exports.sendTextMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    // Obter conversa e contato
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    // Enviar via Evolution API
    let evolutionResponse;
    try {
      evolutionResponse = await evolutionService.sendTextMessage(
        conversation.contact.phone,
        content
      );
    } catch (apiError) {
      console.error('Erro na Evolution API:', apiError);
      // Continuar mesmo se a API falhar (para testes)
    }
    
    // Salvar mensagem no banco
    const message = await prisma.message.create({
      data: {
        conversationId,
        contactId: conversation.contactId,
        content,
        type: 'text',
        isFromMe: true,
        status: 'sent',
        externalId: evolutionResponse?.key?.id
      }
    });
    
    // Atualizar conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date()
      }
    });
    
    // Emitir via Socket.io
    const io = req.app.get('io');
    io.to(`conversation-${conversationId}`).emit('new-message', message);
    io.emit('conversation-updated', {
      id: conversationId,
      lastMessage: content,
      lastMessageAt: new Date()
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

// Enviar mídia (imagem, documento, áudio)
exports.sendMedia = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { type, mediaUrl, caption, fileName } = req.body;
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    let evolutionResponse;
    try {
      switch (type) {
        case 'image':
          evolutionResponse = await evolutionService.sendImage(
            conversation.contact.phone,
            mediaUrl,
            caption
          );
          break;
        case 'document':
          evolutionResponse = await evolutionService.sendDocument(
            conversation.contact.phone,
            mediaUrl,
            fileName
          );
          break;
        case 'audio':
          evolutionResponse = await evolutionService.sendAudio(
            conversation.contact.phone,
            mediaUrl
          );
          break;
        default:
          return res.status(400).json({ error: 'Tipo de mídia não suportado' });
      }
    } catch (apiError) {
      console.error('Erro na Evolution API:', apiError);
    }
    
    const message = await prisma.message.create({
      data: {
        conversationId,
        contactId: conversation.contactId,
        content: caption || fileName || 'Mídia enviada',
        type,
        mediaUrl,
        isFromMe: true,
        status: 'sent',
        externalId: evolutionResponse?.key?.id
      }
    });
    
    // Atualizar conversa
    const lastMessage = type === 'image' ? '📷 Imagem' : 
                        type === 'document' ? '📄 Documento' : 
                        type === 'audio' ? '🎵 Áudio' : 'Mídia';
    
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage,
        lastMessageAt: new Date()
      }
    });
    
    // Emitir via Socket.io
    const io = req.app.get('io');
    io.to(`conversation-${conversationId}`).emit('new-message', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
    res.status(500).json({ error: 'Erro ao enviar mídia' });
  }
};

// Atualizar status da mensagem
exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const message = await prisma.message.update({
      where: { id },
      data: { status }
    });
    
    // Emitir via Socket.io
    const io = req.app.get('io');
    io.emit('message-status-updated', message);
    
    res.json(message);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da mensagem' });
  }
};
