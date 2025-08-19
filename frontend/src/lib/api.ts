import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token ajouté à la requête:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Aucun token trouvé dans localStorage');
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 422) {
      console.log('Validation errors:', error.response.data);
    } else if (error.response?.status === 401) {
      console.error('🚫 Erreur 401 Unauthorized - Token invalide ou manquant');
      console.error('Headers de la requête:', error.config.headers);
      console.error('Token localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');
    }
    return Promise.reject(error);
  }
);

export default api;
