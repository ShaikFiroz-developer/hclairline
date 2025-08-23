import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const resp = await bookingsAPI.getBookings();
      const list = resp.data || [];
      const found = list.find(b => String(b.booking_id) === String(bookingId));
      if (!found) {
        setError('Booking not found');
      } else {
        setBooking(found);
      }
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Handle formats like 'dd/mm/YYYY HH:MM'
    if (/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(dateString)) {
      const [d, m, y, hh, mm] = dateString.match(/\d+/g).map(Number);
      const dt = new Date(y, m - 1, d, hh, mm);
      return isNaN(dt) ? 'N/A' : dt.toLocaleString();
    }
    const d = new Date(dateString);
    return isNaN(d) ? 'N/A' : d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-rose-600 font-medium mb-6">{error}</p>
        <button onClick={() => navigate('/customer/bookings')} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
          Back to My Bookings
        </button>
      </div>
    );
  }

  const passengers = booking?.passengers || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
            Booking Details
          </h1>
          <button onClick={() => navigate('/customer/bookings')} className="px-3 py-1.5 rounded-md text-sm bg-white ring-1 ring-black/5 shadow hover:bg-gray-50">
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl shadow ring-1 ring-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{booking?.flight_name || 'Flight'}</h2>
                <p className="text-sm text-gray-500">Booking ID: {bookingId}</p>
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Flight</h3>
              <div className="text-sm text-gray-600">From</div>
              <div className="font-medium">{booking?.source || 'N/A'}</div>
              <div className="text-sm text-gray-600 mt-3">To</div>
              <div className="font-medium">{booking?.destination || 'N/A'}</div>
              <div className="mt-3 text-sm text-gray-600">Class</div>
              <div className="font-medium capitalize">{booking?.class || 'economy'}</div>
              <div className="mt-3 text-sm text-gray-600">Seats</div>
              <div className="font-medium">{Array.isArray(booking?.seats) ? booking.seats.join(', ') : booking?.seats_booked}</div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Schedule</h3>
              <div className="text-sm text-gray-600">Departure</div>
              <div className="font-medium">{formatDate(booking?.start || booking?.departure_time)}</div>
              <div className="text-sm text-gray-600 mt-3">Arrival</div>
              <div className="font-medium">{formatDate(booking?.end || booking?.arrival_time)}</div>
              <div className="mt-3 text-sm text-gray-600">Total Paid</div>
              <div className="font-bold text-indigo-700 text-lg">${(booking?.total_cost ?? booking?.total_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Passengers</h3>
            {passengers.length === 0 ? (
              <div className="text-gray-500 text-sm">No passenger details available.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {passengers.map((p, idx) => (
                  <li key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{p.Name}</div>
                      <div className="text-sm text-gray-600">Age: {p.Age} • Gender: {p.Gender}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
