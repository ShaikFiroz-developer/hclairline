import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Normalize various backend user shapes to a consistent frontend shape
  const normalizeUser = (data) => {
    if (!data || typeof data !== 'object') return null;
    return {
      // prefer lowercase keys if provided by verify_otp response
      email: data.email || data.Email || '',
      role: (data.role || data.Role || '').toLowerCase(),
      name: data.name || data.Name || '',
      age: data.age || data.Age,
      gender: data.gender || data.Gender,
      location: data.location || data.Location,
      phone: data.phone || data['Phone Number'],
      // keep raw for any other consumers if needed
      _raw: data,
    };
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile using shared API (token picked from localStorage by interceptor)
      const fetchUserProfile = async () => {
        try {
          const response = await api.get('/profile');
          setUser(normalizeUser(response.data));
        } catch (err) {
          console.error('Error fetching user profile:', err);
          logout();
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Login function - just initiates OTP flow
  const login = async (email, password, role = 'customer') => {
    try {
      setError(null);
      const response = await api.post('/login', {
        email,
        password,
        role
      });
      
      return { success: true, message: response.data.msg };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear user from state
    setUser(null);
    
    // Redirect to login
    navigate('/login');
  };

  // Verify OTP and complete login
  const verifyOtp = async (email, otp, role) => {
    try {
      setError(null);
      const response = await api.post('/verify_otp', {
        email,
        otp,
        role
      });
      
      const { access_token, user: userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set user in state
      setUser(normalizeUser(userData));
      
      // Redirect based on role
      const r = (userData.role || '').toLowerCase();
      if (r === 'customer') navigate('/customer/dashboard');
      else if (r === 'employee') navigate('/employee/dashboard');
      else navigate('/login');
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      await api.post('/register', userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      await api.put('/profile', profileData);
      // Refetch profile to ensure we have latest and normalized user
      const refreshed = await api.get('/profile');
      setUser(normalizeUser(refreshed.data));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    error,
    login,
    logout,
    verifyOtp,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export default as component to make Fast Refresh happy
export default AuthProvider;
// Export the context as a named export (useAuth is already exported above)
export { AuthContext };
