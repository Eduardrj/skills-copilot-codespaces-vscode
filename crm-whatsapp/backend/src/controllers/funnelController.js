const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas as etapas do funil
exports.getAllStages = async (req, res) => {
  try {
    const stages = await prisma.funnelStage.findMany({
      include: {
        contacts: {
          include: {
            tags: {
              include: { tag: true }
            }
          }
        },
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    res.json(stages);
  } catch (error) {
    console.error('Erro ao listar etapas:', error);
    res.status(500).json({ error: 'Erro ao listar etapas do funil' });
  }
};

// Criar nova etapa
exports.createStage = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Obter a última ordem
    const lastStage = await prisma.funnelStage.findFirst({
      orderBy: { order: 'desc' }
    });
    
    const order = lastStage ? lastStage.order + 1 : 0;
    
    const stage = await prisma.funnelStage.create({
      data: { name, color, order }
    });
    
    res.status(201).json(stage);
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    res.status(500).json({ error: 'Erro ao criar etapa' });
  }
};

// Atualizar etapa
exports.updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const stage = await prisma.funnelStage.update({
      where: { id },
      data: { name, color }
    });
    
    res.json(stage);
  } catch (error) {
    console.error('Erro ao atualizar etapa:', error);
    res.status(500).json({ error: 'Erro ao atualizar etapa' });
  }
};

// Reordenar etapas
exports.reorderStages = async (req, res) => {
  try {
    const { stages } = req.body; // Array de { id, order }
    
    await Promise.all(
      stages.map(({ id, order }) =>
        prisma.funnelStage.update({
          where: { id },
          data: { order }
        })
      )
    );
    
    res.json({ message: 'Etapas reordenadas com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar:', error);
    res.status(500).json({ error: 'Erro ao reordenar etapas' });
  }
};

// Mover contato entre etapas
exports.moveContact = async (req, res) => {
  try {
    const { contactId, stageId } = req.body;
    
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { funnelStageId: stageId },
      include: {
        funnelStage: true
      }
    });
    
    res.json(contact);
  } catch (error) {
    console.error('Erro ao mover contato:', error);
    res.status(500).json({ error: 'Erro ao mover contato' });
  }
};

// Excluir etapa
exports.deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remover contatos da etapa primeiro
    await prisma.contact.updateMany({
      where: { funnelStageId: id },
      data: { funnelStageId: null }
    });
    
    await prisma.funnelStage.delete({
      where: { id }
    });
    
    res.json({ message: 'Etapa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir etapa:', error);
    res.status(500).json({ error: 'Erro ao excluir etapa' });
  }
};
