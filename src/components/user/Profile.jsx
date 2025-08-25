import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Profile = ({ darkMode, userRole = 'customer' }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        //https://pythonserver-cqyu.onrender.com
        const res = await axios.get('https://pythonserver-cqyu.onrender.com/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
        setFormData(res.data);
      } catch (err) {
        setMessage('Error fetching profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://pythonserver-cqyu.onrender.com/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Profile updated');
    } catch (err) {
      setMessage('Error updating profile');
    }
  };

  return (
    <div className={`min-h-[calc(100vh-200px)] w-full flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-2xl rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {userRole === 'customer' ? 'Customer' : 'Employee'} Profile
          </h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your profile information
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Passport field removed */}

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    darkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md ${
                message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              } ${darkMode ? '!bg-opacity-20' : ''}`}>
                {message}
              </div>
            )}

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                  darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
                }`}
              >
                Update Profile
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
