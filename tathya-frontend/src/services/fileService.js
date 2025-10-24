// Function to convert file size to readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Function to get file type
export const getFileType = (fileName) => {
  return fileName.split('.').pop().toUpperCase();
};

// Function to handle file upload
export const handleFileUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve({
        file: file,
        preview: event.target.result,
        type: getFileType(file.name),
        size: formatFileSize(file.size)
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};