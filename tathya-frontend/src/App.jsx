// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// --- Page Component Imports ---
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import UserDashboard from './pages/User-Dashboard'
import Login from './pages/Login';
import Signup from './pages/Signup';
import Guidelines from './pages/Guidelines';
import ResumeBuilder from './components/features/ResumeBuilder';
import SuccessStories from './pages/success-stories';
import ModeratorDashboard from './pages/ModeratorDashboard';
import Navbar from './components/layout/Navbar';
import Notifications from './pages/Notifications';
import CommunityHub from './pages/CommunityHub'; // Import CommunityHub
import AddToCommunity from './pages/AddToCommunity'; // Import AddToCommunity
import CommunityDashboard from './pages/CommunityDashboard'; // Import CommunityDashboard
import ForgotPassword from './pages/ForgotPassword'; // Import ForgotPassword
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import ModeratorProtectedRoute from './components/ModeratorProtectedRoute'; // Import ModeratorProtectedRoute

function App() {

  return (
    <div className="App">
      <Navbar />

      {/* Define all application routes */}
      <Routes>
        {/* Home page route */}
        <Route path="/" element={<Home />} />

        {/* About page route */}
        <Route path="/about" element={<About />} />

        {/* Contact page route */}
        <Route path="/contact" element={<ModeratorProtectedRoute><Contact /></ModeratorProtectedRoute>} />

        {/* User Dashboard route */}
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

        {/* Moderator Dashboard route */}
        <Route path="/moderator-dashboard" element={<ProtectedRoute><ModeratorDashboard /></ProtectedRoute>} />

        {/* Login page route */}
        <Route path="/login" element={<Login />} />

        {/* Signup page route */}
        <Route path="/signup" element={<Signup />} />

        {/* Forgot Password page route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Guidelines page route */}
        <Route path="/Guidelines" element={<Guidelines />} />

        {/* Resume Builder route */}
        <Route path="/resume" element={<ResumeBuilder />} />

        {/* Success Stories route */}
        <Route path="/success-stories" element={<SuccessStories />} />

        {/* Notifications route with protected route */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Community Hub route */}
        <Route path="/community" element={<CommunityHub />} />
        <Route path="/community/:communityId" element={<CommunityHub />} />

        {/* Add To Community route */}
        <Route path="/add-to-community" element={<AddToCommunity />} />

        {/* Community Dashboard route */}
        <Route path="/community-dashboard/:communityId" element={<CommunityDashboard />} />

        {/* Add other routes here as needed */}
        {/* Example: */}
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        {/* <Route path="/report-issue" element={<ReportIssue />} /> */}
        {/* <Route path="/community-feed" element={<CommunityFeed />} /> */}

        {/* Catch-all route for 404 pages (optional but recommended) */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}

export default App;