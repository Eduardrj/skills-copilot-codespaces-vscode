import React, { useState, useEffect } from 'react';
import { evolutionService, tagService } from '../services/api';
import { 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Settings as SettingsIcon,
  X
} from 'lucide-react';

function Settings() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: '', color: '#3B82F6' });

  useEffect(() => {
    checkConnection();
    loadTags();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await evolutionService.getStatus();
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setConnectionStatus({ state: 'disconnected' });
    }
  };

  const getQRCode = async () => {
    setLoading(true);
    try {
      const response = await evolutionService.getQRCode();
      setQrCode(response.data);
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      alert('Erro ao obter QR Code. Verifique se a Evolution API está configurada corretamente.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!confirm('Tem certeza que deseja desconectar?')) return;
    
    try {
      await evolutionService.logout();
      setConnectionStatus({ state: 'disconnected' });
      setQrCode(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  };

  const openTagModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setTagForm({ name: tag.name, color: tag.color });
    } else {
      setEditingTag(null);
      setTagForm({ name: '', color: '#3B82F6' });
    }
    setShowTagModal(true);
  };

  const closeTagModal = () => {
    setShowTagModal(false);
    setEditingTag(null);
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagService.update(editingTag.id, tagForm);
      } else {
        await tagService.create(tagForm);
      }
      closeTagModal();
      loadTags();
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      alert(error.response?.data?.error || 'Erro ao salvar tag');
    }
  };

  const deleteTag = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;
    
    try {
      await tagService.delete(id);
      loadTags();
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
    }
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  return (
    <div className="p-6 h-full overflow-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conexão WhatsApp */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Conexão WhatsApp
          </h2>

          {/* Status */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                {connectionStatus?.state === 'open' ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-red-500 font-medium">Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            {connectionStatus?.state !== 'open' && (
              <button
                onClick={getQRCode}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-whatsapp-light text-white rounded-lg hover:bg-whatsapp-dark disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <QrCode className="w-5 h-5" />
                )}
                Gerar QR Code
              </button>
            )}

            {connectionStatus?.state === 'open' && (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <WifiOff className="w-5 h-5" />
                Desconectar
              </button>
            )}

            <button
              onClick={checkConnection}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar Status
            </button>
          </div>

          {/* QR Code */}
          {qrCode?.base64 && (
            <div className="mt-4 p-4 bg-white border rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-3">
                Escaneie o QR Code com o WhatsApp
              </p>
              <img 
                src={qrCode.base64} 
                alt="QR Code" 
                className="mx-auto w-64 h-64"
              />
            </div>
          )}
        </div>

        {/* Gerenciamento de Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags / Etiquetas
            </h2>
            <button
              onClick={() => openTagModal()}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-whatsapp-light text-white rounded-lg hover:bg-whatsapp-dark"
            >
              <Plus className="w-4 h-4" />
              Nova Tag
            </button>
          </div>

          <div className="space-y-2">
            {tags.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma tag criada ainda
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-800">{tag.name}</span>
                    <span className="text-sm text-gray-500">
                      ({tag._count?.contacts || 0} contatos)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openTagModal(tag)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Configurações da API */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Configurações da Evolution API
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Importante:</strong> Configure as variáveis de ambiente no arquivo 
                <code className="bg-yellow-100 px-1 rounded">.env</code> do backend:
              </p>
              <ul className="mt-2 space-y-1 text-yellow-700">
                <li>• <code>EVOLUTION_API_URL</code> - URL da Evolution API</li>
                <li>• <code>EVOLUTION_API_KEY</code> - Chave de API</li>
                <li>• <code>EVOLUTION_INSTANCE_NAME</code> - Nome da instância</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Documentação:</strong> Para mais informações sobre a Evolution API, 
                acesse a documentação oficial em:
              </p>
              <a 
                href="https://doc.evolution-api.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://doc.evolution-api.com/
              </a>
            </div>
          </div>
        </div>

        {/* Sobre */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sobre o CRM WhatsApp
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Versão:</strong> 1.0.0
            </p>
            <p>
              Este CRM foi desenvolvido para gerenciar conversas do WhatsApp 
              de forma eficiente, utilizando a Evolution API para integração.
            </p>
            <div className="pt-4 border-t">
              <p className="font-medium text-gray-800">Funcionalidades:</p>
              <ul className="mt-2 space-y-1">
                <li>✅ Chat em tempo real</li>
                <li>✅ Gerenciamento de contatos</li>
                <li>✅ Sistema de tags/etiquetas</li>
                <li>✅ Funil de vendas</li>
                <li>✅ Histórico de mensagens</li>
                <li>✅ Notificações em tempo real</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Tag */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTag ? 'Editar Tag' : 'Nova Tag'}
              </h2>
              <button onClick={closeTagModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTagSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Tag *
                </label>
                <input
                  type="text"
                  required
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  placeholder="Ex: VIP, Novo, Em negociação"
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
                      onClick={() => setTagForm({ ...tagForm, color })}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full ${
                        tagForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeTagModal}
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

export default Settings;
