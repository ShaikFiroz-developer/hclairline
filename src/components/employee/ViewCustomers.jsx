import React, { useState, useEffect, useMemo } from 'react';
import { customersAPI } from '../../utils/api'; // Assuming this path is correct
import { motion } from 'framer-motion';

const ViewCustomers = ({ darkMode }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { data } = await customersAPI.getAll();
        setCustomers(data);
      } catch (err) {
        setError('We could not load customer data. Please check your connection and try again.');
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Derived list: filtered, sorted, paginated
  const filteredCustomers = useMemo(() => {
    let list = Array.isArray(customers) ? [...customers] : [];
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') {
      list = list.filter(c => (c.role || '').toLowerCase() === roleFilter);
    }
    if (genderFilter !== 'all') {
      const gf = genderFilter.toUpperCase();
      list = list.filter(c => (c.gender || '').toUpperCase() === gf);
    }
    // Sorting
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const sa = (v) => (v === undefined || v === null) ? '' : String(v);
      const na = (v) => (v === undefined || v === null || isNaN(Number(v))) ? 0 : Number(v);
      if (sortBy === 'name') return sa(a.name).localeCompare(sa(b.name)) * dir;
      if (sortBy === 'email') return sa(a.email).localeCompare(sa(b.email)) * dir;
      if (sortBy === 'age') return (na(a.age) - na(b.age)) * dir;
      if (sortBy === 'bookings') return ((a.bookings?.length || 0) - (b.bookings?.length || 0)) * dir;
      return 0;
    });
    return list;
  }, [customers, searchTerm, roleFilter, genderFilter, sortBy, sortDir]);

  const totalCount = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Location', 'Age', 'Gender', 'Role', 'Bookings Count'],
      ...filteredCustomers.map(c => [
        c.name || '',
        c.email || '',
        c.phone || '',
        c.location || '',
        c.age ?? '',
        c.gender || '',
        c.role || '',
        String(c.bookings?.length || 0),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || genderFilter !== 'all';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800  mb-2">Customer Directory</h1>
          <p className="text-lg text-gray-800 ">Your central hub for customer information. Search, filter, and export with ease.</p>
        </div>

        {/* Search / Filters / Actions */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border border-gray-200 dark:border-gray-700`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Find a Customer
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">Gender</label>
                <select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }} className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value="all">All Genders</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">Sort By</label>
                <select value={`${sortBy}:${sortDir}`} onChange={(e) => { const [k,d] = e.target.value.split(':'); setSortBy(k); setSortDir(d); }} className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value="name:asc">Name (A-Z)</option>
                  <option value="name:desc">Name (Z-A)</option>
                  <option value="email:asc">Email (A-Z)</option>
                  <option value="email:desc">Email (Z-A)</option>
                  <option value="age:asc">Age (Youngest)</option>
                  <option value="age:desc">Age (Oldest)</option>
                  <option value="bookings:asc">Bookings (Low)</option>
                  <option value="bookings:desc">Bookings (High)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700  mb-1">Items per Page</label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Displaying {pagedCustomers.length} of {totalCount} customers
            </span>
            <button onClick={exportCSV} className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Export to CSV
            </button>
          </div>
        </div>

        {/* Customers List - Force dark table theme */}
        <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-800">
          <div className={`bg-slate-900`}> 
            {/* Table Header - Dark themed */}
            <div className={`grid grid-cols-12 px-6 py-4 bg-slate-800 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider sticky top-0 z-10`}> 
              <div className="col-span-3 flex items-center">
                <button onClick={() => toggleSort('name')} className="hover:text-slate-100">Name {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button>
              </div>
              <div className="col-span-3 flex items-center">
                <button onClick={() => toggleSort('email')} className="hover:text-slate-100">Email {sortBy === 'email' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button>
              </div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1 text-center">
                <button onClick={() => toggleSort('age')} className="hover:text-slate-100">Age {sortBy === 'age' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button>
              </div>
              <div className="col-span-1 text-center">
                <button onClick={() => toggleSort('bookings')} className="hover:text-slate-100">Bookings {sortBy === 'bookings' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-800 max-h-[60vh] overflow-y-auto">
              {pagedCustomers.length > 0 ? (
                pagedCustomers.map((customer, index) => (
                  <motion.div
                    key={customer._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 px-6 py-4 items-center transition-colors duration-150 bg-slate-900 hover:bg-slate-800/60`}
                  >
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-inner">
                          <span className="text-white font-semibold">
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-100">
                            {customer.name}
                          </div>
                          <div className="text-xs text-slate-400">{customer.gender === 'M' ? 'Male' : customer.gender === 'F' ? 'Female' : 'Other'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <a href={`mailto:${customer.email}`} className="text-sm text-indigo-300 hover:text-indigo-200 hover:underline truncate">{customer.email}</a>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-slate-300">
                        {customer.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-slate-300 font-medium">{customer.location || 'N/A'}</div>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-700/40 text-emerald-200 border border-emerald-500/30">
                        {customer.age || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span title="Bookings count" className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-700/40 text-indigo-200 border border-indigo-500/30">
                        {customer.bookings?.length || 0}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-24 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {hasActiveFilters ? 'No Customers Found' : 'Your Directory is Empty'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {hasActiveFilters ? "Try adjusting your search or filter to find who you're looking for." : 'Get started by adding your first customer!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCustomers;