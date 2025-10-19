import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Schedule() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60'); // in minutes
  const [image, setImage] = useState(''); // New state for image URL

  useEffect(() => {
    fetchSessions();
    if (user) {
      fetchBookmarkedSessions();
    }
  }, [user]);

  async function fetchSessions() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookmarkedSessions() {
    try {
      const res = await axios.get('/api/sessions/bookmarks');
      setBookmarkedSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load bookmarked sessions');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const sessionData = {
      title,
      description,
      speaker,
      location,
      dateTime: `${date}T${time}`,
      duration: parseInt(duration),
      image // Include image in session data
    };
    
    try {
      if (editingSession) {
        await axios.put(`/api/sessions/${editingSession._id}`, sessionData);
      } else {
        await axios.post('/api/sessions', sessionData);
      }
      
      // Reset form
      resetForm();
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session');
    }
  }

  async function deleteSession(id) {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await axios.delete(`/api/sessions/${id}`);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  }

  async function toggleBookmark(sessionId) {
    try {
      if (bookmarkedSessions.some(s => s._id === sessionId)) {
        await axios.delete(`/api/sessions/${sessionId}/bookmark`);
        setBookmarkedSessions(bookmarkedSessions.filter(s => s._id !== sessionId));
      } else {
        await axios.post(`/api/sessions/${sessionId}/bookmark`);
        const session = sessions.find(s => s._id === sessionId);
        if (session) {
          setBookmarkedSessions([...bookmarkedSessions, session]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle bookmark');
    }
  }

  function editSession(session) {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description);
    setSpeaker(session.speaker);
    setLocation(session.location);
    setImage(session.image || ''); // Set image when editing
    const dateTime = new Date(session.dateTime);
    setDate(dateTime.toISOString().split('T')[0]);
    setTime(dateTime.toTimeString().slice(0, 5));
    setDuration(session.duration.toString());
    setShowForm(true);
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setSpeaker('');
    setLocation('');
    setImage('');
    setDate('');
    setTime('');
    setDuration('60');
    setEditingSession(null);
  }

  function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.dateTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Event Schedule
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Plan your event experience
          </p>
        </div>
        {user?.role === 'organizer' && (
          <button 
            className={`px-4 py-2 rounded ${showForm ? 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : 'Add Session'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {showForm && user?.role === 'organizer' && (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <h2 className="font-bold text-xl mb-6">
            {editingSession ? 'Edit Session' : 'Add New Session'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Speaker</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Poster</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {editingSession ? 'Update Session' : 'Add Session'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : Object.keys(groupedSessions).length === 0 ? (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-12 text-center dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">No sessions scheduled yet</h3>
          <p className="text-gray-600 dark:text-slate-400">
            {user?.role === 'organizer' 
              ? 'Add your first session using the button above.' 
              : 'Check back later for the event schedule.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([date, sessions]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-xl font-bold pb-2 border-b border-gray-200 dark:border-slate-800">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <div 
                    key={session._id} 
                    className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center"
                  >
                    {/* Session image */}
                    {session.image && (
                      <div className="mb-4 rounded overflow-hidden">
                        <img 
                          src={session.image} 
                          alt={session.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{session.title}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                          {session.speaker}
                        </p>
                      </div>
                      {user && (
                        <button
                          onClick={() => toggleBookmark(session._id)}
                          className={`text-xl ${bookmarkedSessions.some(s => s._id === session._id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                          aria-label={bookmarkedSessions.some(s => s._id === session._id) ? "Remove bookmark" : "Bookmark session"}
                        >
                          {bookmarkedSessions.some(s => s._id === session._id) ? '★' : '☆'}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-slate-300 text-sm mb-4">
                      {session.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <span className="mr-2">📅</span>
                        {formatDateTime(session.dateTime)}
                        <span className="mx-2">•</span>
                        <span>{session.duration} min</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <span className="mr-2">📍</span>
                        {session.location}
                      </div>
                    </div>
                    
                    {user?.role === 'organizer' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                        <button
                          className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-slate-600"
                          onClick={() => editSession(session)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                          onClick={() => deleteSession(session._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {user && bookmarkedSessions.length > 0 && (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <h2 className="font-bold text-xl mb-6">⭐ My Bookmarked Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarkedSessions.map((session) => (
              <div 
                key={session._id} 
                className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded shadow p-4 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center"
              >
                {/* Session image for bookmarked sessions */}
                {session.image && (
                  <div className="mb-3 rounded overflow-hidden">
                    <img 
                      src={session.image} 
                      alt={session.title}
                      className="w-full h-24 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      {session.speaker}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(session._id)}
                    className="text-amber-500 text-lg"
                    aria-label="Remove bookmark"
                  >
                    ★
                  </button>
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                  {formatDateTime(session.dateTime)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}