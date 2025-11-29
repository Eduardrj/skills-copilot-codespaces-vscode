import React, { useState, useEffect } from 'react';
import { funnelService } from '../services/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User,
  GripVertical,
  X
} from 'lucide-react';

function Funnel() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const response = await funnelService.getAll();
      setStages(response.data);
    } catch (error) {
      console.error('Erro ao carregar etapas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (stage = null) => {
    if (stage) {
      setEditingStage(stage);
      setFormData({
        name: stage.name,
        color: stage.color
      });
    } else {
      setEditingStage(null);
      setFormData({
        name: '',
        color: '#3B82F6'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStage) {
        await funnelService.update(editingStage.id, formData);
      } else {
        await funnelService.create(formData);
      }
      closeModal();
      loadStages();
    } catch (error) {
      console.error('Erro ao salvar etapa:', error);
    }
  };

  const deleteStage = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa?')) return;
    
    try {
      await funnelService.delete(id);
      loadStages();
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
    }
  };

  const moveContact = async (contactId, stageId) => {
    try {
      await funnelService.moveContact(contactId, stageId);
      loadStages();
    } catch (error) {
      console.error('Erro ao mover contato:', error);
    }
  };

  // Simulação de drag and drop (para implementação completa usar react-beautiful-dnd)
  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('contactId');
    if (contactId) {
      moveContact(contactId, stageId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, contactId) => {
    e.dataTransfer.setData('contactId', contactId);
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-dark"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Funil de Vendas</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-whatsapp-light text-white rounded-lg hover:bg-whatsapp-dark"
        >
          <Plus className="w-5 h-5" />
          Nova Etapa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <p className="mb-2">Nenhuma etapa criada ainda</p>
              <button
                onClick={() => openModal()}
                className="text-whatsapp-light hover:underline"
              >
                Criar primeira etapa
              </button>
            </div>
          </div>
        ) : (
          stages.map((stage) => (
            <div
              key={stage.id}
              className="w-72 flex-shrink-0 bg-gray-100 rounded-lg flex flex-col"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              {/* Header da etapa */}
              <div 
                className="p-3 rounded-t-lg flex items-center justify-between"
                style={{ backgroundColor: stage.color }}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-white/70 cursor-grab" />
                  <h3 className="font-semibold text-white">{stage.name}</h3>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {stage._count?.contacts || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openModal(stage)}
                    className="p-1 text-white/70 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteStage(stage.id)}
                    className="p-1 text-white/70 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards de contatos */}
              <div className="flex-1 p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {stage.contacts?.map((contact) => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    className="bg-white p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tags do contato */}
                    {contact.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            style={{ backgroundColor: tag.color }}
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {(!stage.contacts || stage.contacts.length === 0) && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Arraste contatos para cá
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStage ? 'Editar Etapa' : 'Nova Etapa'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Etapa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Novo Lead, Em Negociação, Fechado"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-whatsapp-light text-white rounded-lg hover:bg-whatsapp-dark"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Funnel;
