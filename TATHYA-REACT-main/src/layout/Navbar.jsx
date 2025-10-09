// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation to check current path

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Get the current location

  // Function to check if the current link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-10 w-auto"
                src="https://cdn-icons-png.flaticon.com/512/4315/4315445.png"
                alt="TATHYA Logo"
              />
              <span className="ml-2 text-xl font-bold text-white">TATHYA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'text-white' : 'text-gray-200 hover:text-white'}`}>
              Home
            </Link>
            <Link to="/About" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/About') ? 'text-white' : 'text-gray-200 hover:text-white'}`}>
              About
            </Link>
            <Link to="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/contact') ? 'text-white' : 'text-gray-200 hover:text-white'}`}>
              Contact
            </Link>
            <Link to="/user-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700`}>
              U.D
            </Link>
            {/* Add more desktop links as needed, e.g., <Link to="/login">Login</Link> */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/about') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/contact') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/user-dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/user-dashboard') ? 'text-white bg-blue-700' : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              U.D {/* User Dashboard */}
            </Link>
            {/* Add more mobile links as needed */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;