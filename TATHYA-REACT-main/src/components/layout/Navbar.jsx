import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const isAuth = localStorage.getItem('tathya-is-authenticated') === 'true';
      const user = JSON.parse(localStorage.getItem('tathya_user') || 'null');
      console.log('Auth check:', isAuth);
      setIsAuthenticated(isAuth);
      setUserRole(user?.role || null);
    };
    check();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', check);
    // Also listen for custom events when auth state changes in same tab
    window.addEventListener('authStateChanged', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('authStateChanged', check);
    };
  }, []);

  const handleLogout = () => {
    authService.clearAuthStorage();
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  const handleLoginClick = () => {
    console.log('Login button clicked - navigating to /login');
    navigate('/login');
  };

  const handleDashboardClick = () => {
    console.log('Dashboard button clicked - navigating to /user-dashboard');
    navigate('/user-dashboard');
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
            <Link to="/add-to-community" className="text-sm text-gray-200 hover:text-white">Join Community</Link>
            <Link to="/moderator" className="text-sm text-gray-200 hover:text-white">Moderator</Link>

            {!isAuthenticated ? (
              <>
                <button 
                  onClick={handleLoginClick}
                  className="px-3 py-2 rounded bg-transparent text-sm text-gray-200 hover:text-white transition-colors duration-200 cursor-pointer border border-gray-600 hover:border-gray-400"
                >
                  Login
                </button>
                <Link to="/signup" className="px-3 py-2 rounded bg-blue-600 text-sm text-white hover:bg-blue-700">Sign up</Link>
              </>
            ) : (
              <>
                {userRole === 'moderator' ? (
                  <Link 
                    to="/moderator-dashboard"
                    className="px-3 py-2 rounded bg-purple-600 text-sm text-white hover:bg-purple-700 transition-colors duration-200"
                  >
                    Moderator Dashboard
                  </Link>
                ) : (
                  <button 
                    onClick={handleDashboardClick}
                    className="px-3 py-2 rounded bg-blue-600 text-sm text-white hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                  >
                    Dashboard
                  </button>
                )}
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 rounded text-sm text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                >
                  Logout
                </button>
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
            <Link to="/add-to-community" onClick={() => setIsMenuOpen(false)} className="block">Join Community</Link>
            <Link to="/moderator" onClick={() => setIsMenuOpen(false)} className="block">Moderator</Link>

            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => {
                    console.log('Mobile login button clicked');
                    handleLoginClick();
                    setIsMenuOpen(false);
                  }} 
                  className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200 text-left w-full"
                >
                  Login
                </button>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200">Sign up</Link>
              </>
            ) : (
              <>
                {userRole === 'moderator' ? (
                  <Link 
                    to="/moderator-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200 text-left w-full text-purple-600"
                  >
                    Moderator Dashboard
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      console.log('Mobile dashboard button clicked');
                      handleDashboardClick();
                      setIsMenuOpen(false);
                    }} 
                    className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200 text-left w-full text-blue-600"
                  >
                    Dashboard
                  </button>
                )}
                <button 
                  onClick={() => { 
                    handleLogout(); 
                    setIsMenuOpen(false); 
                  }} 
                  className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200 text-left w-full text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;