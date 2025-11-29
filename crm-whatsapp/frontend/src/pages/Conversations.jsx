import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { conversationService, messageService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image, 
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  User
} from 'lucide-react';

function Conversations() {
  const { id: selectedId } = useParams();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [filter, searchTerm]);

  useEffect(() => {
    if (selectedId) {
      loadConversation(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', handleNewMessage);
      socket.on('conversation-updated', handleConversationUpdated);
      
      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('conversation-updated', handleConversationUpdated);
      };
    }
  }, [socket, selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await conversationService.getAll(params);
      setConversations(response.data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await conversationService.getById(conversationId);
      setSelectedConversation(response.data);
      setMessages(response.data.messages || []);
      
      // Entrar na sala do Socket.io
      if (socket) {
        socket.emit('join-conversation', conversationId);
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, message]);
    }
    loadConversations();
  };

  const handleConversationUpdated = () => {
    loadConversations();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendText(selectedConversation.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      default:
        return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-dark"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Lista de conversas */}
      <div className="w-96 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
            />
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2 mt-3">
            {['all', 'open', 'pending', 'closed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === f 
                    ? 'bg-whatsapp-light text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Todas' : 
                 f === 'open' ? 'Abertas' : 
                 f === 'pending' ? 'Pendentes' : 'Fechadas'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma conversa encontrada
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b ${
                  selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {conv.contact.avatar ? (
                    <img 
                      src={conv.contact.avatar} 
                      alt={conv.contact.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv.contact.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conv.lastMessageAt && formatDistanceToNow(
                        new Date(conv.lastMessageAt), 
                        { addSuffix: true, locale: ptBR }
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage || 'Sem mensagens'}
                  </p>
                </div>
                
                {conv.unreadCount > 0 && (
                  <span className="bg-whatsapp-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        {selectedConversation ? (
          <>
            {/* Header do chat */}
            <div className="bg-whatsapp-teal text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {selectedConversation.contact.avatar ? (
                  <img 
                    src={selectedConversation.contact.avatar} 
                    alt={selectedConversation.contact.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{selectedConversation.contact.name}</h2>
                <p className="text-sm text-gray-200">{selectedConversation.contact.phone}</p>
              </div>
              <button className="p-2 hover:bg-whatsapp-dark rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble p-3 shadow ${
                    msg.isFromMe ? 'message-sent' : 'message-received'
                  }`}
                >
                  <p className="text-gray-800">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.isFromMe && getStatusIcon(msg.status)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensagem */}
            <form onSubmit={sendMessage} className="bg-gray-100 p-4 flex items-center gap-3">
              <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                <Paperclip className="w-6 h-6" />
              </button>
              <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                <Image className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-4 py-2 rounded-full bg-white focus:outline-none"
              />
              {newMessage ? (
                <button 
                  type="submit"
                  className="p-2 bg-whatsapp-light text-white rounded-full hover:bg-whatsapp-dark"
                >
                  <Send className="w-6 h-6" />
                </button>
              ) : (
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                  <Mic className="w-6 h-6" />
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Conversations;
