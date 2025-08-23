import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    location: '',
    passport_number: '',
    address: '',
    emergency_contact: '',
    preferences: {
      seat_preference: '',
      meal_preference: '',
      newsletter: false
    }
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        setFormData(prev => ({
          ...prev,
          ...response.data,
          preferences: {
            ...prev.preferences,
            ...(response.data.preferences || {})
          }
        }));
      } catch (error) {
        setMessage({ 
          text: 'Error fetching profile', 
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error updating profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md text-center font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>
                <p className="text-sm mt-1 text-gray-500">
                  Update your personal details and contact information
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-800"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                  <option value="P">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Passport Number
                </label>
                <input
                  name="passport_number"
                  value={formData.passport_number || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Contact
                </label>
                <input
                  name="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4 text-gray-900">
                Travel Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Seat Preference
                  </label>
                  <select
                    name="preferences.seat_preference"
                    value={formData.preferences?.seat_preference || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">No preference</option>
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                    <option value="middle">Middle</option>
                    <option value="exit_row">Exit Row</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Meal Preference
                  </label>
                  <select
                    name="preferences.meal_preference"
                    value={formData.preferences?.meal_preference || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">No preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten_free">Gluten-Free</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="diabetic">Diabetic</option>
                    <option value="child">Child Meal</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="preferences.newsletter"
                    checked={formData.preferences?.newsletter || false}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                      !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  />
                  <label 
                    htmlFor="newsletter" 
                    className="text-sm text-gray-700"
                  >
                    Subscribe to newsletter
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4 text-gray-900">
                Change Password
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to keep current password
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    placeholder="••••••••"
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      !isEditing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    fetchProfile();
                  }}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
