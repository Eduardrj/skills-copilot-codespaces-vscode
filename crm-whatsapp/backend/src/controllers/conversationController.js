const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as conversas
exports.getAllConversations = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.contact = {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } }
        ]
      };
    }
    
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        contact: {
          include: {
            tags: {
              include: { tag: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(conversations);
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({ error: 'Erro ao listar conversas' });
  }
};

// Obter conversa por ID
exports.getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: {
          include: {
            tags: {
              include: { tag: true }
            },
            funnelStage: true
          }
        },
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    // Marcar como lido
    await prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 }
    });
    
    res.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
};

// Criar ou obter conversa por contato
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Verificar se já existe conversa aberta
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId,
        status: { not: 'closed' }
      },
      include: {
        contact: true,
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!conversation) {
      // Criar nova conversa
      conversation = await prisma.conversation.create({
        data: {
          contactId,
          status: 'open'
        },
        include: {
          contact: true,
          messages: true
        }
      });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Erro ao criar/obter conversa:', error);
    res.status(500).json({ error: 'Erro ao criar/obter conversa' });
  }
};

// Atualizar status da conversa
exports.updateConversationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status },
      include: {
        contact: true
      }
    });
    
    // Emitir evento via Socket.io
    const io = req.app.get('io');
    io.emit('conversation-updated', conversation);
    
    res.json(conversation);
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    res.status(500).json({ error: 'Erro ao atualizar conversa' });
  }
};

// Excluir conversa
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.conversation.delete({
      where: { id }
    });
    
    res.json({ message: 'Conversa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    res.status(500).json({ error: 'Erro ao excluir conversa' });
  }
};

// Obter estatísticas de conversas
exports.getConversationStats = async (req, res) => {
  try {
    const [total, open, pending, closed, unread] = await Promise.all([
      prisma.conversation.count(),
      prisma.conversation.count({ where: { status: 'open' } }),
      prisma.conversation.count({ where: { status: 'pending' } }),
      prisma.conversation.count({ where: { status: 'closed' } }),
      prisma.conversation.count({ where: { unreadCount: { gt: 0 } } })
    ]);
    
    res.json({
      total,
      open,
      pending,
      closed,
      unread
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};
