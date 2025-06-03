import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/me', userData);
    return response.data;
  },
  
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAllSalespersons: async () => {
    const response = await api.get('/salespersons');
    return response.data;
  },
  
  getNearbySalespersons: async (lat, lng) => {
    const response = await api.get(`/salespersons/nearby?lat=${lat}&lng=${lng}`);
    return response.data;
  },
};

// Admin User Management API
export const adminAPI = {
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// Location API
export const locationAPI = {
  updateLocation: async (lat, lng) => {
    const response = await api.post('/salesperson/location', { 
      latitude: lat, 
      longitude: lng 
    });
    return response.data;
  },
};

// Lead API
export const leadAPI = {
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },
  
  getLeads: async (skip = 0, limit = 100) => {
    const response = await api.get(`/leads?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// Assignment API
export const assignmentAPI = {
  assignLead: async (leadId, salespersonId, notes) => {
    const response = await api.post('/assign', {
      lead_id: leadId,
      salesperson_id: salespersonId,
      notes,
    });
    return response.data;
  },
  
  getAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },
};

// Utility functions
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export default api;
