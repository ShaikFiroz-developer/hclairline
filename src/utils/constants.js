// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_OTP: '/verify_otp',
    PROFILE: '/profile',
  },
  FLIGHTS: {
    BASE: '/flights',
    SEARCH: '/flights/search',
  },
  BOOKINGS: {
    BASE: '/bookings',
    CANCEL: (id) => `/bookings/${id}/cancel`,
    CUSTOMER: (id) => `/bookings/customer/${id}`,
  },
  CUSTOMERS: {
    BASE: '/customers',
  },
  WEATHER: {
    BASE: '/weather',
  },
  STATS: {
    BOOKINGS: '/stats/bookings',
    REVENUE: '/stats/revenue',
    ROUTES: '/stats/routes',
  },
};

// Form field options
export const FORM_OPTIONS = {
  GENDER: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  
  TITLE: [
    { value: 'mr', label: 'Mr.' },
    { value: 'mrs', label: 'Mrs.' },
    { value: 'ms', label: 'Ms.' },
    { value: 'dr', label: 'Dr.' },
    { value: 'prof', label: 'Prof.' },
  ],
  
  COUNTRIES: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    // Add more countries as needed
  ],
  
  SEAT_CLASS: [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
  ],
  
  MEAL_PREFERENCE: [
    { value: 'regular', label: 'Regular' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten_free', label: 'Gluten Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
  ],
  
  BAGGAGE_OPTIONS: [
    { value: 'none', label: 'No Checked Baggage' },
    { value: '15kg', label: '15kg Checked Baggage' },
    { value: '20kg', label: '20kg Checked Baggage' },
    { value: '30kg', label: '30kg Checked Baggage' },
  ],
};

// Flight related constants
export const FLIGHT_CONSTANTS = {
  MAX_PASSENGERS: 9,
  MAX_INFANTS: 2,
  MAX_CHILDREN: 8,
  MIN_ADULTS: 1,
  MAX_ADULTS: 9,
  MAX_STOPS: 3,
  CABIN_CLASSES: ['economy', 'premium_economy', 'business', 'first'],
  BAGGAGE_ALLOWANCE: {
    economy: 20,
    premium_economy: 25,
    business: 32,
    first: 40,
  },
};

// Date and time formats
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATE_TIME: 'YYYY-MM-DD HH:mm',
  DATE_TIME_12H: 'MMM D, YYYY h:mm A',
  DATE_LONG: 'dddd, MMMM D, YYYY',
  TIME_12H: 'h:mm A',
  TIME_24H: 'HH:mm',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  DARK_MODE: 'dark_mode',
  RECENT_SEARCHES: 'recent_searches',
  PREFERENCES: 'user_preferences',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You need to be logged in to access this page.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  BOOKING_SUCCESS: 'Your booking has been confirmed!',
  CANCELLATION_SUCCESS: 'Your booking has been cancelled.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully!',
};

// Animation constants
export const ANIMATION = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
    EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
};

export default {
  API_ENDPOINTS,
  FORM_OPTIONS,
  FLIGHT_CONSTANTS,
  DATE_FORMATS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ANIMATION,
  BREAKPOINTS,
};
