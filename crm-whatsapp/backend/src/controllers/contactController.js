const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todos os contatos
exports.getAllContacts = async (req, res) => {
  try {
    const { search, tagId, funnelStageId } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    if (tagId) {
      where.tags = {
        some: { tagId }
      };
    }
    
    if (funnelStageId) {
      where.funnelStageId = funnelStageId;
    }
    
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        tags: {
          include: { tag: true }
        },
        funnelStage: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(contacts);
  } catch (error) {
    console.error('Erro ao listar contatos:', error);
    res.status(500).json({ error: 'Erro ao listar contatos' });
  }
};

// Obter contato por ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true }
        },
        funnelStage: true,
        conversations: {
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ error: 'Erro ao buscar contato' });
  }
};

// Criar novo contato
exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, notes, tagIds, funnelStageId } = req.body;
    
    // Verificar se já existe contato com este telefone
    const existingContact = await prisma.contact.findUnique({
      where: { phone }
    });
    
    if (existingContact) {
      return res.status(400).json({ error: 'Já existe um contato com este telefone' });
    }
    
    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email,
        notes,
        funnelStageId,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({ tagId }))
        } : undefined
      },
      include: {
        tags: {
          include: { tag: true }
        },
        funnelStage: true
      }
    });
    
    res.status(201).json(contact);
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ error: 'Erro ao criar contato' });
  }
};

// Atualizar contato
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, avatar, tagIds, funnelStageId } = req.body;
    
    // Atualizar tags se fornecidas
    if (tagIds) {
      // Remover tags existentes
      await prisma.contactTag.deleteMany({
        where: { contactId: id }
      });
      
      // Adicionar novas tags
      await prisma.contactTag.createMany({
        data: tagIds.map(tagId => ({
          contactId: id,
          tagId
        }))
      });
    }
    
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        notes,
        avatar,
        funnelStageId
      },
      include: {
        tags: {
          include: { tag: true }
        },
        funnelStage: true
      }
    });
    
    res.json(contact);
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Erro ao atualizar contato' });
  }
};

// Excluir contato
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.contact.delete({
      where: { id }
    });
    
    res.json({ message: 'Contato excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir contato:', error);
    res.status(500).json({ error: 'Erro ao excluir contato' });
  }
};

// Adicionar nota ao contato
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const contact = await prisma.contact.findUnique({
      where: { id }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    const updatedNotes = contact.notes 
      ? `${contact.notes}\n\n[${new Date().toLocaleString('pt-BR')}] ${note}`
      : `[${new Date().toLocaleString('pt-BR')}] ${note}`;
    
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { notes: updatedNotes }
    });
    
    res.json(updatedContact);
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);
    res.status(500).json({ error: 'Erro ao adicionar nota' });
  }
};
