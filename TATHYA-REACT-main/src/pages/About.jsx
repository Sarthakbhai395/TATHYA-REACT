// src/pages/About.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import postService from '../services/postService';

// We'll reuse the Home feed presentation as the About page per user's request.
const About = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // fetch global feed (no communityId)
    async function load() {
      try {
        // There is no global posts endpoint; fetch a community feed if you know an id.
        // As a fallback, fetch latest posts by querying community 'all' or use first community route.
        // Here we'll try to fetch a public community if exists; to keep simple, call backend GET /api/posts/community/<some-id> is required.
        // Instead, call GET /api/posts/community/ to avoid failing — but server expects id. So we'll call /api/posts (not implemented) -> fallback: keep empty until backend provides a global endpoint.
        setLoadingPosts(false);
      } catch (err) {
        console.error('Failed to load posts', err);
        setLoadingPosts(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveSelected = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please enter title and content');
      return;
    }
    try {
      const res = await postService.createPost({ title: newPostTitle, content: newPostContent, files: selectedFiles });
      alert('Post created');
      // Prepend to posts list if necessary
      setPosts(prev => [{
        id: res._id,
        title: res.title,
        content: res.content,
        attachments: res.attachments || [],
        likes: res.likes || 0,
        comments: res.comments || [],
        createdAt: res.createdAt,
      }, ...prev]);
      setNewPostContent('');
      setNewPostTitle('');
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert('Failed to create post: ' + (err.message || err));
    }
  };

  return (
    <div className={`min-h-screen bg-white font-sans font-[Open_Sans] transition-colors duration-500 ${isPageLoaded ? 'bg-white' : 'bg-black'}`}>
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto"> 
          <h1 className="text-lg font-bold">About (Community Feed)</h1>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Create a Post</h2>
          <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} placeholder="Title" className="w-full mb-3 p-2 border" />
          <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={4} placeholder="What's happening?" className="w-full p-2 border mb-3" />
          <div className="flex gap-2 mb-3">
            <input type="file" ref={imageInputRef} onChange={handleFileSelect} accept="image/*,video/*" multiple />
          </div>
          <div className="flex gap-2 mb-3">
            {selectedFiles.map((f, i) => (
              <div key={i} className="p-2 border rounded">
                <div className="text-sm">{f.name}</div>
                <button onClick={() => handleRemoveSelected(i)} className="text-xs text-red-600">Remove</button>
              </div>
            ))}
          </div>
          <div>
            <button onClick={handlePublish} className="px-4 py-2 bg-blue-600 text-white rounded">Publish</button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Feed</h2>
          {loadingPosts ? (<p>Loading...</p>) : (
            posts.length === 0 ? <p>No posts yet</p> : (
              posts.map(p => (
                <div key={p.id || p._id} className="mb-4 p-4 bg-white border rounded">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleString()}</p>
                  <p className="mt-2">{p.content}</p>
                  {p.attachments && p.attachments.length > 0 && (
                    <div className="mt-2">
                      {p.attachments.map((a, idx) => (
                        <div key={idx} className="mt-1">
                          {a.mimetype.startsWith('image/') ? (
                            <img src={a.path} alt={a.filename} className="max-h-48 object-contain" />
                          ) : a.mimetype.startsWith('video/') ? (
                            <video controls className="max-h-64 w-full"><source src={a.path} /></video>
                          ) : (
                            <a href={a.path} target="_blank" rel="noreferrer">{a.filename}</a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </section>
      </main>
    </div>
  );
};

export default About;