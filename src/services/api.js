const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API détaillée:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      throw new Error(errorData.error || errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Services pour les formations
export const formationsService = {
  getAll: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/formations${params}`);
  },

  getById: (id) => apiRequest(`/formations/${id}`),

  getPopular: () => apiRequest('/formations/popular'),

  create: (data) => apiRequest('/formations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/formations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/formations/${id}`, {
    method: 'DELETE',
  }),
};

// Services pour les entreprises
export const entreprisesService = {
  getAll: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/entreprises${params}`);
  },

  getById: (id) => apiRequest(`/entreprises/${id}`),

  getProfile: (id) => apiRequest(`/entreprises/${id}/profile`),

  create: (data) => apiRequest('/entreprises', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/entreprises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/entreprises/${id}`, {
    method: 'DELETE',
  }),
};

// Services pour les inscriptions
export const inscriptionsService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/inscriptions${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/inscriptions/${id}`),

  getRecent: (limit = 5, entrepriseId = null) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (entrepriseId) params.append('entreprise_id', entrepriseId);
    const queryString = params.toString();
    return apiRequest(`/inscriptions/recent${queryString ? `?${queryString}` : ''}`);
  },

  getStats: (entrepriseId = null) => {
    const params = entrepriseId ? `?entreprise_id=${entrepriseId}` : '';
    return apiRequest(`/inscriptions/stats${params}`);
  },

  create: (data) => apiRequest('/inscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/inscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/inscriptions/${id}`, {
    method: 'DELETE',
  }),
};

// Services pour le dashboard
export const dashboardService = {
  getData: (entrepriseId = null) => {
    const params = entrepriseId ? `?entreprise_id=${entrepriseId}` : '';
    return apiRequest(`/dashboard${params}`);
  },
  getFormationsStats: (entrepriseId = null) => {
    const params = entrepriseId ? `?entreprise_id=${entrepriseId}` : '';
    return apiRequest(`/dashboard/formations-stats${params}`);
  },
  getEntreprisesStats: () => apiRequest('/dashboard/entreprises-stats'),
};

// Service de santé de l'API
export const healthService = {
  check: () => apiRequest('/health'),
};
