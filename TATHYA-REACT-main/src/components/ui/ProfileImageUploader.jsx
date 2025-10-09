import React, { useRef } from 'react';

const ProfileImageUploader = ({ currentImage, onImageChange }) => {
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleImageClick}>
      <img
        src={currentImage}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <i className="fas fa-camera text-white text-xl"></i>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfileImageUploader;