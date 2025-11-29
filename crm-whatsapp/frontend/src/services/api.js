import axios from 'axios';

// URL configurável via variável de ambiente para suportar diferentes ambientes
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Contatos
export const contactService = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  addNote: (id, note) => api.post(`/contacts/${id}/notes`, { note })
};

// Conversas
export const conversationService = {
  getAll: (params) => api.get('/conversations', { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  getOrCreate: (contactId) => api.post('/conversations', { contactId }),
  updateStatus: (id, status) => api.patch(`/conversations/${id}/status`, { status }),
  delete: (id) => api.delete(`/conversations/${id}`),
  getStats: () => api.get('/conversations/stats')
};

// Mensagens
export const messageService = {
  getByConversation: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  sendText: (conversationId, content) => api.post(`/messages/${conversationId}/text`, { content }),
  sendMedia: (conversationId, data) => api.post(`/messages/${conversationId}/media`, data)
};

// Tags
export const tagService = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`)
};

// Funil
export const funnelService = {
  getAll: () => api.get('/funnel'),
  create: (data) => api.post('/funnel', data),
  update: (id, data) => api.put(`/funnel/${id}`, data),
  delete: (id) => api.delete(`/funnel/${id}`),
  reorder: (stages) => api.post('/funnel/reorder', { stages }),
  moveContact: (contactId, stageId) => api.post('/funnel/move-contact', { contactId, stageId })
};

// Evolution API
export const evolutionService = {
  getStatus: () => api.get('/evolution/status'),
  getQRCode: () => api.get('/evolution/qrcode'),
  createInstance: (instanceName) => api.post('/evolution/instance', { instanceName }),
  logout: () => api.post('/evolution/logout'),
  checkNumber: (phone) => api.post('/evolution/check-number', { phone })
};

export default api;
