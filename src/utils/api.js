import axios from 'axios';
import { showLoader, hideLoader } from './loading';

//https://pythonserver-cqyu.onrender.com
//http://localhost:5000
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
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    const isAuthEndpoint = /\/login$|\/verify_otp$/.test(reqUrl);
    if (status === 401) {
      const token = localStorage.getItem('token');
      // Only force-redirect on protected calls when a token exists and it's not an auth endpoint
      if (token && !isAuthEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return; // stop further handling
      }
      // For auth endpoints, let the caller handle and show proper error message
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
  // New: suggestions for origin/destination typing
  suggest: ({ field = 'source', q = '', limit = 15 } = {}) =>
    api.get('/flights/suggestions', { params: { field, q, limit } }),
  // New: list upcoming flights for employees
  active: () => api.get('/flights/active'),
  // New: export registered users for a flight (CSV) and get cancel nonce
  exportRegistrations: async (flightId) => {
    // We use a dedicated axios call to fetch blob and read headers
    const resp = await api.get(`/flights/${flightId}/registrations/export`, {
      responseType: 'blob',
      // allow reading custom header via CORS expose_headers
      // headers are already set in api instance
    });
    return resp; // caller will handle file save and read X-Cancel-Nonce
  },
  // New: cancel a flight with the nonce enforced by backend
  cancel: (flightId, cancelNonce) => api.post(`/flights/${flightId}/cancel`, { cancel_nonce: cancelNonce }),
  // New: force-cancel a flight (bypass nonce) for employee workflow during Force Bad
  cancelForce: (flightId) => api.post(`/flights/${flightId}/cancel`, { force: true }),
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
  check: (ids = []) => {
    if (ids && ids.length) {
      const qs = encodeURIComponent(ids.join(','));
      return api.get(`/weather/check?ids=${qs}`);
    }
    return api.get('/weather/check');
  },
  // New: force bad weather for demo (selected ids or all)
  forceBad: (mode = 'selected', flightIds = []) => api.post('/weather/force_bad', { mode, flight_ids: flightIds }),
};

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
