import React, { useState } from 'react';
import { flightsAPI } from '../../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddFlight = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    flight_name: '',
    source: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    business_total: 0,
    economy_total: 0,
    business_cost: 0,
    economy_cost: 0,
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Avoid NaN during typing; coerce later on submit
      [name]: type === 'number' ? (value === '' ? '' : value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Convert datetime-local (YYYY-MM-DDTHH:mm) to backend expected dd/MM/YYYY HH:mm
      const toBackendDate = (val) => {
        if (!val) return '';
        // val like 2025-08-24T11:58
        const [datePart, timePart] = val.split('T');
        if (!datePart || !timePart) return val;
        const [y, m, d] = datePart.split('-');
        return `${d}/${m}/${y} ${timePart}`;
      };

      const payload = {
        flight_name: String(formData.flight_name || ''),
        source: String(formData.source || ''),
        destination: String(formData.destination || ''),
        start_time: toBackendDate(formData.departure_time),
        end_time: toBackendDate(formData.arrival_time),
        business_total: Number(formData.business_total || 0),
        economy_total: Number(formData.economy_total || 0),
        business_cost: Number(formData.business_cost || 0),
        economy_cost: Number(formData.economy_cost || 0),
      };

      const response = await flightsAPI.create(payload);
      
      setMessage({
        text: 'Flight added successfully!',
        type: 'success'
      });
      
      // Reset form after successful submission
      setFormData({
        flight_name: '',
        source: '',
        destination: '',
        departure_time: '',
        arrival_time: '',
        business_total: 0,
        economy_total: 0,
        business_cost: 0,
        economy_cost: 0,
      });
      
      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 1500);
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add flight. Please try again.';
      setMessage({
        text: errorMsg,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-3xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white ring-1 ring-black/5'} shadow`}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Flight</h2>
      
      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Flight Name</label>
            <input
              type="text"
              name="flight_name"
              value={formData.flight_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* Status removed as backend does not accept it */}
          
          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Departure Time</label>
            <input
              type="datetime-local"
              name="departure_time"
              value={formData.departure_time}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Arrival Time</label>
            <input
              type="datetime-local"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Business Total Seats</label>
            <input
              type="number"
              name="business_total"
              min="0"
              value={formData.business_total}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Economy Total Seats</label>
            <input
              type="number"
              name="economy_total"
              min="0"
              value={formData.economy_total}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Business Cost ($)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="business_cost"
                min="0"
                step="0.01"
                value={formData.business_cost}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Economy Cost ($)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="economy_cost"
                min="0"
                step="0.01"
                value={formData.economy_cost}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/employee/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.03 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add Flight'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddFlight;
