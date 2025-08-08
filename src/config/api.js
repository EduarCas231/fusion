// Configuración de URLs de API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://apislab.duckdns.org';

const API = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    verify: `${API_BASE_URL}/auth/verify`,
  },
  pedidos: {
    getAll: `${API_BASE_URL}/pedidos`,
    getById: (id) => `${API_BASE_URL}/pedidos/${id}`,
    create: `${API_BASE_URL}/pedidos`,
    update: (id) => `${API_BASE_URL}/pedidos/${id}`,
    delete: (id) => `${API_BASE_URL}/pedidos/${id}`,
  },
  news: {
    getAll: `${API_BASE_URL}/news`,
    getById: (id) => `${API_BASE_URL}/news/${id}`,
    create: `${API_BASE_URL}/news`,
    update: (id) => `${API_BASE_URL}/news/${id}`,
    delete: (id) => `${API_BASE_URL}/news/${id}`,
  },
  visitas: {
    getAll: `${API_BASE_URL}/visitam`,
    getById: (id) => `${API_BASE_URL}/visitam/${id}`,
    getByCode: (codigo) => `${API_BASE_URL}/visitam/codigo/${encodeURIComponent(codigo)}`,
    markScanned: (id) => `${API_BASE_URL}/visitam/${id}/escaneado`,
    create: `${API_BASE_URL}/visitam`,
    update: (id) => `${API_BASE_URL}/visitam/${id}`,
    delete: (id) => `${API_BASE_URL}/visitam/${id}`,
  },
  notificaciones: {
    getAll: `${API_BASE_URL}/notificaciones`,
    markAsRead: (id) => `${API_BASE_URL}/notificaciones/${id}/read`,
    markAllAsRead: `${API_BASE_URL}/notificaciones/read-all`,
    getUnreadCount: `${API_BASE_URL}/notificaciones/unread-count`,
    deleteByVisitaId: (visitaId) => `${API_BASE_URL}/notificaciones/visita/${visitaId}`,
  },
  users: {
    getAll: `${API_BASE_URL}/users`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
  }
};

export default API;
