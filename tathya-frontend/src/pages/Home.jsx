import React from 'react';
import { motion } from 'framer-motion';
import InstagramHome from '../components/InstagramHome';

// Simple Home feed component — loads recent posts from backend and allows creating posts with attachments
const Home = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
        backgroundColor: "#f0f2f5"
      }}
    >
      <div className="min-h-screen bg-black bg-opacity-30">
        <InstagramHome />
      </div>
    </div>
  );
};

export default Home;