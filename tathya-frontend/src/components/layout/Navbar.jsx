import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
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

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Set background color for light theme
    if (savedTheme === 'light') {
      document.body.style.backgroundColor = '#ffffff';
    } else {
      document.body.style.backgroundColor = '';
    }
  }, []);

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    
    // Set background color for light theme
    if (selectedTheme === 'light') {
      document.body.style.backgroundColor = '#ffffff';
    } else {
      document.body.style.backgroundColor = '';
    }
    
    setIsThemeMenuOpen(false);
  };

  const toggleThemeMenu = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

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
      className="bg-black dark:bg-gray-900 shadow"
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
            {userRole !== 'moderator' && (
              <Link to="/contact" className="text-sm text-gray-200 hover:text-white">Contact</Link>
            )}
            <Link to="/add-to-community" className="text-sm text-gray-200 hover:text-white">Join Community</Link>

            {/* Theme Switcher */}
            <div className="relative">
              <button 
                onClick={toggleThemeMenu}
                className="text-sm text-gray-200 hover:text-white flex items-center"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                Theme
              </button>
              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <button 
                    onClick={() => toggleTheme('light')}
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => toggleTheme('dark')}
                    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Dark
                  </button>
                </div>
              )}
            </div>

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
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">Home</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">About</Link>
            {userRole !== 'moderator' && (
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">Contact</Link>
            )}
            <Link to="/add-to-community" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">Join Community</Link>

            {/* Theme Switcher Mobile */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">THEME</div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    toggleTheme('light');
                    setIsMenuOpen(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded text-sm ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => {
                    toggleTheme('dark');
                    setIsMenuOpen(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded text-sm ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                >
                  Dark
                </button>
              </div>
            </div>

            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => {
                    console.log('Mobile login button clicked');
                    handleLoginClick();
                    setIsMenuOpen(false);
                  }} 
                  className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 text-left w-full text-gray-700 dark:text-gray-200"
                >
                  Login
                </button>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 text-gray-700 dark:text-gray-200">Sign up</Link>
              </>
            ) : (
              <>
                {userRole === 'moderator' ? (
                  <Link 
                    to="/moderator-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 text-left w-full text-purple-600"
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
                    className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 text-left w-full text-blue-600"
                  >
                    Dashboard
                  </button>
                )}
                <button 
                  onClick={() => { 
                    handleLogout(); 
                    setIsMenuOpen(false); 
                  }} 
                  className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 text-left w-full text-red-600"
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