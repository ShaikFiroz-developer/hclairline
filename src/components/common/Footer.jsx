import React from 'react';

const Footer = ({ darkMode }) => {
  const text = darkMode ? 'text-gray-300' : 'text-gray-700';
  const subtext = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bg = darkMode ? 'bg-gray-900' : 'bg-white';
  const divider = darkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <footer className={`${bg} ${text} mt-auto shadow-inner`}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold mb-3">HCL Airlines</h3>
            <p className={`text-sm ${subtext}`}>Seamless bookings, great fares, and reliable on‑time performance.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className={`space-y-2 text-sm ${subtext}`}>
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className={`space-y-2 text-sm ${subtext}`}>
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">Manage Booking</a></li>
              <li><a href="#" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className={`space-y-2 text-sm ${subtext}`}>
              <li><a href="#" className="hover:underline">Privacy</a></li>
              <li><a href="#" className="hover:underline">Terms</a></li>
              <li><a href="#" className="hover:underline">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className={`border-t ${divider}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className={`text-sm ${subtext}`}>&copy; 2025 HCL Airlines. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
