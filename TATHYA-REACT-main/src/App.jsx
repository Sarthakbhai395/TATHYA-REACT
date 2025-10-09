// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Moderator from './pages/Moderator';
import Navbar from './components/layout/Navbar';
import Notifications from './pages/Notifications';
import AddToCommunity from './pages/AddToCommunity'; // Import AddToCommunity
import CommunityDashboard from './pages/CommunityDashboard'; // Import CommunityDashboard

function App() {
  return (
    <Router>
      <div className="App">
        {/* The Navbar will be visible on all pages listed in the Routes below */}
        <Navbar />

        {/* Define all application routes */}
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />

          {/* About page route */}
          <Route path="/about" element={<About />} />

          {/* Contact page route */}
          <Route path="/contact" element={<Contact />} />

          {/* User Dashboard route */}
          <Route path="/user-dashboard" element={<UserDashboard />} />

          {/* Login page route */}
          <Route path="/login" element={<Login />} />

          {/* Signup page route */}
          <Route path="/signup" element={<Signup />} />

          {/* Guidelines page route */}
          <Route path="/Guidelines" element={<Guidelines />} />

          {/* Resume Builder route */}
          <Route path="/resume" element={<ResumeBuilder />} />

          {/* Success Stories route */}
          <Route path="/success-stories" element={<SuccessStories />} />

          {/* Moderator route */}
          <Route path="/moderator" element={<Moderator />} />

          {/* Notifications route */}
          <Route path="/notifications" element={<Notifications />} />

          {/* AddToCommunity route */}
          <Route path="/add-to-community" element={<AddToCommunity />} />

          {/* Community Dashboard route - Dynamic route for community ID */}
          <Route path="/community/:communityId" element={<CommunityDashboard />} />

          {/* Add other routes here as needed */}
          {/* Example: */}
          {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          {/* <Route path="/report-issue" element={<ReportIssue />} /> */}
          {/* <Route path="/community-feed" element={<CommunityFeed />} /> */}

          {/* Catch-all route for 404 pages (optional but recommended) */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;