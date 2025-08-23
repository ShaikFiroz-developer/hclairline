import axios from 'axios';
import { showLoader, hideLoader } from './loading';

const API_BASE_URL = 'https://pythonserver-cqyu.onrender.com';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    showLoader();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    hideLoader();
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    hideLoader();
    return response;
  },
  (error) => {
    hideLoader();
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  verifyOtp: (data) => api.post('/verify_otp', data),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

// Flights API
export const flightsAPI = {
  // Backend expects POST body with { source, destination }
  search: (searchParams) => api.post('/flights/search', searchParams),
  // Implemented on backend: POST /flights (employee only)
  create: (flightData) => api.post('/flights', flightData),
};

// Bookings API
export const bookingsAPI = {
  book: (bookingData) => api.post('/bookings/book', bookingData),
  getBookings: () => api.get('/bookings'),
  cancelBooking: (bookingId) => api.post('/bookings/cancel', { booking_id: bookingId }),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
};

// Weather API
export const weatherAPI = {
  getForecast: (location) => api.get('/weather', { params: { location } }),
  check: () => api.get('/weather/check'),
};

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
