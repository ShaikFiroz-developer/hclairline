import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const Register = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    name: '', 
    age: '', 
    gender: '', 
    location: '', 
    phone: '', 
    role: 'customer'
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // digits only, no leading +
      const sanitized = value.replace(/\D/g, '').slice(0, 15);
      setFormData({ ...formData, phone: sanitized });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) e.email = 'Enter a valid email address';
    if (!formData.password || formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!formData.name || formData.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 18 || ageNum > 120) e.age = 'Age must be between 18 and 120';
    if (!['M', 'F'].includes(formData.gender)) e.gender = 'Select a gender';
    if (!formData.location || formData.location.trim().length < 2) e.location = 'Enter a valid location';
    // Indian numbers: either 10 digits (local) or 12 digits starting with 91 (country code without +)
    if (!/^(91\d{10}|\d{10})$/.test(formData.phone.trim())) e.phone = 'Enter 10 digits (local) or 91 + 10 digits (no +)';
    if (!['customer', 'employee'].includes(formData.role)) e.role = 'Select a valid role';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Live password strength meter
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || '';
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 10) score++;
    if (score <= 1) return { label: 'Weak', color: 'text-red-600' };
    if (score <= 3) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Strong', color: 'text-green-600' };
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage('');
    if (!validate()) return;
    try {
      await authAPI.register(formData);
      setMessage('Registered successfully');
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`max-w-md mx-auto p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full p-3 mb-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
          required
          aria-invalid={!!errors.email}
        />
        {submitted && errors.email && <p className="text-red-600 text-sm mb-2">{errors.email}</p>}
        <div className="relative mb-2">
          <input 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            value={formData.password} 
            onChange={handleChange}
            placeholder="Password" 
            className={`w-full p-3 pr-12 border rounded ${errors.password ? 'border-red-500' : ''}`} 
            required 
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {/* Live password strength */}
        {formData.password && (
          <p className={`text-sm mb-2 ${passwordStrength.color}`}>Strength: {passwordStrength.label}</p>
        )}
        {submitted && errors.password && <p className="text-red-600 text-sm mb-2">{errors.password}</p>}
        <input 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          placeholder="Name" 
          className={`w-full p-3 mb-2 border rounded ${errors.name ? 'border-red-500' : ''}`} 
          required 
          aria-invalid={!!errors.name}
        />
        {submitted && errors.name && <p className="text-red-600 text-sm mb-2">{errors.name}</p>}
        <input 
          name="age" 
          type="number" 
          value={formData.age} 
          onChange={handleChange}
          placeholder="Age" 
          className={`w-full p-3 mb-2 border rounded ${errors.age ? 'border-red-500' : ''}`} 
          required 
          aria-invalid={!!errors.age}
        />
        {submitted && errors.age && <p className="text-red-600 text-sm mb-2">{errors.age}</p>}
        <select 
          name="gender" 
          value={formData.gender} 
          onChange={handleChange}
          className={`w-full p-3 mb-2 border rounded ${errors.gender ? 'border-red-500' : ''}`} 
          required
          aria-invalid={!!errors.gender}
        >
          <option value="">Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        {submitted && errors.gender && <p className="text-red-600 text-sm mb-2">{errors.gender}</p>}
        <input 
          name="location" 
          value={formData.location} 
          onChange={handleChange}
          placeholder="Location" 
          className={`w-full p-3 mb-2 border rounded ${errors.location ? 'border-red-500' : ''}`} 
          required 
          aria-invalid={!!errors.location}
        />
        {submitted && errors.location && <p className="text-red-600 text-sm mb-2">{errors.location}</p>}
        <input 
          name="phone" 
          type="tel"
          inputMode="numeric"
          value={formData.phone} 
          onChange={handleChange}
          placeholder="Phone (10 digits or 91 + 10 digits)" 
          className={`w-full p-3 mb-2 border rounded ${errors.phone ? 'border-red-500' : ''}`} 
          required 
          aria-invalid={!!errors.phone}
          pattern="^(91\\d{10}|\\d{10})$"
          title="Enter 10 digits (local) or 91 followed by 10 digits (numbers only)"
          maxLength={12}
        />
        {/* Live phone validation */}
        {errors.phone && <p className="text-red-600 text-sm mb-2">{errors.phone}</p>}
        <select 
          name="role" 
          value={formData.role} 
          onChange={handleChange}
          className={`w-full p-3 mb-4 border rounded ${errors.role ? 'border-red-500' : ''}`} 
          required
          aria-invalid={!!errors.role}
        >
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
        </select>
        {submitted && errors.role && <p className="text-red-600 text-sm mb-2">{errors.role}</p>}
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          type="submit" 
          className="w-full bg-indigo-600 text-white p-3 rounded"
        >
          Register
        </motion.button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </motion.div>
  );
};

export default Register;
