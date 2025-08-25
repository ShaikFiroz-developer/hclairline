import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { weatherAPI, flightsAPI } from '../../utils/api';

const CheckWeather = ({ darkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { msg, cancellations: [] }
  const [info, setInfo] = useState('');
  const [flights, setFlights] = useState([]); // [{flight_id, flight_name, ...}]
  const [selected, setSelected] = useState(new Set());
  const [nonces, setNonces] = useState({}); // { [flight_id]: nonce }
  const [modal, setModal] = useState({ open: false, flight: null });

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const loadFlights = async () => {
    try {
      const { data } = await flightsAPI.active();
      setFlights(data || []);
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to load flights');
    }
  };

  // Robust header getter for Axios (XHR or fetch adapters)
  const getHeader = (resp, name) => {
    if (!resp) return undefined;
    const lower = name.toLowerCase();
    // axios classic: plain object
    if (resp.headers && typeof resp.headers === 'object' && !resp.headers.get) {
      const val = resp.headers[lower] || resp.headers[name] || resp.headers[name.toLowerCase()];
      if (val) return val;
    }
    // fetch adapter: Headers instance
    if (resp.headers && typeof resp.headers.get === 'function') {
      const v = resp.headers.get(name) || resp.headers.get(lower);
      if (v) return v;
    }
    // XHR fallback (very rare)
    try {
      const h = resp?.request?.getResponseHeader?.(name) || resp?.request?.getResponseHeader?.(lower);
      if (h) return h;
    } catch {}
    return undefined;
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(flights.map((f) => f.flight_id)));
  const clearSelection = () => setSelected(new Set());

  const runWeatherScan = async (scope = 'all') => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const ids = scope === 'selected' ? selectedIds : [];
      const { data } = await weatherAPI.check(ids);
      setResult(data);
      // On cancellations, refresh list
      await loadFlights();
    } catch (err) {
      console.error('Weather check failed:', err);
      const msg = err?.response?.data?.msg || 'Weather check failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const forceBad = async (scope = 'selected') => {
    setLoading(true);
    setError('');
    try {
      const ids = scope === 'selected' ? selectedIds : [];
      const { data } = await weatherAPI.forceBad(scope, ids);
      const affected = data?.affected || [];
      // Show result panel immediately
      setResult({ msg: data?.msg || 'Bad weather forced', cancellations: affected.map(a => a.flight_name) });

      if (affected.length === 0) {
        return;
      }

      // Confirm with user: proceed to force-cancel all affected flights (bypasses export safety)
      const proceed = window.confirm(`Bad weather set for ${affected.length} flight(s).\nProceed to cancel all affected flights now? (Export step will be skipped)`);
      if (!proceed) return;

      // For each affected flight: force cancel without nonce
      for (const f of affected) {
        const fid = f.flight_id;
        const fname = f.flight_name || 'flight';
        try {
          await flightsAPI.cancelForce(fid);
        } catch (cx) {
          console.error('Cancel failed for', fid, cx);
          setError(prev => (prev ? prev + '\n' : '') + (cx?.response?.data?.msg || `Failed to cancel ${fname}`));
        }
      }

      // Refresh list after cancellations
      await loadFlights();
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to force bad weather');
    } finally {
      setLoading(false);
    }
  };

  const exportRegistrations = async (flight) => {
    setError('');
    try {
      const resp = await flightsAPI.exportRegistrations(flight.flight_id);
      // Read nonce header robustly
      const nonce = getHeader(resp, 'X-Cancel-Nonce');
      if (nonce) {
        setNonces((prev) => ({ ...prev, [flight.flight_id]: nonce }));
      }
      const noRegs = String(getHeader(resp, 'X-No-Registrations') || 'false') === 'true';
      if (noRegs) {
        setInfo(`No registrations found for ${flight.flight_name}. You can still proceed to cancel.`);
      } else {
        setInfo('');
      }
      // Download the CSV
      const blob = new Blob([resp.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${flight.flight_name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to export registrations');
    }
  };

  const confirmCancel = (flight) => setModal({ open: true, flight });
  const closeModal = () => setModal({ open: false, flight: null });

  const doCancel = async () => {
    const flight = modal.flight;
    if (!flight) return;
    const nonce = nonces[flight.flight_id];
    if (!nonce) {
      setError('Please download registered users before cancelling this flight.');
      return;
    }
    setLoading(true);
    try {
      await flightsAPI.cancel(flight.flight_id, nonce);
      setResult({ msg: 'Flight cancelled successfully', cancellations: [flight.flight_name] });
      // Clear nonce and refresh
      setNonces((prev) => {
        const n = { ...prev };
        delete n[flight.flight_id];
        return n;
      });
      await loadFlights();
      closeModal();
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to cancel flight');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Weather Scan & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Weather tools</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Run scans, force bad weather (demo), and manage cancellations.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => runWeatherScan('all')} disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>Scan All</motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => runWeatherScan('selected')} disabled={loading || selected.size === 0}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${selected.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>Scan Selected</motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => forceBad('selected')} disabled={loading || selected.size === 0}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 ${selected.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>Force Bad (Selected)</motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => forceBad('all')} disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>Force Bad (All)</motion.button>
              </div>
            </div>
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
        {/* Info Message */}
        {info && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 rounded border border-blue-300 bg-blue-50 text-blue-900 p-3">
            {info}
          </motion.div>
        )}

        {/* Flights List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Upcoming Flights</h2>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs px-3 py-1 rounded border">Select All</button>
              <button onClick={clearSelection} className="text-xs px-3 py-1 rounded border">Clear</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">Select</th>
                  <th className="py-2 pr-2">Flight</th>
                  <th className="py-2 pr-2">Route</th>
                  <th className="py-2 pr-2">Start</th>
                  <th className="py-2 pr-2">End</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-500">No upcoming flights</td></tr>
                )}
                {flights.map((f) => (
                  <tr key={f.flight_id} className="border-b">
                    <td className="py-2 pr-2">
                      <input type="checkbox" checked={selected.has(f.flight_id)} onChange={() => toggleSelect(f.flight_id)} />
                    </td>
                    <td className="py-2 pr-2 font-medium">{f.flight_name}</td>
                    <td className="py-2 pr-2">{f.source} → {f.destination}</td>
                    <td className="py-2 pr-2">{f.start_time}</td>
                    <td className="py-2 pr-2">{f.end_time}</td>
                    <td className="py-2 pr-2 flex flex-wrap items-center gap-2">
                      <button className="text-xs px-3 py-1 rounded bg-slate-600 text-white" onClick={() => runWeatherScan('selected') } disabled={!selected.has(f.flight_id)}>Scan</button>
                      <button className="text-xs px-3 py-1 rounded bg-amber-600 text-white" onClick={() => forceBad('selected')} disabled={!selected.has(f.flight_id)}>Force Bad</button>
                      <button className="text-xs px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => exportRegistrations(f)}>Export Users</button>
                      <button className={`text-xs px-3 py-1 rounded ${nonces[f.flight_id] ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white`} onClick={() => confirmCancel(f)} disabled={!nonces[f.flight_id]}>Cancel</button>
                      {!nonces[f.flight_id] && (
                        <span className="text-[11px] text-red-700">Export required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Scan Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`p-6 rounded-xl mb-8 border ${
              (result.cancellations?.length || 0) > 0
                ? (darkMode ? 'bg-red-950/80 border-red-700' : 'bg-red-100 border-red-400')
                : (darkMode ? 'bg-green-950/80 border-green-700' : 'bg-green-100 border-green-400')
            }`}
          >
            {(result.cancellations?.length || 0) > 0 ? (
              <div>
                <h3 className={`text-base font-semibold ${darkMode ? 'text-red-100' : 'text-red-900'}`}>Flights cancelled due to severe weather</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-red-200' : 'text-red-800'}`}>The following flights have been cancelled automatically based on wind/humidity thresholds:</p>
                <ul className={`mt-3 list-disc pl-5 space-y-1 text-sm ${darkMode ? 'text-red-100' : 'text-red-900'}`}>
                  {result.cancellations.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h3 className={`text-base font-semibold ${darkMode ? 'text-green-100' : 'text-green-900'}`}>No cancellations required</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-green-200' : 'text-green-800'}`}>All scheduled flights passing the 1-hour window meet safe wind and humidity thresholds.</p>
              </div>
            )}
          </motion.div>
        )}
        {/* Confirmation Modal */}
        {modal.open && modal.flight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`w-full max-w-md rounded-lg p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <h3 className="text-lg font-semibold mb-2">Confirm Flight Cancellation</h3>
              <p className="text-sm mb-4">Flight: <span className="font-medium">{modal.flight.flight_name}</span></p>
              <ul className="list-disc pl-5 text-sm mb-4">
                <li>Registered users must be exported before cancellation.</li>
                <li>The export step provides a one-time code automatically.</li>
                <li>After cancellation, bookings and schedule will be removed, and users notified.</li>
              </ul>
              {!nonces[modal.flight.flight_id] && (
                <div className="text-red-600 text-sm mb-3">Please click "Export Users" first to enable cancellation.</div>
              )}
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded border" onClick={closeModal}>Close</button>
                <button className={`px-4 py-2 rounded text-white ${nonces[modal.flight.flight_id] ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`} onClick={doCancel} disabled={!nonces[modal.flight.flight_id]}>Confirm Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Optional: could add audit log or last run time here */}
      </div>
    </div>
  );
};

export default CheckWeather;
