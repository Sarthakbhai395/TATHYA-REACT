// src/services/socketService.js
import { io } from 'socket.io-client';
import { getAuthUser } from './authService';
import { API_BASE } from '../utils/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.fallbackInterval = null;
    this.messageCallbacks = [];
    this.sentCallbacks = [];
  }

  connect() {
    // First try Socket.IO connection
    this.trySocketIOConnection();
    
    // Set up fallback polling mechanism
    this.setupFallbackPolling();
    
    return this;
  }

  trySocketIOConnection() {
    try {
      // Get the API base URL and remove /api part for Socket.IO connection
      const SOCKET_URL = API_BASE.replace('/api', '');
      
      // Create socket connection - connect to the server root, not API endpoint
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Handle connection events
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
        
        // Register user
        const user = getAuthUser();
        if (user && user._id) {
          this.socket.emit('register', { userId: user._id });
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

      // Message events
      this.socket.on('receive_message', (message) => {
        console.log('Received message via socket:', message);
        this.messageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('message_sent', (message) => {
        console.log('Message sent confirmation via socket:', message);
        this.sentCallbacks.forEach(callback => callback(message));
      });
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
      this.isConnected = false;
    }
  }

  setupFallbackPolling() {
    // Clear any existing interval
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
    }
    
    // Set up polling every 5 seconds as fallback
    this.fallbackInterval = setInterval(() => {
      // This will be implemented in the components that use this service
    }, 5000);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
    
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  sendMessage(data) {
    if (this.socket && this.isConnected) {
      console.log('Sending message via socket:', data);
      this.socket.emit('send_message', data);
      return true;
    }
    return false;
  }

  onMessageReceived(callback) {
    this.messageCallbacks.push(callback);
  }

  onMessageSent(callback) {
    this.sentCallbacks.push(callback);
  }

  offMessageReceived(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  offMessageSent(callback) {
    this.sentCallbacks = this.sentCallbacks.filter(cb => cb !== callback);
  }
  
  // Fallback method to manually trigger message check
  async checkForNewMessages() {
    // This will be called by components when needed
    return false;
  }
}

// Export singleton instance
export default new SocketService();