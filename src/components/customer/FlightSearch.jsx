import React, { useState, useEffect, useRef } from 'react';
import api, { flightsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { FiSearch, FiCalendar, FiUsers, FiMapPin, FiDollarSign } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

const FlightSearch = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date(),
    returnDate: null,
    passengers: 1,
    tripType: 'oneway',
    classType: 'economy'
  });
  
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  // Live suggestion state
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const originTimeout = useRef(null);
  const destTimeout = useRef(null);

  // Fetch suggestions when user types
  useEffect(() => {
    if (originTimeout.current) clearTimeout(originTimeout.current);
    const q = formData.origin.trim();
    if (!q) { setOriginSuggestions([]); return; }
    originTimeout.current = setTimeout(async () => {
      try {
        const { data } = await flightsAPI.suggest({ field: 'source', q });
        setOriginSuggestions(Array.isArray(data) ? data : []);
        setShowOriginDropdown(true);
      } catch (_) {
        setOriginSuggestions([]);
      }
    }, 200);
    return () => originTimeout.current && clearTimeout(originTimeout.current);
  }, [formData.origin]);

  useEffect(() => {
    if (destTimeout.current) clearTimeout(destTimeout.current);
    const q = formData.destination.trim();
    if (!q) { setDestSuggestions([]); return; }
    destTimeout.current = setTimeout(async () => {
      try {
        const { data } = await flightsAPI.suggest({ field: 'destination', q });
        setDestSuggestions(Array.isArray(data) ? data : []);
        setShowDestDropdown(true);
      } catch (_) {
        setDestSuggestions([]);
      }
    }, 200);
    return () => destTimeout.current && clearTimeout(destTimeout.current);
  }, [formData.destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let next = { ...prev, [name]: value };
      // If destination equals source, clear destination and toast
      if (name === 'destination' && value.trim() && value.trim().toLowerCase() === prev.origin.trim().toLowerCase()) {
        next.destination = '';
        toast.error('Destination can\'t be same as source');
      }
      // If origin changed to equal current destination, clear destination
      if (name === 'origin' && prev.destination.trim() && value.trim().toLowerCase() === prev.destination.trim().toLowerCase()) {
        next.destination = '';
        toast.error('Destination can\'t be same as source');
      }
      return next;
    });
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prevent same source and destination
      if (formData.origin.trim() && formData.destination.trim() &&
          formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
        setLoading(false);
        toast.error("Destination can't be same as source");
        return;
      }
      // Backend stores city names, we submit the typed/selected text directly
      const response = await api.post('/flights/search', {
        source: formData.origin,
        destination: formData.destination,
      });
      
      if (response.data && Array.isArray(response.data)) {
        const formattedFlights = response.data.map((flight, idx) => ({
          id: `${flight.flight_name || 'FL'}-${idx}`,
          airline: 'HCL Airlines',
          flightNumber: flight.flight_name || `FL${Math.floor(100 + Math.random() * 900)}`,
          departure: {
            time: flight.start_time, // already a formatted string
            airport: flight.source,
            city: flight.source,
          },
          arrival: {
            time: flight.end_time,
            airport: flight.destination,
            city: flight.destination,
          },
          duration: 'N/A',
          price: formData.classType === 'business' ? (flight.business_cost || 0) : (flight.economy_cost || 0),
          seatsLeft: formData.classType === 'business'
            ? (flight.business_available ?? 0)
            : (flight.economy_available ?? 0),
          stops: 0,
          // raw backend fields for downstream screens
          business_cost: flight.business_cost,
          economy_cost: flight.economy_cost,
          business_available: flight.business_available,
          economy_available: flight.economy_available,
          business_total: flight.business_total,
          economy_total: flight.economy_total,
        }));
        
        setFlights(formattedFlights);
      } else {
        setFlights([]);
      }
      setSearchPerformed(true);
    } catch (err) {
      setError('Failed to search for flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 20 }
  });

  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50'}`}>
      <div className="w-full flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-8">
            <animated.div style={springProps} className="text-center md:text-left">
              <h1 className={`text-4xl md:text-5xl font-extrabold mb-3 pb-1 leading-[1.2] bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-indigo-300 to-fuchsia-300' : 'from-indigo-600 to-fuchsia-600'}`}>
                Find Your Perfect Flight
              </h1>
              <p className={`text-lg md:text-xl ${darkMode ? 'text-indigo-200/80' : 'text-gray-700'}`}>
                Search and compare flights from top airlines
              </p>
            </animated.div>

        {/* Search Form */}
        <div className={`p-6 rounded-xl transition-all duration-300 shadow-lg ring-1 ring-black/5 ${darkMode ? 'bg-white/5 backdrop-blur-sm' : 'bg-white'} mb-8`}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Origin */}
              <div>
                <label htmlFor="origin" className="block text-sm font-medium mb-1">From</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    onFocus={() => setShowOriginDropdown(true)}
                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 150)}
                    placeholder="Type city or origin"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      darkMode ? 'bg-gray-700/40 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    required
                  />
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <ul className={`absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                      {originSuggestions.map((s) => (
                        <li
                          key={s}
                          className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${darkMode ? 'hover:bg-indigo-900/30' : ''}`}
                          onMouseDown={() => {
                            setFormData(prev => {
                              const next = { ...prev, origin: s };
                              if (prev.destination.trim() && s.trim().toLowerCase() === prev.destination.trim().toLowerCase()) {
                                next.destination = '';
                                toast.error("Destination can't be same as source");
                              }
                              return next;
                            });
                            setShowOriginDropdown(false);
                          }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-1">To</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 150)}
                    placeholder="Type city or destination"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      darkMode ? 'bg-gray-700/40 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    required
                  />
                  {showDestDropdown && destSuggestions.length > 0 && (
                    <ul className={`absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                      {destSuggestions.map((s) => (
                        <li
                          key={s}
                          className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${darkMode ? 'hover:bg-indigo-900/30' : ''}`}
                          onMouseDown={() => {
                            if (s.trim().toLowerCase() === formData.origin.trim().toLowerCase()) {
                              toast.error("Destination can't be same as source");
                              return;
                            }
                            setFormData(prev => ({ ...prev, destination: s }));
                            setShowDestDropdown(false);
                          }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Departure Date */}
              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium mb-1">
                  Departure
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <DatePicker
                    selected={formData.departureDate}
                    onChange={(date) => handleDateChange(date, 'departureDate')}
                    minDate={new Date()}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      darkMode ? 'bg-gray-700/40 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label htmlFor="passengers" className="block text-sm font-medium mb-1">Passengers</label>
                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="passengers"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      darkMode ? 'bg-gray-700/40 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class */}
              <div>
                <label htmlFor="classType" className="block text-sm font-medium mb-1">Class</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="classType"
                    name="classType"
                    value={formData.classType}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      darkMode ? 'bg-gray-700/40 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3.5 rounded-full bg-white text-indigo-700 font-semibold text-lg ring-1 ring-black/5 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${
                  loading ? 'opacity-75 cursor-not-allowed' : 'shadow hover:shadow-md'
                } ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiSearch className="mr-2" />
                    Search Flights
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchPerformed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-600">Available Flights</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Searching for flights...</p>
                </div>
              ) : error ? (
                <div className="bg-rose-50 ring-1 ring-rose-200 p-4 mb-6 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : flights.length > 0 ? (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-xl transition-all duration-300 shadow-lg ring-1 ring-black/5 ${darkMode ? 'bg-white/5 backdrop-blur-sm' : 'bg-white'}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0 md:flex-1">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center mr-3 shadow">
                              <span className="font-bold">{flight.airline[0]}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{flight.airline}</h3>
                              <p className="text-sm text-gray-500">{flight.flightNumber}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{flight.departure.time}</div>
                              <div className="text-sm text-gray-500">{flight.departure.airport}</div>
                            </div>
                            <div className="px-4 text-center">
                              <div className="text-xs text-gray-500">{flight.duration}</div>
                              <div className="relative w-16 mx-auto">
                                <div className="h-px bg-gray-300 w-full"></div>
                                <div className="absolute -top-1.5 right-0 w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{flight.arrival.time}</div>
                              <div className="text-sm text-gray-500">{flight.arrival.airport}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 text-center md:text-right">
                          <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">${flight.price}</div>
                          <div className="text-sm text-gray-500">{flight.seatsLeft} seats left</div>
                          <button
                            onClick={() => {
                              navigate(`/customer/book/${encodeURIComponent(flight.flightNumber)}`,
                                {
                                  state: {
                                    flight_name: flight.flightNumber,
                                    source: flight.departure.city,
                                    destination: flight.arrival.city,
                                    start_time: flight.departure.time,
                                    end_time: flight.arrival.time,
                                    classType: formData.classType,
                                    price: flight.price,
                                    seatsAvailable: flight.seatsLeft,
                                    // Provide full pricing and availability details per class
                                    business_cost: flight.business_cost,
                                    economy_cost: flight.economy_cost,
                                    business_available: flight.business_available,
                                    economy_available: flight.economy_available,
                                    business_total: flight.business_total,
                                    economy_total: flight.economy_total,
                                  }
                                }
                              );
                            }}
                            className="mt-2 w-full md:w-auto px-4 py-2 rounded-md bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50 shadow"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center rounded-xl ring-1 ring-black/5 ${
                  darkMode ? 'bg-white/5' : 'bg-white'
                }`}>
                  <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold">No flights found</h3>
                  <p className="text-gray-600 mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </div>
      </div>
      <footer className={`py-4 ${darkMode ? 'bg-gray-800' : 'bg-white border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            &copy; {new Date().getFullYear()} HCL Airlines. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FlightSearch;
