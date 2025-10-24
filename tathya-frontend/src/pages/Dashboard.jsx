import React, { useState, useEffect } from 'react';
import ResumeBuilder from '../components/features/ResumeBuilder';
import defaultAvatar from '../assets/default-avatar.png';

const Dashboard = () => {
  const [profileImage, setProfileImage] = useState(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    return savedImage || defaultAvatar;
  });
  const [documents, setDocuments] = useState([]);
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    skills: 'React, JavaScript, Node.js',
    university: 'Example University',
    degree: 'Bachelor of Science',
    location: 'New York, USA'
  });

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toLocaleDateString()
    }));
    setDocuments([...documents, ...newDocuments]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userData.firstName} {userData.lastName}</h2>
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="mt-2 text-gray-600">Drop files here or click to upload</span>
              <input
                type="file"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Document List */}
          <div className="mt-4">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(doc.size / 1024)} KB • {doc.uploadDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Builder Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Builder</h3>
          <ResumeBuilder userData={userData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;