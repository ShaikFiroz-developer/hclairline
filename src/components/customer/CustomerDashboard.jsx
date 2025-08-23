import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { bookingsAPI } from '../../utils/api';

const CustomerDashboard = ({ darkMode }) => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, totalSpent: 0, totalSeats: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await bookingsAPI.getBookings();
        // Map to upcoming trips (future start times)
        const now = new Date();
        const upcoming = data
          .filter((b) => {
            // start format: 'dd/mm/YYYY HH:MM'
            const [d, t] = (b.start || '').split(' ');
            if (!d || !t) return false;
            const [day, month, year] = d.split('/').map(Number);
            const [hour, minute] = t.split(':').map(Number);
            const dt = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
            return dt > now && b.status !== 'Flight Cancelled';
          })
          .map((b) => ({
            id: b.booking_id,
            from: `${b.source}`,
            to: `${b.destination}`,
            date: (b.start || '').split(' ')[0] || '',
            time: (b.start || '').split(' ')[1] || '',
            flightNumber: b.flight_name,
            status: b.status || 'Confirmed',
          }));

        setUpcomingTrips(upcoming);

        // Compute stats from all bookings
        const totalSpent = data.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0);
        const totalSeats = data.reduce((sum, b) => sum + (Array.isArray(b.seats) ? b.seats.length : 0), 0);
        setStats({ upcoming: upcoming.length, totalSpent, totalSeats });
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const statCards = [
    { name: 'Upcoming Trips', value: stats.upcoming, icon: FiCalendar },
    { name: 'Total Spent', value: `$${stats.totalSpent}`, icon: FiClock },
    { name: 'Seats Booked', value: stats.totalSeats, icon: FiMapPin },
  ];

  const quickActions = [
    {
      name: 'Search Flights',
      description: 'Find and book your next flight',
      icon: FiSearch,
      to: '/customer/search',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      darkBgColor: 'bg-blue-900/20',
    },
    {
      name: 'My Bookings',
      description: 'View and manage your bookings',
      icon: FiCalendar,
      to: '/customer/bookings',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      darkBgColor: 'bg-green-900/20',
    },
    {
      name: 'Profile',
      description: 'Update your personal information',
      icon: FiCalendar,
      to: '/customer/profile',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      darkBgColor: 'bg-purple-900/20',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900' 
        : 'bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 ">
            Welcome back, Traveler! ✈️
          </h1>
          <p className={`mt-3 text-lg ${darkMode ? 'text-indigo-200/80' : 'text-gray-700'}`}>Here's what's happening with your trips today.</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className={`p-6 rounded-2xl shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-white/5' : 'bg-white'}`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-4 ${darkMode ? 'bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300' : 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 text-indigo-600'}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-indigo-200/80' : 'text-gray-500'}`}>{stat.name}</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 ring-1 ring-black/5 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white'}`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-4 ${darkMode ? 'bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300' : 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 text-indigo-600'}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{action.name}</h3>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-indigo-200/80' : 'text-gray-600'}`}>{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Trips */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Upcoming Trips</h2>
          {loading ? (
            <div className={`p-6 rounded-xl shadow-lg ring-1 ring-black/5 ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ) : error ? (
            <div className={`p-6 rounded-xl shadow-lg ring-1 ring-red-500/20 ${darkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-800'}`}>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className={`p-5 rounded-xl shadow-lg ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-white/5' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trip.from} → {trip.to}</h3>
                      <div className={`mt-2 flex items-center text-sm ${darkMode ? 'text-indigo-200/80' : 'text-gray-600'}`}>
                        <FiCalendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span>{trip.date}</span>
                        <FiClock className="ml-3 mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span>{trip.time}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm">
                        <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold shadow ${
                          trip.status === 'Confirmed' 
                            ? (darkMode ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200')
                            : (darkMode ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200')
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${darkMode ? 'text-indigo-200/80' : 'text-gray-500'}`}>Flight #</span>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trip.flightNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 rounded-xl shadow-lg ring-1 ring-black/5 text-center ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
              <FiMapPin className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className={`mt-2 text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>No upcoming trips</h3>
              <p className={`mt-1 text-sm ${darkMode ? 'text-indigo-200/80' : 'text-gray-600'}`}>Start by searching for flights to plan your next adventure.</p>
              <div className="mt-4">
                <Link
                  to="/customer/search"
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiSearch className="-ml-1 mr-2 h-5 w-5" />
                  Search Flights
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default CustomerDashboard;
