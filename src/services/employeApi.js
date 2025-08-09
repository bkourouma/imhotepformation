const API_BASE = '/api/employe';

export const employeApi = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur de connexion');
    }
    
    return response.json();
  },

  // Get formations for employee
  getFormations: async (employeId) => {
    const response = await fetch(`${API_BASE}/formations/${employeId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des formations');
    }
    
    return response.json();
  },

  // Get seances for employee
  getSeances: async (employeId) => {
    const response = await fetch(`${API_BASE}/seances/${employeId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des séances');
    }
    
    return response.json();
  },

  // Get media for a seance
  getSeanceMedia: async (seanceId) => {
    const response = await fetch(`${API_BASE}/seances/${seanceId}/media`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des media');
    }
    
    return response.json();
  },

  // Record media access
  recordMediaAccess: async (mediaId, employeId) => {
    const response = await fetch(`${API_BASE}/media/${mediaId}/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employe_id: employeId }),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement de l\'accès');
    }
    
    return response.json();
  },

  // Get access history for employee
  getAccessHistory: async (employeId, limit = 50) => {
    const response = await fetch(`${API_BASE}/history/${employeId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
    
    return response.json();
  },

  // Evaluation functions
  validateSeanceForEvaluation: async (seanceId) => {
    const response = await fetch(`/api/evaluations/validate-seance/${seanceId}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la validation de la séance');
    }

    return response.json();
  },

  createEvaluation: async (data) => {
    const response = await fetch('/api/evaluations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de l\'évaluation');
    }
    
    return response.json();
  },

  getEvaluationsBySeance: async (seanceId, employeId) => {
    const response = await fetch(`/api/evaluations/seance/${seanceId}?employeId=${employeId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des évaluations');
    }
    
    return response.json();
  },

  getEvaluationDetails: async (evaluationId) => {
    const response = await fetch(`/api/evaluations/${evaluationId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'évaluation');
    }
    
    return response.json();
  },

  startEvaluation: async (evaluationId, employeId) => {
    const response = await fetch(`/api/evaluations/${evaluationId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employe_id: employeId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors du démarrage de l\'évaluation');
    }
    
    return response.json();
  },

  submitEvaluation: async (evaluationId, data) => {
    const response = await fetch(`/api/evaluations/${evaluationId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la soumission de l\'évaluation');
    }
    
    return response.json();
  },

  getEvaluationAttempts: async (employeId, limit = 50) => {
    const response = await fetch(`/api/evaluations/attempts/${employeId}?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tentatives');
    }

    return response.json();
  },

  getEvaluationAttemptDetails: async (employeId, attemptId) => {
    const response = await fetch(`/api/evaluations/attempts/${employeId}/${attemptId}/details`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails de la tentative');
    }

    return response.json();
  },
};
