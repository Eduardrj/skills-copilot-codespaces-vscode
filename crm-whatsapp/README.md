# CRM WhatsApp com Evolution API

Um CRM moderno para gerenciamento de conversas do WhatsApp, funcionando como um upgrade do WhatsApp Web, integrado com a Evolution API.

## 📋 Funcionalidades

- ✅ **Dashboard** - Visão geral com métricas e estatísticas
- ✅ **Chat em tempo real** - Interface similar ao WhatsApp Web
- ✅ **Gerenciamento de contatos** - Cadastro completo com tags
- ✅ **Sistema de Tags** - Organize seus contatos com etiquetas coloridas
- ✅ **Funil de vendas** - Kanban com drag and drop
- ✅ **Histórico completo** - Todas as mensagens salvas
- ✅ **Notificações em tempo real** - Via Socket.io
- ✅ **Integração Evolution API** - WhatsApp não oficial

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- Prisma ORM + SQLite
- Socket.io (tempo real)
- Axios (requisições HTTP)

### Frontend
- React 18 + Vite
- TailwindCSS
- Socket.io Client
- Lucide React (ícones)
- React Router DOM

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Evolution API configurada

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd crm-whatsapp
```

### 2. Configure o Backend
```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# - EVOLUTION_API_URL
# - EVOLUTION_API_KEY
# - EVOLUTION_INSTANCE_NAME

# Gerar banco de dados
npx prisma generate
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### 3. Configure o Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev
```

### 4. Acesse a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Estrutura do Projeto

```
crm-whatsapp/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Modelos do banco de dados
│   ├── src/
│   │   ├── controllers/       # Controladores da API
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Serviços (Evolution API)
│   │   └── index.js           # Entrada do servidor
│   ├── .env.example           # Exemplo de configuração
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Serviços de API
│   │   ├── context/           # Contextos React
│   │   ├── hooks/             # Hooks customizados
│   │   └── styles/            # Estilos CSS
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Contatos
- `GET /api/contacts` - Listar contatos
- `POST /api/contacts` - Criar contato
- `PUT /api/contacts/:id` - Atualizar contato
- `DELETE /api/contacts/:id` - Excluir contato

### Conversas
- `GET /api/conversations` - Listar conversas
- `GET /api/conversations/:id` - Detalhes da conversa
- `POST /api/conversations` - Criar/obter conversa
- `PATCH /api/conversations/:id/status` - Atualizar status

### Mensagens
- `GET /api/messages/:conversationId` - Listar mensagens
- `POST /api/messages/:conversationId/text` - Enviar texto
- `POST /api/messages/:conversationId/media` - Enviar mídia

### Tags
- `GET /api/tags` - Listar tags
- `POST /api/tags` - Criar tag
- `PUT /api/tags/:id` - Atualizar tag
- `DELETE /api/tags/:id` - Excluir tag

### Funil
- `GET /api/funnel` - Listar etapas
- `POST /api/funnel` - Criar etapa
- `POST /api/funnel/move-contact` - Mover contato

### Evolution API
- `GET /api/evolution/status` - Status da conexão
- `GET /api/evolution/qrcode` - Obter QR Code
- `POST /api/evolution/logout` - Desconectar

## ⚙️ Configuração da Evolution API

1. Instale e configure a [Evolution API](https://doc.evolution-api.com/)
2. Crie uma instância
3. Obtenha a API Key
4. Configure no arquivo `.env`:

```env
EVOLUTION_API_URL=http://seu-servidor:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=crm-whatsapp
```

## 🔒 Segurança

- Nunca commite o arquivo `.env` com credenciais
- Use HTTPS em produção
- Configure CORS corretamente
- Valide todas as entradas do usuário

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

Desenvolvido com ❤️ usando Evolution API
