import React from 'react';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`py-4 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mt-auto`}>
      <p>&copy; 2025 HCL Airlines. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
