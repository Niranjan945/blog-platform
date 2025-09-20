// API Configuration for Production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  
  // Posts endpoints
  POSTS: '/api/posts',
  POST_BY_ID: (id) => `/api/posts/${id}`,
  
  // Users endpoints
  USER_PROFILE: '/api/users/profile',
  USER_BY_ID: (id) => `/api/users/${id}`,
  USER_POSTS: '/api/users/posts/me'
};

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

export default API_BASE_URL;
