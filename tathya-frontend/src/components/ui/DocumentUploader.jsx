import React, { useState } from 'react';
import { handleFileUpload } from '../../services/fileService';

const DocumentUploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const processedFile = await handleFileUpload(file);
      
      // Complete the progress
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        onUploadSuccess(processedFile);
      }, 500);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  return (
    <div
      className={`upload-zone border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput').click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
      <p className="text-gray-600">
        Drag & drop your files here or <span className="text-blue-500">browse</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Supported formats: PDF, DOC, DOCX, JPG, PNG
      </p>
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;