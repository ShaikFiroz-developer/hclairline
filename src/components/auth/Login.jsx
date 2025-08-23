import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = ({ darkMode }) => {
  const { login, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateLogin = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) e.email = 'Enter a valid email address';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!['customer', 'employee'].includes(role)) e.role = 'Select a valid role';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateLogin()) return;
    
    try {
      setIsSubmitting(true);
      const result = await login(email, password, role);
      if (result.success) {
        setMessage('OTP has been sent to your email');
        setShowOtp(true);
      } else {
        setMessage(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateOtp = () => {
    const e = {};
    const otpTrim = otp.trim();
    if (!/^\d{4,8}$/.test(otpTrim)) e.otp = 'Enter a valid numeric OTP (4-8 digits)';
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateOtp()) return;

    try {
      setIsVerifying(true);
      const result = await verifyOtp(email, otp.trim(), role);
      if (result.success) {
        // Redirect is handled by AuthContext
      } else {
        setMessage(result.error || 'Failed to verify OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setMessage('An error occurred during OTP verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`max-w-md mx-auto p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
      {!showOtp ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateLogin}
            placeholder="Email"
            className={`w-full p-3 mb-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
            required
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-red-600 text-sm mb-2">{errors.email}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validateLogin}
            placeholder="Password"
            className={`w-full p-3 mb-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
            required
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-red-600 text-sm mb-2">{errors.password}</p>}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onBlur={validateLogin}
            className={`w-full p-3 mb-4 border rounded ${errors.role ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.role}
          >
            <option value="customer">Customer</option>
            <option value="employee">Employee</option>
          </select>
          {errors.role && <p className="text-red-600 text-sm mb-4">{errors.role}</p>}
          <motion.button 
            whileHover={!isSubmitting ? { scale: 1.05 } : {}} 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full bg-indigo-600 text-white p-3 rounded ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </span>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onBlur={validateOtp}
            placeholder="OTP"
            className={`w-full p-3 mb-2 border rounded ${errors.otp ? 'border-red-500' : ''}`}
            required
            aria-invalid={!!errors.otp}
            inputMode="numeric"
            pattern="\\d*"
          />
          {errors.otp && <p className="text-red-600 text-sm mb-2">{errors.otp}</p>}
          <motion.button 
            whileHover={!isVerifying ? { scale: 1.05 } : {}} 
            type="submit" 
            disabled={isVerifying}
            className={`w-full bg-indigo-600 text-white p-3 rounded ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </motion.button>
        </form>
      )}
      {message && <p className="mt-4 text-center">{message}</p>}
    </motion.div>
  );
};

export default Login;
