require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Importar rotas
const contactRoutes = require('./routes/contactRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const tagRoutes = require('./routes/tagRoutes');
const funnelRoutes = require('./routes/funnelRoutes');
const evolutionRoutes = require('./routes/evolutionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io para comunicação em tempo real
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Disponibilizar io para as rotas
app.set('io', io);

// Rotas da API
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/funnel', funnelRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/webhook', webhookRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CRM WhatsApp API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Socket.io - Conexões em tempo real
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`📱 Socket ${socket.id} entrou na conversa ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`📱 Socket ${socket.id} saiu da conversa ${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`
  🚀 CRM WhatsApp Backend iniciado!
  📍 Servidor: http://localhost:${PORT}
  📡 API: http://localhost:${PORT}/api
  🔌 WebSocket: Ativo
  `);
});

module.exports = { app, io };
