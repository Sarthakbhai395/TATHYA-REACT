// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";
// Import jsPDF for PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Optional: for tables in PDF

const UserDashboard = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [activeMenu, setActiveMenu] = useState('dashboard-overview');
  const [activeProfileTab, setActiveProfileTab] = useState('personal-info');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  // --- Persistent Theme State (using localStorage) ---
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'system'; // Default to system
  });
  
  // --- Apply Theme Class to Body ---
  useEffect(() => {
    const root = document.documentElement; // Target <html> element
    root.classList.remove('light', 'dark'); // Remove previous theme classes
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    }
    // Save theme preference to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]); // Re-run effect when theme changes
  
  // --- User Data State (Initialized with defaults or from localStorage) ---
  const [userData, setUserData] = useState(() => {
    const savedData = localStorage.getItem('user-profile-data');
    return savedData ? JSON.parse(savedData) : {
      firstName: 'Sarthak',
      lastName: 'Sharma',
      email: 'sarthak@example.com',
      phone: '+91 9876543210',
      dob: '2000-01-15',
      location: 'Mumbai, India',
      university: 'Indian Institute of Technology',
      degree: 'B.Tech Computer Science',
      gradYear: '2024',
      skills: 'AWS Certified Developer, Google Cloud Associate, Cybersecurity Fundamentals - Cisco',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      // Add password field (in a real app, this wouldn't be stored client-side)
      password: 'currentPassword123'
    };
  });
  
  // --- Profile Editing State ---
  const [editedUserData, setEditedUserData] = useState({ ...userData });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // --- Document Management State ---
  const [documents, setDocuments] = useState(() => {
    const savedDocs = localStorage.getItem('user-documents');
    return savedDocs ? JSON.parse(savedDocs) : [
      { id: 1, name: 'ID Proof.pdf', type: 'PDF', size: '2.5 MB', uploaded: '2023-10-26', modified: '2023-10-26', status: 'Verified' },
    ];
  });
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  
  // --- Activities Log State ---
  const [activities, setActivities] = useState([
    { id: 1, action: 'Uploaded', item: 'ID Proof.pdf', time: 'Just now' },
    { id: 2, action: 'Updated', item: 'Profile Information', time: '5 minutes ago' },
  ]);
  
  // --- Resume Builder State (Basic) ---
  const [resumeData, setResumeData] = useState({
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    phone: userData.phone,
    summary: 'Motivated student seeking opportunities...',
    experience: [{ company: 'ABC Corp', position: 'Intern', duration: 'Summer 2023' }],
    education: [{ institution: userData.university, degree: userData.degree, year: userData.gradYear }],
    skills: userData.skills.split(', '),
  });
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // Default template
  
  // --- Reports Section State ---
  const [reports, setReports] = useState(() => {
    const savedReports = localStorage.getItem('user-reports');
    return savedReports ? JSON.parse(savedReports) : [
      { id: 1, title: 'Harassment in Classroom', status: 'In Review', date: '2023-10-25' },
      { id: 2, title: 'Excessive Assignment Load', status: 'Resolved', date: '2023-10-20' },
    ];
  });
  const [showCreateReportForm, setShowCreateReportForm] = useState(false); // State for inline form visibility
  const [newReportData, setNewReportData] = useState({ title: '', description: '' }); // State for new report input
  
  // --- Settings State ---
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('user-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profileVisibility: 'verified_only',
        anonymousComments: true,
      },
      // Add other settings as needed
    };
  });
  
  // --- Password Update State ---
  const [passwordUpdate, setPasswordUpdate] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // --- Delete Account Confirmation State ---
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // --- FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // --- Handle Menu Item Clicks ---
  const handleMenuClick = (target) => {
    setActiveMenu(target);
    // Reset profile tab to personal info when switching sections
    if (target === 'profile-section') {
      setActiveProfileTab('personal-info');
    }
    // Hide the report form when switching away from reports section
    if (target !== 'reports-section') {
        setShowCreateReportForm(false);
    }
  };
  
  // --- Handle Profile Tab Clicks ---
  const handleProfileTabClick = (tab) => {
    setActiveProfileTab(tab);
  };
  
  // --- Handle Profile Edit Save (Persistent) ---
  const handleSaveProfile = () => {
    const updatedData = { ...editedUserData };
    setUserData(updatedData);
    setIsEditingProfile(false);
    // Update resume data
    setResumeData(prev => ({
      ...prev,
      name: `${updatedData.firstName} ${updatedData.lastName}`,
      email: updatedData.email,
      phone: updatedData.phone,
      education: [{ institution: updatedData.university, degree: updatedData.degree, year: updatedData.gradYear }],
      skills: updatedData.skills.split(', ')
    }));
    // Persist to localStorage
    localStorage.setItem('user-profile-data', JSON.stringify(updatedData));
    alert('Profile updated successfully!');
  };
  
  // --- Handle Avatar Change ---
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUserData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // --- Handle Document Upload Input Change ---
  const handleDocFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewDocFile(file);
      // Optionally, pre-fill name/type from file
      if (!newDocName) setNewDocName(file.name);
      if (!newDocType) setNewDocType(file.type.split('/')[1].toUpperCase());
    }
  };
  
  // --- Handle Add Document (Functional & Persistent) ---
  const handleAddDocument = () => {
    if (!newDocName.trim() || !newDocType.trim() || !newDocFile) {
      alert('Please provide a document name, select a type, and choose a file.');
      return;
    }
    const newDocId = documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1;
    const newDoc = {
      id: newDocId,
      name: newDocName,
      type: newDocType.toUpperCase(),
      size: `${(newDocFile.size / (1024 * 1024)).toFixed(2)} MB`,
      uploaded: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0],
      status: 'Pending',
      file: newDocFile, // Store the actual File object
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    const newActivity = {
      id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
      action: 'Uploaded',
      item: newDoc.name,
      time: 'Just now',
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);
    // Persist documents to localStorage
    localStorage.setItem('user-documents', JSON.stringify(updatedDocs));
    // Reset form
    setNewDocName('');
    setNewDocType('');
    setNewDocFile(null);
    document.getElementById('document-upload-input').value = ''; // Clear file input visually
    alert(`Document "${newDoc.name}" uploaded successfully!`);
  };
  
  // --- Handle Document Preview ---
  const handlePreviewDocument = (docId) => {
    const doc = documents.find(d => d.id === docId);
    if (doc && doc.file) {
      const fileURL = URL.createObjectURL(doc.file);
      window.open(fileURL, '_blank'); // Opens in a new tab
      // Alternative: Use an iframe/modal to display within the app
      // Or download: const link = document.createElement('a'); link.href = fileURL; link.download = doc.name; link.click();
    } else {
      alert('Document file not found or not available for preview.');
    }
  };
  
  // --- Handle Document Delete (Persistent) ---
  const handleDeleteDocument = (docId) => {
    const docName = documents.find(doc => doc.id === docId)?.name;
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    const newActivity = {
      id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
      action: 'Deleted',
      item: docName,
      time: 'Just now',
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);
    // Persist updated documents list
    localStorage.setItem('user-documents', JSON.stringify(updatedDocs));
    alert(`Document "${docName}" deleted successfully!`);
  };
  
  // --- Handle Resume Data Change ---
  const handleResumeChange = (section, index, field, value) => {
    setResumeData(prev => {
      const updatedSection = [...prev[section]];
      updatedSection[index][field] = value;
      return { ...prev, [section]: updatedSection };
    });
  };
  
  // --- Handle Add Resume Section Item ---
  const handleAddResumeItem = (section) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], { company: '', position: '', duration: '' }] // Adjust fields as needed
    }));
  };
  
  // --- Handle Save Resume (Placeholder) ---
  const handleSaveResume = () => {
    console.log("Saving resume ", resumeData);
    alert('Resume saved! In a real app, this would generate/download a PDF.');
    // Logic to generate PDF or save data would go here
  };
  
  // --- Handle Download Resume (PDF) ---
  const handleDownloadResume = () => {
    const doc = new jsPDF();
    // Add Title
    doc.setFontSize(22);
    doc.text(resumeData.name, 20, 20);
    doc.setFontSize(12);
    doc.text(`${resumeData.email} | ${resumeData.phone}`, 20, 30);
    // Add Summary
    doc.setFontSize(14);
    doc.text('Professional Summary', 20, 45);
    doc.setFontSize(12);
    doc.text(resumeData.summary, 20, 52, { maxWidth: 170 });
    // Add Experience
    let yPos = 70;
    doc.setFontSize(14);
    doc.text('Experience', 20, yPos);
    yPos += 8;
    resumeData.experience.forEach((exp, index) => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(exp.position, 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(` at ${exp.company}`, 25 + doc.getTextWidth(exp.position), yPos);
        doc.text(exp.duration, 180, yPos, null, null, 'right'); // Align right
        yPos += 6;
        // Description could be added here if present in exp object
        yPos += 3; // Space after each experience
    });
    // Add Education
    yPos += 10; // Space before Education
    doc.setFontSize(14);
    doc.text('Education', 20, yPos);
    yPos += 8;
    resumeData.education.forEach((edu, index) => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(edu.degree, 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(` from ${edu.institution}`, 25 + doc.getTextWidth(edu.degree), yPos);
        doc.text(edu.year, 180, yPos, null, null, 'right'); // Align right
        yPos += 6;
        yPos += 3; // Space after each education
    });
    // Add Skills
    yPos += 10; // Space before Skills
    doc.setFontSize(14);
    doc.text('Skills', 20, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.text(resumeData.skills.join(', '), 25, yPos, { maxWidth: 150 });
    // Save the PDF
    doc.save(`${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`);
    alert('Resume downloaded as PDF!');
  };
  
  // --- Handle Settings Change (Persistent) ---
  const handleSettingsChange = (category, setting, value) => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value
        }
      };
      // Persist settings to localStorage
      localStorage.setItem('user-settings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };
  
  // --- Handle Theme Change ---
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Applying the theme is handled by the useEffect hook above
  };
  
  // --- Handle Password Update ---
  const handlePasswordUpdate = () => {
    // Basic validation
    if (!passwordUpdate.currentPassword || !passwordUpdate.newPassword || !passwordUpdate.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (passwordUpdate.newPassword !== passwordUpdate.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    // Check if current password matches (in a real app, this would involve an API call)
    if (passwordUpdate.currentPassword !== userData.password) {
      alert('Current password is incorrect.');
      return;
    }
    // Update password in state and localStorage
    const updatedUserData = { ...userData, password: passwordUpdate.newPassword };
    setUserData(updatedUserData);
    localStorage.setItem('user-profile-data', JSON.stringify(updatedUserData));
    // Reset form
    setPasswordUpdate({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password updated successfully!');
  };
  
  // --- Handle Delete Account Request ---
  const handleDeleteAccountRequest = () => {
    setShowDeleteConfirmation(true);
  };
  
  // --- Handle Confirm Delete Account ---
  const handleConfirmDeleteAccount = () => {
    // In a real app, this would trigger an API call to initiate the deletion process
    alert('Account deletion request sent to admin for approval.');
    setShowDeleteConfirmation(false);
    // Optionally, log the user out or redirect
    // navigate('/logout');
  };
  
  // --- Handle Cancel Delete Account ---
  const handleCancelDeleteAccount = () => {
    setShowDeleteConfirmation(false);
  };
  
  // --- Handle FAQ Toggle ---
  const handleFaqToggle = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  
  // --- Handle New Report Input Change ---
  const handleNewReportChange = (field, value) => {
    setNewReportData(prev => ({ ...prev, [field]: value }));
  };
  
  // --- Handle Submit New Report ---
  const handleSubmitNewReport = () => {
    if (!newReportData.title.trim() || !newReportData.description.trim()) {
        alert('Please fill in both the title and description for your report.');
        return;
    }
    const newReportId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newReport = {
        id: newReportId,
        title: newReportData.title,
        description: newReportData.description,
        status: 'Submitted',
        date: currentDate,
        time: currentTime, // Add time
        // In a real app, you might add fields like category, severity, etc.
    };
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    // Add activity log
    const newActivity = {
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        action: 'Reported',
        item: newReport.title,
        time: 'Just now',
    };
    setActivities(prevActivities => [newActivity, ...prevActivities]);
    // Persist reports to localStorage
    localStorage.setItem('user-reports', JSON.stringify(updatedReports));
    // Reset form and hide it
    setNewReportData({ title: '', description: '' });
    setShowCreateReportForm(false);
    alert(`Your report "${newReport.title}" has been submitted successfully!`);
  };
  
  // --- Handle Template Selection ---
  const handleTemplateSelect = (templateName) => {
      setSelectedTemplate(templateName);
      // Update resume preview or builder based on selected template if needed
      // For simplicity, we'll just log the selection
      console.log(`Selected template: ${templateName}`);
  };
  
  // --- Sample Resume Templates Data ---
  const resumeTemplates = [
      { id: 'modern', name: 'Modern', description: 'Clean and contemporary design.', color: 'bg-blue-500' },
      { id: 'classic', name: 'Classic', description: 'Traditional and professional layout.', color: 'bg-green-500' },
      { id: 'creative', name: 'Creative', description: 'Unique and eye-catching format.', color: 'bg-purple-500' },
      { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant style.', color: 'bg-gray-500' },
  ];
  
  // --- Calculate Full Name ---
  const fullName = `${userData.firstName} ${userData.lastName}`;
  
  // --- Menu Items Data ---
  const menuItems = [
    { id: 'dashboard-overview', icon: 'fa-th-large', label: 'Dashboard' },
    { id: 'profile-section', icon: 'fa-user', label: 'Profile' },
    { id: 'resume-section', icon: 'fa-file-alt', label: 'Resume' },
    { id: 'documents-section', icon: 'fa-folder-open', label: 'Documents' },
    { id: 'reports-section', icon: 'fa-clipboard-list', label: 'Reports' },
    { id: 'help-section', icon: 'fa-question-circle', label: 'Help & Support' },
  ];
  
  // --- FAQ Data ---
  const faqs = [
    {
      question: "How do I report an issue anonymously?",
      answer: "You can report an issue anonymously by navigating to the 'Reports' section in your dashboard and clicking 'Create New Report'. Fill out the form with your concern, and your identity will remain completely hidden."
    },
    {
      question: "What types of documents can I upload for verification?",
      answer: "Currently, we accept government-issued ID proofs like Aadhaar card, passport, or driver's license. Please ensure the document is clear and readable."
    },
    {
      question: "How long does it take for a reported case to be reviewed?",
      answer: "Our moderators aim to review all reports within 24-48 hours. Complex cases might take slightly longer. You can track the status of your report in the 'Reports' section."
    },
    {
      question: "Is my personal information shared with anyone?",
      answer: "Absolutely not. Your personal information is protected under strict privacy policies. It is never shared without your explicit consent, except as required by law."
    },
    {
      question: "Can I delete my account permanently?",
      answer: "Yes, you can request account deletion from the Settings section. This will initiate a process where your data is removed from our systems after a verification period. Note that some anonymized data might be retained for legal or analytical purposes."
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="sidebar w-64 bg-white shadow-md fixed h-full z-10 overflow-y-auto">
        <div className="sidebar-header p-4 bg-blue-600 text-white flex items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4315/4315445.png"
            alt="TATHYA Logo"
            className="h-10 w-auto mr-3 object-contain"
          />
          <h3 className="text-xl font-bold">TATHYA</h3>
        </div>
        <div className="sidebar-menu py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`menu-item w-full text-left px-6 py-3 flex items-center transition-colors duration-200 ${
                    activeMenu === item.id
                      ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <i className={`fas ${item.icon} mr-3`}></i>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 ml-64"> {/* ml-64 to account for fixed sidebar */}
        {/* Dashboard Header */}
        <header className="dashboard-header bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="welcome-msg">
            <h1 className="text-xl font-semibold">
              Hello, <span id="user-greeting-name" className="text-blue-600">{userData.firstName}</span>
            </h1>
            <p className="text-sm text-gray-600">Welcome back to your dashboard</p>
          </div>
          <div className="header-actions flex items-center space-x-4">
            <div className="notification-bell relative">
              <button 
                onClick={() => navigate('/notifications')} 
                className="text-gray-700 hover:text-blue-600"
              >
                <i className="fas fa-bell text-lg"></i>
                {notificationCount > 0 && (
                  <span className="notification-count absolute top-[-6px] right-[-6px] bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse-slow">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="user-profile relative">
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <img
                  src={userData.avatar}
                  alt="User Avatar"
                  className="user-avatar w-10 h-10 rounded-full object-cover mr-2 border border-gray-300"
                  id="header-user-avatar"
                />
                <div className="user-name flex flex-col items-start">
                  <span id="header-user-name" className="text-sm font-medium text-gray-800">
                    {userData.firstName}
                  </span>
                  <i className={`fas fa-chevron-down text-xs text-gray-500 transition-transform duration-300 ${
                    showUserDropdown ? 'rotate-180' : ''
                  }`}></i>
                </div>
              </button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content Sections */}
        <div className="dashboard-content-area p-6">
          {/* Dashboard Overview */}
          {activeMenu === 'dashboard-overview' && (
            <div className="dashboard-overview animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Total Documents', value: documents.length, icon: 'fa-folder-open', color: 'bg-blue-500' },
                  { title: 'Pending Actions', value: 2, icon: 'fa-clock', color: 'bg-yellow-500' },
                  { title: 'Resolved Reports', value: 1, icon: 'fa-check-circle', color: 'bg-green-500' },
                  { title: 'Active Sessions', value: 1, icon: 'fa-user', color: 'bg-purple-500' },
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center" style={{
                    background: '#1f2937',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 8px 1px rgba(255, 255, 255, 0.2), -4px -4px 8px 1px rgba(0, 0, 0, 0.4)'
                  }}>
                    <div className={`p-3 rounded-full ${stat.color} text-white mr-4`}>
                      <i className={`fas ${stat.icon} text-xl`}></i>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="activity-list space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="activity-item flex justify-between items-center border-b border-gray-100 pb-2">
                        <div>
                          <span className="font-medium">{activity.action}</span> {activity.item}
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMenuClick('documents-section')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-upload mr-2"></i> Upload Document
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMenuClick('reports-section')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-exclamation-triangle mr-2"></i> Report an Issue
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMenuClick('resume-section')}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-file-alt mr-2"></i> Build Resume
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/Guidelines')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-book mr-2"></i> Read Guidelines
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile Section */}
          {activeMenu === 'profile-section' && (
            <div className="profile-section animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Your Profile</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                {/* User Profile Header */}
                <div className="user-profile mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
                  <div className="relative">
                    <img
                      src={isEditingProfile ? editedUserData.avatar : userData.avatar} // Show edited avatar if editing
                      alt="User Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 mr-4"
                    />
                    {/* Camera Icon for Avatar Upload (only visible when editing) */}
                    {isEditingProfile && (
                      <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                        <i className="fas fa-camera text-xs"></i>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800" id="profile-display-name">
                      {isEditingProfile ? `${editedUserData.firstName} ${editedUserData.lastName}` : fullName}
                    </h3>
                    <p className="text-gray-600">{userData.email}</p>
                  </div>
                  {!isEditingProfile ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="edit-profile-btn bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </motion.button>
                  ) : (
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="cancel-edit-btn bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedUserData({ ...userData }); // Reset edits
                        }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="save-profile-btn bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {/* Profile Tabs */}
                <div className="profile-tabs border-b border-gray-200 mb-6">
                  <ul className="flex space-x-4">
                    {[
                      { id: 'personal-info', label: 'Personal Information' },
                      { id: 'academic-details', label: 'Academic Details' },
                      { id: 'preferences', label: 'Preferences' },
                    ].map((tab) => (
                      <li key={tab.id} className="mb-0">
                        <button
                          className={`profile-tab px-4 py-2 font-medium ${
                            activeProfileTab === tab.id
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                          onClick={() => handleProfileTabClick(tab.id)}
                        >
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Profile Tab Content */}
                <div className="profile-tab-content">
                  {/* Personal Info Tab */}
                  {activeProfileTab === 'personal-info' && (
                    <div id="personal-info">
                      {isEditingProfile ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                              <input
                                type="text"
                                value={editedUserData.firstName}
                                onChange={(e) => setEditedUserData({...editedUserData, firstName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                              <input
                                type="text"
                                value={editedUserData.lastName}
                                onChange={(e) => setEditedUserData({...editedUserData, lastName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                              type="email"
                              value={editedUserData.email}
                              onChange={(e) => setEditedUserData({...editedUserData, email: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={editedUserData.phone}
                                onChange={(e) => setEditedUserData({...editedUserData, phone: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                              <input
                                type="date"
                                value={editedUserData.dob}
                                onChange={(e) => setEditedUserData({...editedUserData, dob: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                              type="text"
                              value={editedUserData.location}
                              onChange={(e) => setEditedUserData({...editedUserData, location: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><strong>Name:</strong> {fullName}</div>
                          <div><strong>Email:</strong> {userData.email}</div>
                          <div><strong>Phone:</strong> {userData.phone}</div>
                          <div><strong>Date of Birth:</strong> {userData.dob}</div>
                          <div><strong>Location:</strong> {userData.location}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Academic Details Tab */}
                  {activeProfileTab === 'academic-details' && (
                    <div id="academic-details">
                      {isEditingProfile ? (
                        <>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">University/College</label>
                              <input
                                type="text"
                                value={editedUserData.university}
                                onChange={(e) => setEditedUserData({...editedUserData, university: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                              <input
                                type="text"
                                value={editedUserData.degree}
                                onChange={(e) => setEditedUserData({...editedUserData, degree: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                              <input
                                type="number"
                                value={editedUserData.gradYear}
                                onChange={(e) => setEditedUserData({...editedUserData, gradYear: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                min="1900"
                                max="2100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                              <input
                                type="text"
                                value={editedUserData.skills}
                                onChange={(e) => setEditedUserData({...editedUserData, skills: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><strong>University:</strong> {userData.university}</div>
                          <div><strong>Degree:</strong> {userData.degree}</div>
                          <div><strong>Graduation Year:</strong> {userData.gradYear}</div>
                          <div><strong>Skills:</strong> {userData.skills}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Preferences Tab */}
                  {activeProfileTab === 'preferences' && (
                    <div id="preferences">
                      {/* Display preferences or edit form if needed */}
                      <p>Preferences settings will go here.</p>
                      {isEditingProfile && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input type="checkbox" id="email-notifications" checked={settings.notifications.email} onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)} className="mr-2" />
                              <label htmlFor="email-notifications" className="text-sm text-gray-700">Email Notifications</label>
                            </div>
                            <div className="flex items-center">
                              <input type="checkbox" id="push-notifications" checked={settings.notifications.push} onChange={(e) => handleSettingsChange('notifications', 'push', e.target.checked)} className="mr-2" />
                              <label htmlFor="push-notifications" className="text-sm text-gray-700">Push Notifications</label>
                            </div>
                            <div className="flex items-center">
                              <input type="checkbox" id="sms-notifications" checked={settings.notifications.sms} onChange={(e) => handleSettingsChange('notifications', 'sms', e.target.checked)} className="mr-2" />
                              <label htmlFor="sms-notifications" className="text-sm text-gray-700">SMS Notifications</label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Resume Section */}
          {activeMenu === 'resume-section' && (
            <div className="resume-section animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Build Your Resume</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                 {showResumeBuilder ? (
                   // Simple Resume Builder Form (Placeholder)
                   <div className="resume-builder">
                     <h3 className="text-lg font-semibold mb-4">Edit Resume Details</h3>
                     {/* Basic Info */}
                     <div className="mb-4">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                       <input
                         type="text"
                         value={resumeData.name}
                         onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                         className="w-full p-2 border border-gray-300 rounded-md"
                       />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <input
                           type="email"
                           value={resumeData.email}
                           onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                           className="w-full p-2 border border-gray-300 rounded-md"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                         <input
                           type="text"
                           value={resumeData.phone}
                           onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                           className="w-full p-2 border border-gray-300 rounded-md"
                         />
                       </div>
                     </div>
                     <div className="mb-4">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                       <textarea
                         value={resumeData.summary}
                         onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                         rows="3"
                         className="w-full p-2 border border-gray-300 rounded-md"
                       ></textarea>
                     </div>
                     {/* Experience */}
                     <h4 className="text-md font-semibold mt-6 mb-2">Experience</h4>
                     {resumeData.experience.map((exp, index) => (
                       <div key={index} className="mb-3 p-2 border border-gray-200 rounded">
                         <input
                           type="text"
                           placeholder="Company"
                           value={exp.company}
                           onChange={(e) => handleResumeChange('experience', index, 'company', e.target.value)}
                           className="w-full p-1 mb-1 border border-gray-300 rounded text-sm"
                         />
                         <input
                           type="text"
                           placeholder="Position"
                           value={exp.position}
                           onChange={(e) => handleResumeChange('experience', index, 'position', e.target.value)}
                           className="w-full p-1 mb-1 border border-gray-300 rounded text-sm"
                         />
                         <input
                           type="text"
                           placeholder="Duration"
                           value={exp.duration}
                           onChange={(e) => handleResumeChange('experience', index, 'duration', e.target.value)}
                           className="w-full p-1 border border-gray-300 rounded text-sm"
                         />
                       </div>
                     ))}
                     <button
                       onClick={() => handleAddResumeItem('experience')}
                       className="text-blue-600 text-sm mb-4 hover:underline"
                     >
                       + Add Experience
                     </button>
                     {/* Education */}
                     <h4 className="text-md font-semibold mt-6 mb-2">Education</h4>
                     {resumeData.education.map((edu, index) => (
                       <div key={index} className="mb-3 p-2 border border-gray-200 rounded">
                         <input
                           type="text"
                           placeholder="Institution"
                           value={edu.institution}
                           onChange={(e) => handleResumeChange('education', index, 'institution', e.target.value)}
                           className="w-full p-1 mb-1 border border-gray-300 rounded text-sm"
                         />
                         <input
                           type="text"
                           placeholder="Degree"
                           value={edu.degree}
                           onChange={(e) => handleResumeChange('education', index, 'degree', e.target.value)}
                           className="w-full p-1 mb-1 border border-gray-300 rounded text-sm"
                         />
                         <input
                           type="text"
                           placeholder="Year"
                           value={edu.year}
                           onChange={(e) => handleResumeChange('education', index, 'year', e.target.value)}
                           className="w-full p-1 border border-gray-300 rounded text-sm"
                         />
                       </div>
                     ))}
                     {/* Skills */}
                     <h4 className="text-md font-semibold mt-6 mb-2">Skills</h4>
                     <input
                       type="text"
                       value={resumeData.skills.join(', ')}
                       onChange={(e) => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim())})}
                       placeholder="Skill 1, Skill 2, Skill 3"
                       className="w-full p-2 border border-gray-300 rounded-md"
                     />
                     <div className="flex justify-end space-x-2 mt-6">
                       <motion.button
                         whileHover={{ scale: 1.03 }}
                         whileTap={{ scale: 0.97 }}
                         onClick={() => setShowResumeBuilder(false)}
                         className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded transition-all duration-300 shadow-md hover:shadow-lg"
                       >
                         Cancel
                       </motion.button>
                       <motion.button
                         whileHover={{ scale: 1.03 }}
                         whileTap={{ scale: 0.97 }}
                         onClick={handleSaveResume}
                         className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded transition-all duration-300 shadow-md hover:shadow-lg"
                       >
                         Save
                       </motion.button>
                       <motion.button
                         whileHover={{ scale: 1.03 }}
                         whileTap={{ scale: 0.97 }}
                         onClick={handleDownloadResume}
                         className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded transition-all duration-300 shadow-md hover:shadow-lg"
                       >
                         Download
                       </motion.button>
                     </div>
                   </div>
                 ) : (
                   // Resume Preview / Templates Selection
                   <div className="resume-preview">
                     {/* Enhanced Resume Templates Selection */}
                     <div className="resume-templates mb-6">
                       <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose a Template</h3>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         {resumeTemplates.map((template) => (
                           <div
                             key={template.id}
                             className={`template-card border rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${
                               selectedTemplate === template.id
                                 ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                                 : 'border-gray-200 hover:shadow-md'
                             }`}
                             onClick={() => handleTemplateSelect(template.id)}
                           >
                             <div className={`mx-auto mb-2 ${template.color} border-2 border-dashed rounded-lg w-16 h-16`}></div>
                             <p className="text-sm font-medium">{template.name}</p>
                             <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     <div className="resume-preview-content mb-6">
                       <h3 className="text-lg font-semibold text-gray-800 mb-3">Resume Preview</h3>
                       <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-96">
                         {/* Placeholder for resume preview */}
                         <p className="text-center text-gray-500">Resume preview will appear here based on your selected template and profile data.</p>
                         <div className="mt-4 text-left">
                           <h4 className="font-bold text-lg">{resumeData.name}</h4>
                           <p className="text-gray-600">{resumeData.email} | {resumeData.phone}</p>
                           <p className="mt-2">{resumeData.summary}</p>
                           <h5 className="font-semibold mt-4">Experience</h5>
                           <ul className="list-disc pl-5">
                             {resumeData.experience.map((exp, i) => (
                               <li key={i} className="text-sm">{exp.position} at {exp.company} ({exp.duration})</li>
                             ))}
                           </ul>
                           <h5 className="font-semibold mt-4">Education</h5>
                           <ul className="list-disc pl-5">
                             {resumeData.education.map((edu, i) => (
                               <li key={i} className="text-sm">{edu.degree} from {edu.institution} ({edu.year})</li>
                             ))}
                           </ul>
                           <h5 className="font-semibold mt-4">Skills</h5>
                           <p className="text-sm">{resumeData.skills.join(', ')}</p>
                         </div>
                       </div>
                     </div>
                     
                     <motion.button
                       whileHover={{ scale: 1.03 }}
                       whileTap={{ scale: 0.97 }}
                       onClick={() => setShowResumeBuilder(true)}
                       className="generate-resume-btn bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                     >
                       Customize & Edit Resume
                     </motion.button>
                   </div>
                 )}
              </div>
            </div>
          )}
          
          {/* Documents Section */}
          {activeMenu === 'documents-section' && (
            <div className="documents-section animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Your Documents</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Add Document Form */}
                <div className="add-document mb-6 flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="e.g., ID Proof, Address Proof"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="pdf">PDF</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="doc">DOC</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                    <input
                      id="document-upload-input" // Give it an ID to clear it
                      type="file"
                      onChange={handleDocFileChange}
                      className="w-full p-1 border border-gray-300 rounded-md text-sm"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Restrict file types
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddDocument}
                    className="add-document-btn bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg self-end"
                  >
                    Add Document
                  </motion.button>
                </div>
                
                {/* Documents List */}
                <div className="documents-list">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-gray-500">No documents uploaded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documents.map((doc) => (
                            <tr key={doc.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  className="document-preview-btn text-blue-600 hover:text-blue-900 mr-3"
                                  onClick={() => handlePreviewDocument(doc.id)}
                                >
                                  <i className="fas fa-eye"></i> View
                                </button>
                                <button
                                  className="document-delete-btn text-red-600 hover:text-red-900"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Reports Section (Enhanced with Inline Form) */}
          {activeMenu === 'reports-section' && (
            <div className="reports-section animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Reports</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 mb-4">Here you can view, manage, and track the status of your submitted reports.</p>
                
                {/* Inline Create New Report Form */}
                <div className="mb-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreateReportForm(!showCreateReportForm)}
                    className="create-report-btn bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-md transition-all duration-300 inline-flex items-center shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-plus mr-2"></i> Create New Report
                  </motion.button>
                  
                  <AnimatePresence>
                    {showCreateReportForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Submit a New Report</h3>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                          <input
                            type="text"
                            value={newReportData.title}
                            onChange={(e) => handleNewReportChange('title', e.target.value)}
                            placeholder="Briefly describe the issue"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                          <textarea
                            value={newReportData.description}
                            onChange={(e) => handleNewReportChange('description', e.target.value)}
                            rows="4"
                            placeholder="Provide as much detail as possible about the incident, including dates, times, locations, and any witnesses."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowCreateReportForm(false)}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSubmitNewReport}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Publish Report
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Reports List */}
                <div className="report-list space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="report-card border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{report.title}</h4>
                          <p className="text-sm text-gray-600">Reported on: {report.date} at {report.time || 'N/A'}</p>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{report.description}</p>
                      {/* Removed View Details and Add Comment buttons as requested */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Help & Support Section (Enhanced) */}
          {activeMenu === 'help-section' && (
            <div className="help-section animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Help & Support Center</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 mb-6">
                  Welcome to the TATHYA Help & Support Center. We're here to assist you with any questions, issues, or guidance you may need.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* FAQ Section */}
                  <div className="help-card border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <i className="fas fa-question-circle text-blue-500 text-xl mt-1 mr-3"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h3>
                        <p className="text-gray-600 text-sm mt-1">Find quick answers to common questions.</p>
                      </div>
                    </div>
                    <div className="faq-accordion mt-2 space-y-2">
                      {faqs.map((faq, index) => (
                        <div key={index} className="faq-item border border-gray-200 rounded">
                          <button
                            className="faq-question w-full text-left p-3 font-medium text-gray-800 flex justify-between items-center hover:bg-gray-50 rounded-t"
                            onClick={() => handleFaqToggle(index)}
                          >
                            <span>{faq.question}</span>
                            <i className={`fas ${openFaqIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500`}></i>
                          </button>
                          {openFaqIndex === index && (
                            <div className="faq-answer p-3 text-gray-600 text-sm bg-gray-50 rounded-b">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contact Support */}
                  <div className="help-card border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <i className="fas fa-headset text-green-500 text-xl mt-1 mr-3"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Contact Support Team</h3>
                        <p className="text-gray-600 text-sm mt-1">Get direct assistance from our support staff.</p>
                      </div>
                    </div>
                    <Link to="/contact" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                      Contact Us <i className="fas fa-arrow-right ml-1 text-xs"></i>
                    </Link>
                  </div>
                  
                  {/* Community Guidelines */}
                  <div className="help-card border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <i className="fas fa-book text-purple-500 text-xl mt-1 mr-3"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Community Guidelines</h3>
                        <p className="text-gray-600 text-sm mt-1">Understand the rules for participating.</p>
                      </div>
                    </div>
                    <Link to="/Guidelines" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                      Read Guidelines <i className="fas fa-arrow-right ml-1 text-xs"></i>
                    </Link>
                  </div>
                  
                  {/* Report a Problem (Removed as requested) */}
                  {/* <div className="help-card border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start mb-3">
                      <i className="fas fa-bug text-red-500 text-xl mt-1 mr-3"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Report a Bug or Issue</h3>
                        <p className="text-gray-600 text-sm mt-1">Tell us about technical problems you encounter.</p>
                      </div>
                    </div>
                    <Link to="/report-problem" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                      Submit Report <i className="fas fa-arrow-right ml-1 text-xs"></i>
                    </Link>
                  </div> */}
                </div>
                
                {/* Emergency Contact (Removed as requested) */}
                {/* <div className="emergency-contact bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="text-lg font-semibold text-red-700 flex items-center">
                    <i className="fas fa-exclamation-triangle mr-2"></i> Crisis or Emergency?
                  </h3>
                  <p className="text-red-600 mt-1">
                    If you are in immediate danger or experiencing a crisis, please contact local emergency services (Police: 100, Ambulance: 102) or a national helpline.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href="tel:100" className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors">
                      Call Police (100)
                    </a>
                    <a href="tel:102" className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors">
                      Call Ambulance (102)
                    </a>
                    <a href="https://www.vimhansdelhi.com/" target="_blank" rel="noopener noreferrer" className="text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors">
                      National Mental Health Helpline
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Account Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action is irreversible and will permanently remove all your data.
              </p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelDeleteAccount}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-300"
                >
                  No, Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmDeleteAccount}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Yes, Delete
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;