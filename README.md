# CRM WhatsApp - Evolution API

Um CRM completo para gerenciamento de WhatsApp como upgrade do WhatsApp Web, integrado com a Evolution API.

## 🚀 Sobre o Projeto

Este projeto é um sistema CRM (Customer Relationship Management) desenvolvido para gerenciar conversas do WhatsApp de forma profissional, oferecendo funcionalidades avançadas que vão além do WhatsApp Web tradicional.

## ✨ Funcionalidades Principais

- 📊 **Dashboard** - Métricas e estatísticas em tempo real
- 💬 **Chat** - Interface de conversação similar ao WhatsApp Web
- 👥 **Contatos** - Gerenciamento completo com tags e notas
- 🏷️ **Tags** - Sistema de etiquetas coloridas para organização
- 📈 **Funil** - Kanban para acompanhamento de vendas/atendimento
- 🔔 **Tempo Real** - Notificações instantâneas via WebSocket
- 🔗 **Evolution API** - Integração completa com WhatsApp

## 📁 Estrutura

```
crm-whatsapp/
├── backend/     # API Node.js + Express + Prisma
├── frontend/    # React + Vite + TailwindCSS
└── README.md    # Documentação completa
```

## 🛠️ Tecnologias

| Backend | Frontend |
|---------|----------|
| Node.js | React 18 |
| Express | Vite |
| Prisma | TailwindCSS |
| SQLite | Socket.io Client |
| Socket.io | React Router |

## 📖 Documentação

Veja a documentação completa em [crm-whatsapp/README.md](./crm-whatsapp/README.md)

## 🚀 Quick Start

```bash
# Backend
cd crm-whatsapp/backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend (em outro terminal)
cd crm-whatsapp/frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

## 📝 Licença

MIT License
