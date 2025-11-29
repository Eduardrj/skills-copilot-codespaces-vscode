import React, { useState, useEffect } from 'react';
import { conversationService } from '../services/api';
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
    unread: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await conversationService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total de Conversas', 
      value: stats.total, 
      icon: MessageSquare, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Conversas Abertas', 
      value: stats.open, 
      icon: Clock, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Pendentes', 
      value: stats.pending, 
      icon: Bell, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Finalizadas', 
      value: stats.closed, 
      icon: CheckCircle, 
      color: 'bg-gray-500' 
    },
    { 
      label: 'Não Lidas', 
      value: stats.unread, 
      icon: TrendingUp, 
      color: 'bg-red-500' 
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações do CRM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Bem-vindo ao CRM WhatsApp
          </h2>
          <p className="text-gray-600 mb-4">
            Este é seu painel de controle para gerenciar conversas do WhatsApp 
            através da Evolution API.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Gerenciamento de conversas em tempo real</p>
            <p>✅ Organização de contatos com tags</p>
            <p>✅ Funil de vendas/atendimento</p>
            <p>✅ Histórico completo de mensagens</p>
            <p>✅ Respostas rápidas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Como começar
          </h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-whatsapp-light text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
              <span>Configure a Evolution API em Configurações</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-whatsapp-light text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
              <span>Escaneie o QR Code para conectar seu WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-whatsapp-light text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
              <span>Adicione contatos e organize com tags</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-whatsapp-light text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
              <span>Configure seu funil de atendimento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-whatsapp-light text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</span>
              <span>Comece a conversar e gerenciar seus atendimentos!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
