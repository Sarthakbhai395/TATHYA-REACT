// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import postService from '../services/postService';

// Simple Home feed component — loads recent posts from backend and allows creating posts with attachments
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const json = await postService.fetchRecentPosts();
      setPosts(json.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e) => setFiles(Array.from(e.target.files || []));

  const handleCreate = async () => {
    if (!title.trim() && !content.trim()) return alert('Add title or content');
    try {
      const created = await postService.createPost({ title, content, files });
      setPosts(prev => [created, ...prev]);
      setTitle(''); setContent(''); setFiles([]); if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Could not create post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-2">Create Post</h3>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border mb-2" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write something..." className="w-full p-2 border mb-2" />
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
          <div className="mt-3 flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Publish</button>
            <button onClick={() => { setTitle(''); setContent(''); setFiles([]); if (fileRef.current) fileRef.current.value = ''; }} className="px-4 py-2 border rounded">Clear</button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
          {loading ? <p>Loading...</p> : posts.length === 0 ? <p>No posts yet</p> : (
            posts.map(p => (
              <div key={p._id} className="mb-4 bg-white p-4 rounded shadow">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500 mb-2">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="mb-2">{p.content}</div>
                {p.attachments && p.attachments.map((a, i) => (
                  <div key={i} className="mt-2">
                    {a.mimetype && a.mimetype.startsWith('image/') ? <img src={a.path} className="max-h-64 w-full object-contain" alt="attachment" /> : null}
                    {a.mimetype && a.mimetype.startsWith('video/') ? <video controls className="w-full max-h-96"><source src={a.path} /></video> : null}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;