// src/pages/Moderator.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Moderator = () => {
  // State Management
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Namaste! I am your TATHYA Moderator AI. Kaise madad kar sakta hoon aaj? (You can ask in Hinglish)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Handle starting the chat
  const handleStartChat = () => {
    setChatOpen(true);
    setError(null);
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      setIsTyping(true);
      // --- Simulate API Call & Response ---
      await new Promise(resolve => setTimeout(resolve, 1500));
      const simulatedReply = `Thank you for your message: "${userMessage.content}". This is a simulated response from the TATHYA Moderator AI. In a live environment, this would connect to our backend services for personalized support. How else can I assist you today?`;
      // --- End Simulation ---

      const aiMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: simulatedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
      setError('Sorry, I encountered an error. Please try again.');
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    requestAnimationFrame(scrollToBottom);
  }, [messages, isTyping]);

  // --- Animation Variants ---
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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // --- Background Animation Logic ---
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const numberOfParticles = 30; // Adjust number of particles
    const newParticles = [];
    for (let i = 0; i < numberOfParticles; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // Percentage
        y: Math.random() * 100, // Percentage
        size: Math.random() * 4 + 1, // Size between 1px and 5px
        duration: Math.random() * 20 + 10, // Duration between 10s and 30s
        delay: Math.random() * 5, // Random delay
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -(Math.random() * 100 + 50)], // Move up randomly
              x: [0, (Math.random() * 40 - 20)],   // Slight horizontal drift
              opacity: [0.3, 0.7, 0.3],           // Fade in/out
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-blue-300 hover:text-white font-medium transition-colors duration-300"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
          </button>
        </motion.div>

        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
              <i className="fas fa-user-shield text-white text-4xl"></i>
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Talk to a Moderator
          </motion.h1>
          <motion.p
            className="text-xl text-blue-200 max-w-2xl mx-auto drop-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Connect with our expert moderators for guidance, support, and confidential help on academic, personal, or career challenges.
          </motion.p>
        </motion.header>

        <div className="flex flex-col items-center">
          {/* Initial Greeting Card (shown before chat starts) */}
          <AnimatePresence>
            {!chatOpen && (
              <motion.div
                key="greeting-card"
                className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30">
                    <i className="fas fa-robot text-white text-2xl"></i>
                  </div>
                </div>
                <motion.h2
                  className="text-2xl font-bold text-white mb-4 drop-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Welcome to TATHYA Moderator AI
                </motion.h2>
                <motion.p
                  className="text-blue-100 mb-6 drop-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  I'm here to provide 24/7 support and guidance. Ask me anything related to your academic or personal challenges.
                </motion.p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="start-chat-btn bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-full font-bold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-1 border border-white/30"
                  onClick={handleStartChat}
                >
                  Start Confidential Chat <i className="fas fa-comment ml-2"></i>
                </motion.button>
                <motion.div
                  className="mt-6 text-sm text-blue-200 drop-shadow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <p>Powered by Advanced AI & Trained Moderators</p>
                  <p className="mt-1">Your conversations are anonymous and secure</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Interface (shown after clicking Start Chat) */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat-interface"
                className="chat-interface bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Chat Header */}
                <div className="chat-header bg-gradient-to-r from-blue-700/80 to-indigo-800/80 text-white p-4 flex items-center border-b border-white/20">
                  <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mr-3 border border-white/30">
                    <i className="fas fa-user-shield text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg drop-shadow">TATHYA Moderator AI</h3>
                    <p className="text-xs text-white/80 drop-shadow">Online • Anonymous & Secure</p>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="ml-auto text-white hover:text-gray-200 focus:outline-none"
                    aria-label="Close Chat"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {/* Chat Messages Area */}
                <div className="chat-messages flex-1 p-4 overflow-y-auto bg-gray-900/20" style={{ maxHeight: '400px' }}>
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`message mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : msg.isError
                              ? 'bg-red-500/20 text-red-200 border border-red-500/50 rounded-bl-none'
                              : 'bg-white/10 text-white border border-white/20 rounded-bl-none backdrop-blur-sm'
                          }`}
                        >
                          <div className="message-content whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>
                          <div className={`message-timestamp text-xs mt-1 ${
                            msg.role === 'user' ? 'text-blue-200' : msg.isError ? 'text-red-400' : 'text-blue-300'
                          }`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      className="message mb-4 flex justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="bg-white/10 text-white border border-white/20 rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center">
                          <div className="typing-indicator flex space-x-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                          <span className="ml-2 text-blue-300 text-sm">Moderator is typing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message Display */}
                  {error && (
                    <motion.div
                      className="message mb-4 flex justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="bg-red-500/20 text-red-200 border border-red-500/50 rounded-2xl px-4 py-3 max-w-[90%] backdrop-blur-sm">
                        <div className="message-content whitespace-pre-wrap break-words">
                          <i className="fas fa-exclamation-triangle mr-2"></i> {error}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Area */}
                <div className="chat-input-area p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-200/70 backdrop-blur-sm"
                      placeholder="Type your confidential message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                      disabled={isLoading}
                      aria-label="Type your message"
                    />
                    <motion.button
                      whileHover={!isLoading ? { scale: 1.05 } : {}}
                      whileTap={!isLoading ? { scale: 0.95 } : {}}
                      className={`send-button px-5 py-3 rounded-r-full font-semibold text-white ${
                        isLoading
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                      } transition-colors duration-300 flex items-center justify-center border border-white/30`}
                      onClick={handleSend}
                      disabled={isLoading}
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </motion.button>
                  </div>
                  <div className="text-xs text-blue-200 mt-2 text-center drop-shadow">
                    Your message is completely anonymous. Powered by TATHYA AI & Human Moderators.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Static Help & Support Section (Professional & Beautiful) */}
        <motion.section
          className="help-support-section mt-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-white mb-4 drop-shadow"
              variants={itemVariants}
            >
              Need More Support?
            </motion.h2>
            <motion.div
              className="w-20 h-1 bg-blue-400 mx-auto"
              variants={itemVariants}
            ></motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'fa-headset',
                title: 'Human Moderator',
                description: 'Connect directly with a trained human moderator for complex issues requiring personalized attention. Available 24/7 for confidential support.',
              },
              {
                icon: 'fa-book',
                title: 'Community Guidelines',
                description: 'Review our community rules and best practices for a safe and respectful environment. Understand how to participate responsibly.',
              },
              {
                icon: 'fa-question-circle',
                title: 'FAQ',
                description: 'Find quick answers to common questions about using TATHYA, reporting issues, and accessing support services efficiently.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="help-card bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-400/30">
                  <i className={`fas ${item.icon} text-blue-300 text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow">{item.title}</h3>
                <p className="text-blue-100 mb-4 flex-1 drop-shadow">{item.description}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => alert(`Action for '${item.title}' would be triggered here.`)} // Static action
                    className="inline-flex items-center text-blue-300 font-semibold transition-colors duration-300 hover:text-white"
                  >
                    Learn More <i className="fas fa-arrow-right ml-2 transition-transform duration-300 hover:translate-x-1"></i>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Moderator;