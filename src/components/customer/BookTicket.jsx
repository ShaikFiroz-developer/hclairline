import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const BookTicket = ({ darkMode }) => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selected = location.state || null;
  
  const [formData, setFormData] = useState({
    flight_name: selected?.flight_name || (flightId || ''),
    class: (selected?.classType || 'economy'),
    seats_requested: 1,
    passengers: [{ name: '', age: '', gender: '' }]
  });
  
  const [flightDetails, setFlightDetails] = useState(selected);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // no airports mapping needed; backend uses city names already
  
  // If user navigated directly without state, allow manual flight_name entry
  useEffect(() => {
    if (!selected && !flightId) {
      setFlightDetails(null);
    }
  }, [selected, flightId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If class changes, ensure passenger count doesn't exceed available seats for that class
    if (name === 'class') {
      const nextClass = value;
      const nextAvailable = nextClass === 'business'
        ? Number(flightDetails?.business_available ?? flightDetails?.seatsAvailable ?? Infinity)
        : Number(flightDetails?.economy_available ?? flightDetails?.seatsAvailable ?? Infinity);
      const nextPassengers = [...formData.passengers];
      if (nextAvailable !== Infinity && nextPassengers.length > nextAvailable) {
        nextPassengers.length = nextAvailable; // trim extra passengers
      }
      setFormData({
        ...formData,
        class: nextClass,
        seats_requested: nextPassengers.length,
        passengers: nextPassengers,
      });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handlePassengerChange = (index, e) => {
    const passengers = [...formData.passengers];
    passengers[index][e.target.name] = e.target.value;
    setFormData({ ...formData, passengers });
  };

  const addPassenger = () => {
    const limit = availableSeats ?? Infinity;
    if (formData.passengers.length >= limit) return;
    setFormData({
      ...formData,
      seats_requested: formData.seats_requested + 1,
      passengers: [...formData.passengers, { name: '', age: '', gender: '' }]
    });
  };

  const removePassenger = (index) => {
    const passengers = [...formData.passengers];
    passengers.splice(index, 1);
    setFormData({
      ...formData,
      seats_requested: formData.seats_requested - 1,
      passengers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Backend expects: flight_name, class, seats_requested, passengers
      const bookingData = {
        flight_name: formData.flight_name,
        class: formData.class,
        seats_requested: formData.seats_requested,
        passengers: formData.passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age, 10),
          gender: p.gender
        }))
      };
      
      await bookingsAPI.book(bookingData);
      
      toast.success('Booking successful!');
      setMessage({ text: '', type: '' });
      
      // Redirect to bookings page after a short delay
      setTimeout(() => {
        navigate('/customer/bookings');
      }, 1200);
      
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || error.message || 'Failed to book ticket';
      setMessage({ 
        text: errorMessage,
        type: 'error' 
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Derived values from selected flight
  const unitPrice = React.useMemo(() => {
    if (!flightDetails) return 0;
    return formData.class === 'business'
      ? Number(flightDetails.business_cost || 0)
      : Number(flightDetails.economy_cost || 0);
  }, [flightDetails, formData.class]);

  const availableSeats = React.useMemo(() => {
    if (!flightDetails) return undefined;
    return formData.class === 'business'
      ? Number(flightDetails.business_available ?? flightDetails.seatsAvailable ?? 0)
      : Number(flightDetails.economy_available ?? flightDetails.seatsAvailable ?? 0);
  }, [flightDetails, formData.class]);

  if (loading && !flightDetails && flightId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`max-w-3xl mx-auto p-8 md:p-10 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-center tracking-tight">
        {flightDetails ? 'Complete Your Booking' : 'Book a Flight'}
      </h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!flightDetails && (
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Flight Name/Number</label>
            <input 
              name="flight_name" 
              value={formData.flight_name} 
              onChange={handleChange} 
              placeholder="Enter flight number" 
              className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              required 
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-base font-semibold mb-2">Class</label>
          <select 
            name="class" 
            value={formData.class} 
            onChange={handleChange} 
            className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            required
          >
            <option value="economy">Economy Class</option>
            <option value="business">Business Class</option>
          </select>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Passenger Details</h3>
            <button
              type="button"
              onClick={addPassenger}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={(availableSeats !== undefined && formData.passengers.length >= availableSeats) || formData.passengers.length >= 9}
            >
              + Add Passenger
            </button>
          </div>
          
          {formData.passengers.map((passenger, index) => (
            <div key={index} className={`mb-6 p-5 border rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg">Passenger {index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">Full Name</label>
                  <input 
                    name="name"
                    value={passenger.name} 
                    onChange={(e) => handlePassengerChange(index, e)} 
                    placeholder="Full name as per ID" 
                    className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">Age</label>
                    <input 
                      name="age"
                      type="number" 
                      min="1"
                      max="120"
                      value={passenger.age} 
                      onChange={(e) => handlePassengerChange(index, e)} 
                      placeholder="Age" 
                      className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">Gender</label>
                    <select 
                      name="gender"
                      value={passenger.gender} 
                      onChange={(e) => handlePassengerChange(index, e)} 
                      className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      required
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
        
        {flightDetails && (
          <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-5 rounded-xl mb-6 border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
            <h3 className="font-bold mb-3 text-lg">Flight Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600 dark:text-gray-300">Flight:</div>
              <div className="font-medium">{flightDetails.flight_name}</div>
              <div className="text-gray-600 dark:text-gray-300">From:</div>
              <div className="font-medium">{flightDetails.source}</div>
              <div className="text-gray-600 dark:text-gray-300">To:</div>
              <div className="font-medium">{flightDetails.destination}</div>
              <div className="text-gray-600 dark:text-gray-300">Date:</div>
              <div className="font-medium">{flightDetails.start_time?.split(' ')?.[0] || ''}</div>
              <div className="text-gray-600 dark:text-gray-300">Available Seats:</div>
              <div className="font-medium">{availableSeats ?? '-'}</div>
            </div>
            {availableSeats !== undefined && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                You can add up to <span className="font-semibold">{availableSeats}</span> passenger{availableSeats === 1 ? '' : 's'} for {formData.class}.
              </p>
            )}
          </div>
        )}
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-5 rounded-xl mb-6`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-300">Passengers:</span>
            <span className="font-medium">{formData.passengers.length}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-300">Class:</span>
            <span className="font-medium capitalize">{formData.class}</span>
          </div>
          {flightDetails && (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Price per Seat:</span>
                <span className="font-medium">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-extrabold text-xl pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <span>Total Price:</span>
                <span>${(unitPrice * formData.passengers.length).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 px-4 rounded-xl font-bold transition duration-200 shadow ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
    </motion.div>
  );
};

export default BookTicket;
