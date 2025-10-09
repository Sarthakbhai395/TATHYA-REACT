// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      tempErrors.firstName = 'First name is required.';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      tempErrors.lastName = 'Last name is required.';
      isValid = false;
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid.';
      isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }
    if (!formData.agreeToTerms) {
      tempErrors.agreeToTerms = 'You must agree to the terms and conditions.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
  await authService.signup(payload);
  setIsSubmitting(false);
  // After successful signup, navigate to login page and prefill email
  navigate('/login', { state: { email: formData.email } });
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* SVG Filter - Include once globally or in App component, but placing here for self-contained demo */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.02"
              numOctaves="2"
              seed="92"
              result="noise"
            />
            <feGaussianBlur
              in="noise"
              stdDeviation="2"
              result="blurred"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale="110"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <motion.div
        className="liquid-glass-card w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-content p-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4315/4315445.png"
              alt="TATHYA Logo"
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
            <p className="text-gray-300 mt-2">Join TATHYA to get started</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full p-3 bg-white/10 border ${
                  errors.firstName ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Sarthak"
              />
              {errors.firstName && <p className="mt-1 text-red-400 text-sm">{errors.firstName}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full p-3 bg-white/10 border ${
                  errors.lastName ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Sharma"
              />
              {errors.lastName && <p className="mt-1 text-red-400 text-sm">{errors.lastName}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 bg-white/10 border ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., sarthak@example.com"
              />
              {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 bg-white/10 border ${
                  errors.password ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-red-400 text-sm">{errors.password}</p>}
            </motion.div>

            <motion.div className="mt-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 bg-white/10 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-white/20 rounded bg-white/10 focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-300">
                I agree to the <Link to="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
              </label>
            </motion.div>
            {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
                  isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors duration-300 flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            className="text-center mt-6 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Log in
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Liquid Glass Card Styles */}
      <style jsx>{`
        /* Liquid Glass Card */
        .liquid-glass-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          border-radius: 28px;
          isolation: isolate;
          box-shadow: 0px 6px 21px -8px rgba(255, 255, 255, 0.2);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Tint and inner shadow layer */
        .liquid-glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 28px;
          box-shadow: inset 0 0 8px -2px rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0);
          pointer-events: none;
        }

        /* Backdrop blur and distortion layer */
        .liquid-glass-card::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: 28px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          filter: url(#glass-distortion);
          -webkit-filter: url(#glass-distortion);
          isolation: isolate;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.02);
        }

        /* Content styling */
        .card-content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
        }

        .card-content h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .card-content p {
          opacity: 0.8;
          margin-bottom: 24px;
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Signup;