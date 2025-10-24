import React, { useState } from 'react';

const ShareModal = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  // Generate post URL
  const postUrl = `${window.location.origin}/post/${post._id}`;
  
  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  // Social media share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title || 'Check out this post!')}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title || 'Check out this post!')} ${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title || 'Check out this post!')}`,
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Share Post</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Share this post via:</p>
          <div className="flex justify-around mb-4">
            <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href={shareUrls.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
            <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
              </svg>
            </a>
            <a href={shareUrls.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.372-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm3.224 17.871c.188.133.43.166.619.098.189-.068.34-.25.416-.439.728-1.841 2.261-7.209 2.866-9.984.04-.184-.006-.371-.131-.51-.126-.141-.316-.22-.509-.212-.95.041-3.038.633-4.856.881-1.497.204-2.958.416-3.597.526-.635.109-1.935.383-2.039.394-.317.038-.519.244-.519.52 0 .357.28.64.631.681.009 0 1.485.178 1.485.178.152.024.295.101.394.216.098.115.146.26.135.406-.08 1.082-.159 2.15-.247 3.269-.039.478-.087 1.084-.132 1.658l-.025.295c-.026.309.161.579.467.68.306.099.64-.06.795-.352l.749-1.275.997-1.702.224-.392c.198-.346.576-.582.988-.631l3.878-.503.523-.075h.06c.33-.036.66.127.826.425.164.298.149.654-.043.937l-1.699 2.489-.242.367-.076.109-.164.233c-.353.502-.330 1.129.06 1.527.345.35.948.526 1.467.426l1.293-.221c.603-.101 1.209-.207 1.813-.339.882-.193 1.681-.39 2.279-.545.063-.015.12-.033.177-.053z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Or copy link:</p>
          <div className="flex">
            <input 
              type="text" 
              value={postUrl} 
              readOnly 
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none"
            />
            <button 
              onClick={handleCopyLink}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md focus:outline-none"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Post preview:</p>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
              <a 
                href={`${window.location.origin}/post/${post._id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img 
                  src={`${typeof post.attachments[0] === 'string' ? 
                    (post.attachments[0].startsWith('http') ? '' : 'http://localhost:5000/') + post.attachments[0] : 
                    (post.attachments[0].url ? post.attachments[0].url : '')}`} 
                  alt="Post attachment" 
                  className="w-full h-auto rounded-md"
                />
                <div className="mt-2 text-center text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Click to view post
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;