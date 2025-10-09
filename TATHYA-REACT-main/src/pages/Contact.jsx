// src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate if needed

const Contact = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation if needed
  // --- State Management ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false); // For user profile dropdown if needed

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Basic form validation
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required.';
      isValid = false;
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid.';
      isValid = false;
    }
    if (!formData.subject.trim()) {
      tempErrors.subject = 'Subject is required.';
      isValid = false;
    }
    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would send formData to your backend here
    console.log('Form submitted:', formData);

    // Simulate successful submission
    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after a short delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 5000); // Show success message for 5 seconds
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Home
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Have questions, feedback, or need assistance? We're here to help. Reach out to us using the information below or fill out the form.
          </motion.p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information & Quick Links */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Get In Touch */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-address-book text-blue-500 mr-3"></i> Get In Touch
              </h2>
              <ul className="space-y-4">
                <motion.li
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <i className="fas fa-envelope text-gray-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">
                    Email: <a href="mailto:support@tathya.edu" className="text-blue-600 hover:underline">support@tathya.edu</a>
                  </span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <i className="fas fa-phone text-gray-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">
                    Phone: <a href="tel:+915551234567" className="text-blue-600 hover:underline">(555) 123-4567</a>
                  </span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <i className="fas fa-map-marker-alt text-gray-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">
                    Address: Anonymous Support Center, Safe Campus Initiative
                  </span>
                </motion.li>
              </ul>
            </motion.div>

            {/* Quick Links - Updated */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-link text-green-500 mr-3"></i> Quick Links
              </h2>
              <ul className="space-y-3">
                {/* FAQ Link - Navigates to Help & Support section */}
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-chevron-right text-blue-500 mr-2 text-xs"></i>
                  {/* Use onClick with navigate to go to User Dashboard Help section */}
                  <button
                    onClick={() => navigate('/user-dashboard?section=help-section')}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300 text-left"
                  >
                    Frequently Asked Questions
                  </button>
                </motion.li>
                {/* Community Guidelines Link - Navigates to Guidelines page */}
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-chevron-right text-blue-500 mr-2 text-xs"></i>
                  <Link
                    to="/guidelines"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    Community Guidelines
                  </Link>
                </motion.li>
                {/* Removed Privacy Policy, Terms of Service, Data Protection */}

                {/* New Attractive Content Added */}
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-shield-alt text-purple-500 mr-2 text-xs"></i>
                  <Link
                    to="/safety-tips"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    Safety Tips & Best Practices
                  </Link>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-users text-teal-500 mr-2 text-xs"></i>
                  <Link
                    to="/community-forums"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    Join Community Forums
                  </Link>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-lightbulb text-yellow-500 mr-2 text-xs"></i>
                  <Link
                    to="/success-stories"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    Read Success Stories
                  </Link>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-center"
                >
                  <i className="fas fa-calendar-alt text-red-500 mr-2 text-xs"></i>
                  <Link
                    to="/events-webinars"
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                  >
                    Upcoming Events & Webinars
                  </Link>
                </motion.li>
              </ul>
            </motion.div>

            {/* Crisis Resources (Removed as per your request) */}
            {/* You can uncomment this if you want to re-add it later */}
            {/* <motion.div
              variants={itemVariants}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
            >
              <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i> Crisis or Emergency?
              </h2>
              <p className="text-red-600 mb-3">
                If you are in immediate danger or experiencing a crisis, please contact local emergency services (Police: 100, Ambulance: 102) or a national helpline.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="tel:100"
                  className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
                >
                  Call Police (100)
                </a>
                <a
                  href="tel:102"
                  className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
                >
                  Call Ambulance (102)
                </a>
                <a
                  href="https://www.vimhansdelhi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
                >
                  National Mental Health Helpline
                </a>
              </div>
            </motion.div> */}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-paper-plane text-purple-500 mr-3"></i> Send us a Message
            </h2>

            <AnimatePresence>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-10"
                >
                  <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. Your message has been received by our moderators.
                    We will get back to you as soon as possible.
                  </p>
                  <p className="text-sm text-gray-500">This message will disappear shortly...</p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  variants={itemVariants}
                  className="space-y-6"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="Message subject"
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="Your detailed message..."
                    ></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors duration-300 flex items-center justify-center ${
                      isSubmitting
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i> Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 text-center text-gray-600"
        >
          <p>We value your feedback and strive to respond to all inquiries within 24-48 business hours.</p>
          <p className="mt-2">For urgent matters, please use the contact information provided above.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;