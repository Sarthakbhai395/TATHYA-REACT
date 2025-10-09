
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsAuthenticated(localStorage.getItem('tathya-is-authenticated') === 'true');
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const handleLogout = () => {
    authService.clearAuthStorage();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-black shadow"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
            <img src="https://cdn-icons-png.flaticon.com/512/4315/4315445.png" alt="TATHYA" className="h-10" />
            <span className="font-bold text-lg text-white">TATHYA</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm text-gray-200 hover:text-white">Home</Link>
            <Link to="/about" className="text-sm text-gray-200 hover:text-white">About</Link>
            <Link to="/contact" className="text-sm text-gray-200 hover:text-white">Contact</Link>
            <Link to="/moderator" className="text-sm text-gray-200 hover:text-white">Moderator</Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-3 py-2 rounded bg-transparent text-sm text-gray-200 hover:text-white">Login</Link>
                <Link to="/signup" className="px-3 py-2 rounded bg-blue-600 text-sm text-white hover:bg-blue-700">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/user-dashboard" className="px-3 py-2 rounded bg-blue-600 text-sm text-white hover:bg-blue-700">Dashboard</Link>
                <button onClick={handleLogout} className="px-3 py-2 rounded text-sm text-white bg-red-600 hover:bg-red-700">Logout</button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(v => !v)} className="p-2 rounded bg-gray-100">
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block">Home</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block">Contact</Link>
            <Link to="/moderator" onClick={() => setIsMenuOpen(false)} className="block">Moderator</Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/user-dashboard" onClick={() => setIsMenuOpen(false)} className="block">Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block text-left text-red-600">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
