import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsAPI.getBookings();
      const raw = response.data || [];
      // Normalize fields from backend to UI schema
      const normalized = raw.map((b) => ({
        booking_id: b.booking_id,
        flight_name: b.flight_name,
        flight_number: b.flight_name,
        class: b.class?.toLowerCase() || 'economy',
        seats_booked: Array.isArray(b.seats) ? b.seats.length : (b.seats_booked || 1),
        total_amount: b.total_cost ?? b.total_amount ?? 0,
        source: b.source,
        destination: b.destination,
        departure_time: b.start || b.departure_time,
        arrival_time: b.end || b.arrival_time,
        status: (b.status || 'confirmed').toLowerCase(),
        passengers: b.passengers || [],
      }));
      setBookings(normalized);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.msg || 'Error fetching bookings', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        setBookings(bookings.filter(b => b.booking_id !== bookingId));
        setMessage({ 
          text: 'Booking cancelled successfully', 
          type: 'success' 
        });
      } catch (error) {
        setMessage({ 
          text: error.response?.data?.msg || error.response?.data?.message || 'Error cancelling booking', 
          type: 'error' 
        });
      }
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Handle formats like 'dd/mm/YYYY HH:MM'
    if (/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/.test(dateString)) {
      const [d, m, y, hh, mm] = dateString.match(/\d+/g).map(Number);
      return new Date(y, m - 1, d, hh, mm);
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (dateString) => {
    const d = parseDate(dateString);
    if (!d) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString(undefined, options);
  };

  const filteredBookings = bookings.filter(booking => {
    if (!booking.departure_time) return false;
    const now = new Date();
    const departureDate = parseDate(booking.departure_time);
    if (!departureDate) return false;
    return activeTab === 'upcoming' ? departureDate > now : departureDate <= now;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
            Your Bookings
          </h1>
          <p className="text-gray-700">
            Manage your upcoming and past flight bookings
          </p>
        </div>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-md text-center font-medium shadow ring-1 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' 
              : 'bg-rose-50 text-rose-700 ring-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Trips
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${
                  activeTab === 'past'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past Trips
              </button>
            </nav>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">
              No {activeTab === 'upcoming' ? 'upcoming' : 'past'} bookings
            </h3>
            <p className="mb-6 text-gray-600">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming trips. Ready to plan your next adventure?" 
                : "Your past trips will appear here."}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => navigate('/customer/search')}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Search Flights
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.booking_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl shadow-lg overflow-hidden bg-white ring-1 ring-black/5"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.flight_name || 'Flight'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Booking ID: {booking.booking_id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : booking.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          }`}
                        >
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                        </span>
                        {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                          <button
                            onClick={() => handleCancel(booking.booking_id)}
                            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg ring-1 ring-black/5">
                        <h4 className="font-medium text-gray-700 border-b pb-2">
                          Flight Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Flight:</span>
                            <span className="text-gray-900 font-medium">
                              {booking.flight_number || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Class:</span>
                            <span className="capitalize text-gray-900 font-medium">
                              {booking.class || 'Economy'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Seats:</span>
                            <span className="text-gray-900 font-medium">
                              {booking.seats_booked || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg ring-1 ring-black/5">
                        <h4 className="font-medium text-gray-700 border-b pb-2">
                          Departure
                        </h4>
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900">
                            {booking.source_city || booking.source || 'N/A'}
                          </div>
                          <div className="text-gray-700">
                            {formatDate(booking.departure_time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Terminal: {booking.departure_terminal || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg ring-1 ring-black/5">
                        <h4 className="font-medium text-gray-700 border-b pb-2">
                          Arrival
                        </h4>
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900">
                            {booking.destination_city || booking.destination || 'N/A'}
                          </div>
                          <div className="text-gray-700">
                            {formatDate(booking.arrival_time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Terminal: {booking.arrival_terminal || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <span className="text-gray-600">Total Paid: </span>
                          <span className="ml-2 text-xl font-bold text-indigo-700">
                            ${(booking.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => navigate(`/customer/bookings/${booking.booking_id}`)}
                            className="w-full sm:w-auto px-4 py-2 rounded-md shadow text-sm font-semibold text-gray-700 bg-white ring-1 ring-black/5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Details
                          </button>
                          {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                            <button
                              onClick={() => navigate(`/check-in/${booking.booking_id}`)}
                              className="w-full sm:w-auto px-4 py-2 rounded-md shadow text-sm font-semibold bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Check-in
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ViewBookings;
