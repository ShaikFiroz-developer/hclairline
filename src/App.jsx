import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Chatbot from './components/common/Chatbot';
import GlobalLoader from './components/common/GlobalLoader';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import Home from './pages/Home';
import CustomerDashboard from './components/customer/CustomerDashboard';
import FlightSearch from './components/customer/FlightSearch';
import BookTicket from './components/customer/BookTicket';
import ViewBookings from './components/customer/ViewBookings';
import BookingDetails from './components/customer/BookingDetails';
import CheckIn from './components/customer/CheckIn';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import AddFlight from './components/employee/AddFlight';
import ViewCustomers from './components/employee/ViewCustomers';
import CheckWeather from './components/employee/CheckWeather';
import Stats from './components/employee/Stats';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
// Main App Component
function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <GlobalLoader />
      <Navbar 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
      />
      
      <main className="flex-grow w-full overflow-y-auto">
        <div className="w-full max-w-full px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              !isAuthenticated ? 
                <Login /> : 
                <Navigate to={user?.role === 'customer' ? '/customer/dashboard' : '/employee/dashboard'} replace />
            } />
            <Route path="/register" element={
              !isAuthenticated ? 
                <Register /> : 
                <Navigate to={user?.role === 'customer' ? '/customer/dashboard' : '/employee/dashboard'} replace />
            } />
            
            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/search" element={
              <ProtectedRoute requiredRole="customer">
                <FlightSearch />
              </ProtectedRoute>
            } />
            <Route path="/customer/bookings" element={
              <ProtectedRoute requiredRole="customer">
                <ViewBookings />
              </ProtectedRoute>
            } />
            <Route path="/customer/bookings/:bookingId" element={
              <ProtectedRoute requiredRole="customer">
                <BookingDetails />
              </ProtectedRoute>
            } />
            <Route path="/customer/book/:flightId" element={
              <ProtectedRoute requiredRole="customer">
                <BookTicket />
              </ProtectedRoute>
            } />
            <Route path="/check-in/:bookingId" element={
              <ProtectedRoute requiredRole="customer">
                <CheckIn />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/add-flight" element={
              <ProtectedRoute requiredRole="employee">
                <AddFlight />
              </ProtectedRoute>
            } />
            <Route path="/employee/customers" element={
              <ProtectedRoute requiredRole="employee">
                <ViewCustomers />
              </ProtectedRoute>
            } />
            <Route path="/employee/weather" element={
              <ProtectedRoute requiredRole="employee">
                <CheckWeather />
              </ProtectedRoute>
            } />
            <Route path="/employee/stats" element={
              <ProtectedRoute requiredRole="employee">
                <Stats />
              </ProtectedRoute>
            } />
            
            {/* Customer Profile Route */}
            <Route path="/customer/profile" element={
              <ProtectedRoute requiredRole="customer">
                <Profile userRole="customer" />
              </ProtectedRoute>
            } />
            
            {/* Employee Profile Route */}
            <Route path="/employee/profile" element={
              <ProtectedRoute requiredRole="employee">
                <Profile userRole="employee" />
              </ProtectedRoute>
            } />
            
            {/* Public Home Route (common for both roles) */}
            <Route path="/" element={<Home />} />
            
            {/* 404 Page */}
            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
                <p className="text-xl mb-6">Page not found</p>
                <Link 
                  to="/" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go Home
                </Link>
              </div>
            } />
          </Routes>
        </div>
      </main>
      
      <Chatbot />
      <Footer />
      
      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Toast notifications will be rendered here */}
      </div>
    </div>
  );
}

// App Wrapper with Providers
function App() {
  // Remove dark mode class from HTML element on initial load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
