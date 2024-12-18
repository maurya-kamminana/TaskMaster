import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Base URL for the backend
});

// Add a request interceptor to inject the JWT token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage or secure cookie
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Functions for common API calls
const login = (credentials) => api.post('/auth/login', credentials);
const register = (userDetails) => api.post('/auth/register', userDetails);
const fetchProjects = () => api.get('/projects');
const fetchProjectDetails = (id) => api.get(`/projects/${id}`);
const fetchTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
const fetchNotifications = () => api.get('/notifications');
const refreshToken = () => api.post('/auth/refreshToken');

export {
  login,
  register,
  fetchProjects,
  fetchProjectDetails,
  fetchTasks,
  fetchNotifications,
  refreshToken,
};
