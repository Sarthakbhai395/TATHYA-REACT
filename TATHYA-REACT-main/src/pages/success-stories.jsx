// src/pages/success-stories.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Professional Success Stories Page with submission modal and persistence
const STORAGE_KEY = 'tathya-success-stories';

const initialStories = [
  {
    id: 1,
    title: "Overcoming Academic Bullying: Priya's Journey to Confidence",
    excerpt: "How TATHYA helped a shy engineering student confront persistent harassment and reclaim her academic space.",
    content: `Priya Sharma shares how anonymous reporting and peer support helped her reclaim confidence and academic success.`,
    authorName: "Priya Sharma",
    date: "2023-11-15",
    category: 'Academic Harassment',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5cd?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.1.0',
  },
  {
    id: 2,
    title: "Breaking Free from Excessive Pressure: Rohan's Story of Balance",
    excerpt: "A medical student learns to manage overwhelming academic demands and finds a healthier path forward with TATHYA's support.",
    content: `Rohan Verma details how community and practical tools helped him manage burnout and find a sustainable career path.`,
    authorName: "Rohan Verma",
    date: "2024-01-28",
    category: 'Academic Pressure',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0',
  },
];

const ProfessorImage = () => (
  // Left-aligned Indian professor illustration (fallback to royalty-free photo)
  <img
    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
    alt="Professor"
    className="w-full h-full object-cover rounded-l-2xl"
    style={{ maxHeight: 240 }}
  />
);

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch (e) {
    return iso;
  }
};

export default function SuccessStories() {
  const [stories, setStories] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return initialStories;
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStory, setNewStory] = useState({ name: '', title: '', content: '', imageData: null, videoData: null });

  const [activeStory, setActiveStory] = useState(null);

  // Delete a story by id (permanent)
  const deleteStory = (id) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) return;
    setStories(prev => prev.filter(s => s.id !== id));
  };

  // Render multi-paragraph content safely
  const renderContent = (text) => {
    return text.split(/\n\n+/).map((para, idx) => (
      <p key={idx} className="mb-4 text-gray-700">{para}</p>
    ));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }, [stories]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    stories.forEach(s => set.add(s.category || 'General'));
    return Array.from(set);
  }, [stories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories.filter(s => {
      if (category !== 'All' && (s.category || 'General') !== category) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
        (s.content && s.content.toLowerCase().includes(q)) ||
        (s.authorName && s.authorName.toLowerCase().includes(q))
      );
    });
  }, [stories, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageStories = filtered.slice((page - 1) * perPage, page * perPage);

  // Publish new story
  const publish = () => {
    if (!newStory.name.trim() || !newStory.content.trim()) {
      alert('Please enter your name and your story before publishing.');
      return;
    }
    setSubmitting(true);
    const id = Date.now();
    const story = {
      id,
      title: newStory.title.trim() || `${newStory.name.trim()}'s Success Story`,
      excerpt: newStory.content.trim().slice(0, 140) + '...',
      content: newStory.content.trim(),
      authorName: newStory.name.trim(),
      date: new Date().toISOString(),
      category: 'Community',
      readTime: `${Math.max(1, Math.ceil(newStory.content.trim().split(/\s+/).length / 200))} min read`,
      image: newStory.imageData || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0',
      video: newStory.videoData || null,
    };
    setStories(prev => [story, ...prev]);
    setNewStory({ name: '', title: '', content: '', imageData: null, videoData: null });
    setShowSubmit(false);
    setSubmitting(false);
    setPage(1);
  };

  const cancelSubmit = () => {
    setNewStory({ name: '', title: '', content: '', imageData: null, videoData: null });
    setShowSubmit(false);
  };

  const openStory = (story) => {
    setActiveStory(story);
  };

  const closeStory = () => setActiveStory(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Success Stories</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">Real journeys from students and educators — read, get inspired, and share your story.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmit(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Your Success Story
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search by title, author, or content"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="absolute right-3 top-3 text-gray-400">🔎</div>
              </div>
              <div className="hidden md:block text-sm text-gray-500">Tip: Try searching "resume", "bullying", or an author name.</div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => { setQuery(''); setCategory('All'); setPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100"
              >Reset</button>
            </div>
          </div>
        </div>

        {/* First Featured Card with Professor image */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-3">
          <div className="col-span-1 md:col-span-1">
            <ProfessorImage />
          </div>
          <div className="p-6 md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">How TATHYA Helps — A Word from an Educator</h2>
                <p className="text-sm text-gray-500 mt-1">Dr. R. K. Gupta, Professor of Mechanical Engineering — on mentoring and student protection</p>
              </div>
              <div className="text-sm text-gray-400">Jan 2024</div>
            </div>

            <p className="mt-4 text-gray-700">"In my years of teaching I've seen many students struggle silently. Platforms like TATHYA bridge the gap between students and support systems — anonymous reporting, peer mentoring, and structured case-tracking make it easier for students to seek help without fear."</p>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => { window.scrollTo({top: 600, behavior: 'smooth'}); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Read Stories</button>
              <Link to="/user-dashboard" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg">Go to Dashboard</Link>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pageStories.map(story => (
            <motion.article key={story.id} className="bg-white rounded-xl shadow p-4 flex flex-col" whileHover={{ y: -6 }}>
              <div className="h-40 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {story.video ? (
                  <video controls className="w-full h-full object-cover">
                    <source src={story.video} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="mt-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  <button onClick={() => openStory(story)} className="text-left w-full">{story.title}</button>
                </h3>
                <p className="text-sm text-gray-500 mt-2">By <strong>{story.authorName}</strong> • {formatDate(story.date)} • {story.readTime}</p>
                <p className="mt-3 text-gray-700 text-sm">{story.excerpt}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">{story.category}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openStory(story)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Read</button>
                  <button onClick={() => deleteStory(story.id)} title="Delete story" className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 10-2 0v6a1 1 0 102 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
        </div>

      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
              <h3 className="text-xl font-semibold mb-3">Share Your Success Story</h3>
              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm text-gray-600">Your Name</label>
                <input value={newStory.name} onChange={(e) => setNewStory(n => ({...n, name: e.target.value}))} className="w-full border p-3 rounded" placeholder="Full name" />

                <label className="text-sm text-gray-600">Story Title (optional)</label>
                <input value={newStory.title} onChange={(e) => setNewStory(n => ({...n, title: e.target.value}))} className="w-full border p-3 rounded" placeholder="A short headline for your story" />

                <label className="text-sm text-gray-600">Your Success Story</label>
                <textarea value={newStory.content} onChange={(e) => setNewStory(n => ({...n, content: e.target.value}))} rows={8} className="w-full border p-3 rounded" placeholder="Share your experience..." />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Upload an image (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => setNewStory(n => ({...n, imageData: r.result}));
                      r.readAsDataURL(f);
                    }} className="w-full" />
                    {newStory.imageData && <img src={newStory.imageData} alt="preview" className="mt-2 w-full h-40 object-cover rounded" />}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Upload a video (optional)</label>
                    <input type="file" accept="video/*" onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => setNewStory(n => ({...n, videoData: r.result}));
                      r.readAsDataURL(f);
                    }} className="w-full" />
                    {newStory.videoData && (
                      <video controls className="mt-2 w-full h-40 object-cover rounded">
                        <source src={newStory.videoData} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={cancelSubmit} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={publish} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">{submitting ? 'Publishing...' : 'Publish'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read Story Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{activeStory.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">By <strong>{activeStory.authorName}</strong> • {formatDate(activeStory.date)} • {activeStory.readTime}</p>
                </div>
                <button onClick={closeStory} className="text-gray-500">Close</button>
              </div>
              {activeStory.video ? (
                <video controls className="w-full h-56 object-cover rounded-md mb-4">
                  <source src={activeStory.video} />
                </video>
              ) : (
                <img src={activeStory.image} alt={activeStory.title} className="w-full h-56 object-cover rounded-md mb-4" />
              )}
              <div className="prose max-w-none">
                {renderContent(activeStory.content)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}