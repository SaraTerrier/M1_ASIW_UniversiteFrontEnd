/**
 * Configuration centralisée d'Axios pour les appels API
 * 
 * Ce fichier configure une instance Axios avec :
 * - L'URL de base de l'API depuis les variables d'environnement
 * - Les en-têtes par défaut pour toutes les requêtes
 * - Un intercepteur pour injecter automatiquement le token d'authentification
 */

import axios from 'axios';

/**
 * Instance Axios préconfigurée pour communiquer avec l'API backend
 * 
 * Configuration :
 * - baseURL : URL de base de l'API définie dans VITE_API_URL (.env)
 * - headers : En-têtes par défaut (Content-Type: application/json)
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Intercepteur de requêtes HTTP
 * 
 * Injecte automatiquement le token d'authentification dans toutes les requêtes :
 * 1. Récupère le token depuis localStorage (authToken) si disponible
 * 2. Sinon, utilise la clé API par défaut (VITE_API_KEY) depuis les variables d'environnement
 * 3. Ajoute le token dans l'en-tête Authorization au format Bearer
 */
apiClient.interceptors.request.use(
    (config) => {
        // Récupération du token : priorité à authToken, sinon VITE_API_KEY
        const token = localStorage.getItem('authToken') || import.meta.env.VITE_API_KEY;
        
        // Injection du token dans l'en-tête Authorization si disponible
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Propagation de l'erreur en cas de problème lors de l'interception
        return Promise.reject(error);
    }
);

export default apiClient;