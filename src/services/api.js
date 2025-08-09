const API_BASE_URL = '/api';

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log('API Request:', url);

  // Get token from localStorage
  const getToken = () => {
    const session = localStorage.getItem('entreprise_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed.token;
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
    return null;
  };

  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    console.log('API Response status:', response.status);
    
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

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
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

// Services pour les employés
export const employesService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/employes${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/employes/${id}`),

  getByEntreprise: (entrepriseId) => apiRequest(`/employes?entreprise_id=${entrepriseId}`),

  create: (data) => apiRequest('/employes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/employes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/employes/${id}`, {
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

export const seancesService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/seances${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/seances/${id}`),
  getByFormation: (formationId) => apiRequest(`/seances?formation_id=${formationId}`),
  create: (data) => apiRequest('/seances', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/seances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/seances/${id}`, {
    method: 'DELETE',
  }),
};

export const groupesService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/groupes${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/groupes/${id}`),
  getBySeance: (seanceId) => apiRequest(`/groupes?seance_id=${seanceId}`),
  getWithParticipants: (id) => apiRequest(`/groupes/${id}/participants`),
  create: (data) => apiRequest('/groupes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/groupes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/groupes/${id}`, {
    method: 'DELETE',
  }),
};

export const seanceMediaService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/seance-media${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/seance-media/${id}`),
  getBySeance: (seanceId) => apiRequest(`/seance-media/seance/${seanceId}`),
  upload: (seanceId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);

    return fetch(`${API_BASE_URL}/seance-media/seance/${seanceId}/upload`, {
      method: 'POST',
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
  update: (id, data) => apiRequest(`/seance-media/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/seance-media/${id}`, {
    method: 'DELETE',
  }),
  getDownloadUrl: (id) => `${API_BASE_URL}/seance-media/${id}/download`,
  getStats: () => apiRequest('/seance-media/stats/global'),
  getStatsBySeance: (seanceId) => apiRequest(`/seance-media/stats/seance/${seanceId}`),
};

// Services pour les participants
export const participantsService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/participants${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/participants/${id}`),
  getByGroupe: (groupeId) => apiRequest(`/participants/groupe/${groupeId}`),
  create: (data) => apiRequest('/participants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createBulk: (data) => apiRequest('/participants/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/participants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/participants/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => apiRequest('/participants/stats'),
  getStatsByFormation: (formationId) => apiRequest(`/participants/stats/formation/${formationId}`),

  // Presence management
  getPresenceByFormation: (formationId) => apiRequest(`/participants/formation/${formationId}/presence`),
  getPresenceBySeance: (seanceId) => apiRequest(`/participants/seance/${seanceId}/presence`),
  getPresenceStats: (groupeId) => apiRequest(`/participants/groupe/${groupeId}/stats`),
  updatePresence: (participantId, present) => apiRequest(`/participants/${participantId}/presence`, {
    method: 'PUT',
    body: JSON.stringify({ present }),
  }),
  updateMultiplePresence: (updates) => apiRequest('/participants/presence/bulk', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  }),
};

// Services pour les enseignants
export const enseignantsService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, value);
    });
    const queryString = params.toString();
    return apiRequest(`/enseignants${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/enseignants/${id}`),
  getActive: () => apiRequest('/enseignants/active'),
  getWithGroups: (id) => apiRequest(`/enseignants/${id}/groupes`),
  create: (data) => apiRequest('/enseignants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/enseignants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/enseignants/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => apiRequest('/enseignants/stats'),
};

// Services Notifications (Emails & WhatsApp)
export const notificationsService = {
  sendEmailToEnterprises: ({ ids = [], subject, message }) =>
    apiRequest('/notifications/email', {
      method: 'POST',
      body: JSON.stringify({ scope: 'entreprise', targetIds: ids, subject, message })
    }),
  sendEmailToEmployees: ({ ids = [], subject, message }) =>
    apiRequest('/notifications/email', {
      method: 'POST',
      body: JSON.stringify({ scope: 'employe', targetIds: ids, subject, message })
    }),
  sendWhatsappToEnterprises: ({ ids = [], message }) =>
    apiRequest('/notifications/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ scope: 'entreprise', targetIds: ids, message })
    }),
  sendWhatsappToEmployees: ({ ids = [], message }) =>
    apiRequest('/notifications/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ scope: 'employe', targetIds: ids, message })
    }),
};

// Services pour la configuration (.env)
export const settingsService = {
  get: () => apiRequest('/settings'),
  update: (data) => apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Generic API object for axios-like usage (defined at the end to avoid circular references)
export const api = {
  get: async (endpoint) => {
    const data = await apiRequest(endpoint);
    return { data };
  },
  post: async (endpoint, requestData) => {
    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return { data };
  },
  put: async (endpoint, requestData) => {
    const data = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return { data };
  },
  delete: async (endpoint) => {
    const data = await apiRequest(endpoint, {
      method: 'DELETE',
    });
    return { data };
  },
  // Add services as properties for backward compatibility
  formationsService,
  entreprisesService,
  employesService,
  inscriptionsService,
  dashboardService,
  healthService,
  seancesService,
  groupesService,
  seanceMediaService,
  participantsService,
  enseignantsService,
  settingsService,
};
