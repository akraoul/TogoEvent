// Configuration de l'API pour TogoEvents
export const API_CONFIG = {
  // URL de l'API - utilise VITE_API_URL si défini, sinon fallback sur l'URL Vercel ou localhost
  API_URL: import.meta.env.VITE_API_URL || 'https://togoevent-backend.vercel.app',
  
  // Configuration pour le développement local
  DEV_API_URL: 'http://localhost:8001',
  
  // Timeout pour les requêtes API (en millisecondes)
  TIMEOUT: 10000,
  
  // Endpoint de base
  BASE_ENDPOINT: '/api',
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Fonction pour obtenir l'URL complète de l'API
  getApiUrl: (endpoint: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 
                   (import.meta.env.DEV ? API_CONFIG.DEV_API_URL : 'https://togoevent-backend.vercel.app');
    return `${baseUrl}${API_CONFIG.BASE_ENDPOINT}${endpoint}`;
  },
  
  // Fonction pour vérifier si l'API est disponible
  isApiAvailable: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.getApiUrl('/health')}`, {
        method: 'GET',
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.ok;
    } catch (error) {
      console.warn('API non disponible:', error);
      return false;
    }
  }
};

export default API_CONFIG;
