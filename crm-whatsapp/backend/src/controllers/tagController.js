const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Erro ao listar tags:', error);
    res.status(500).json({ error: 'Erro ao listar tags' });
  }
};

// Criar nova tag
exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const tag = await prisma.tag.create({
      data: { name, color }
    });
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Já existe uma tag com este nome' });
    }
    res.status(500).json({ error: 'Erro ao criar tag' });
  }
};

// Atualizar tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const tag = await prisma.tag.update({
      where: { id },
      data: { name, color }
    });
    
    res.json(tag);
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    res.status(500).json({ error: 'Erro ao atualizar tag' });
  }
};

// Excluir tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.tag.delete({
      where: { id }
    });
    
    res.json({ message: 'Tag excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tag:', error);
    res.status(500).json({ error: 'Erro ao excluir tag' });
  }
};
