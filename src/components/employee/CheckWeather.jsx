import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { weatherAPI } from '../../utils/api';

const CheckWeather = ({ darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { msg, cancellations: [] }

  const runWeatherScan = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await weatherAPI.check();
      setResult(data);
    } catch (err) {
      console.error('Weather check failed:', err);
      const msg = err?.response?.data?.msg || 'Weather check failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // No client-side fake weather display; backend already cancels and returns list.

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Weather Check</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Check weather conditions for flight routes and manage potential disruptions.
          </p>
        </motion.div>

        {/* Weather Scan Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Run network-wide weather scan</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Checks source and destination wind/humidity for all scheduled flights (starting &gt; 1 hour from now). Cancels severe routes automatically.</p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runWeatherScan}
              disabled={loading}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </span>
              ) : (
                'Run Weather Scan'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */
        }
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </motion.div>
        )}
        {/* Scan Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`p-6 rounded-xl mb-8 ${
              (result.cancellations?.length || 0) > 0
                ? 'bg-red-50 dark:bg-red-900/30 border border-red-500/30'
                : 'bg-green-50 dark:bg-green-900/30 border border-green-500/30'
            }`}
          >
            {(result.cancellations?.length || 0) > 0 ? (
              <div>
                <h3 className="text-base font-semibold text-red-800 dark:text-red-200">Flights cancelled due to severe weather</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">The following flights have been cancelled automatically based on wind/humidity thresholds:</p>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-red-800">
                  {result.cancellations.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-semibold text-green-800 ">No cancellations required</h3>
                <p className="mt-1 text-sm text-green-700 ">All scheduled flights passing the 1-hour window meet safe wind and humidity thresholds.</p>
              </div>
            )}
          </motion.div>
        )}
        {/* Optional: could add audit log or last run time here */}
      </div>
    </div>
  );
};

export default CheckWeather;
