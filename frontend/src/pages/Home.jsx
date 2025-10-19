import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSocket from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const categories = ['All','Tech','Sports','Cultural','Workshop'];
  const { announcements } = useSocket(window.location.origin);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) fetchRecs();
    else setRecs([]);
  }, [user]);

  async function fetchEvents(overrides = {}) {
    setLoading(true);
    setError('');
    try {
      const effQ = overrides.q !== undefined ? overrides.q : q;
      const effCategory = overrides.category !== undefined ? overrides.category : category;
      const params = {};
      if (effQ) params.q = effQ;
      if (effCategory) params.category = effCategory;
      const res = await axios.get('/api/events', { params });
      setEvents(res.data.events || []);
    } catch (e) {
      setError('Failed to load events. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecs() {
    try {
      const res = await axios.get('/api/stats/recommendations');
      setRecs(res.data.events || []);
    } catch (_) {}
  }

  const Badge = ({ status }) => (
    <span className={`text-xs px-2 py-1 rounded ${status==='approved' ? 'bg-green-100 text-green-800' : status==='pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{status}</span>
  );

  const Card = ({ e }) => (
    // Updated to use banner.jpg as background in dark mode
    <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
      {/* Event image */}
      <div className="mb-4 rounded overflow-hidden">
        <img
          src={e.posterUrl ? `${e.posterUrl}?v=${Date.now()}` : '/placeholder.svg'}
          alt={`${e.title} poster`}
          className="w-full h-40 object-cover"
          onError={(ev)=>{ 
            ev.currentTarget.onerror=null; 
            ev.currentTarget.src='/placeholder.svg';
            ev.currentTarget.alt='Event poster placeholder';
          }}
          loading="lazy"
        />
      </div>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{e.title}</h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
            {e.organizer?.name || 'Event Organizer'}
          </p>
        </div>
        <Link to={`/events/${e._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
          View
        </Link>
      </div>
      
      <p className="text-gray-700 dark:text-slate-300 text-sm mb-4 line-clamp-2">
        {e.description}
      </p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600 dark:text-slate-400">
          <span className="mr-2">📅</span>
          {new Date(e.date).toLocaleDateString()}
          <span className="mx-2">•</span>
          <span>{e.duration || '60'} min</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-slate-400">
          <span className="mr-2">📍</span>
          {e.location}
        </div>
        <div className="flex items-center text-gray-600 dark:text-slate-400">
          <span className="mr-2">🏷️</span>
          <span>{e.category}</span>
          <span className="mx-2">•</span>
          <Badge status={e.status} />
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 items-center justify-between">
        <div className="flex items-center text-amber-600">
          <span>⭐</span>
          <span className="ml-1">{e.averageRating?.toFixed?.(1) || '0.0'}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400">
          {e.capacity ? `${e.capacity} spots` : 'Unlimited'}
        </div>
      </div>
    </div>
  );

  const Skeleton = () => (
    // Updated to use banner.jpg as background in dark mode for skeleton loader as well
    <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center animate-pulse">
      <div className="mb-4 rounded overflow-hidden">
        <div className="w-full h-40 bg-gray-200 dark:bg-slate-700" />
      </div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 w-3/4 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 w-1/2 rounded"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 w-full rounded mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 w-2/3 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 w-1/2 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 w-2/3 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 w-3/4 rounded"></div>
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 w-16 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 w-20 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg p-4 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      {announcements.length > 0 && (
        <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <div className="font-semibold mb-2">📢 Live announcements</div>
          <ul className="text-sm text-green-800 dark:text-green-200 list-disc pl-5 space-y-1">
            {announcements.slice(0,3).map((a, i) => (
              <li key={i}>{a.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input 
          className="border border-gray-300 dark:border-slate-600 rounded px-4 py-2 flex-1 min-w-[200px] bg-white dark:bg-slate-800" 
          placeholder="Search events..." 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
        />
        <div className="flex flex-wrap gap-2">
          {categories.map(c => {
            const active = (c==='All' && !category) || c===category;
            return (
              <button
                key={c}
                className={`px-4 py-2 rounded ${active
                  ? 'btn-primary'
                  : 'btn-secondary'}`}
                onClick={()=>{
                  const next = c==='All' ? '' : c;
                  setCategory(next);
                  fetchEvents({ category: next });
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <button 
          className="btn-primary"
          onClick={fetchEvents}
        >
          Search
        </button>
      </div>

      {recs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">🎯 Recommended for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recs.map((e) => <Card key={e._id} e={e} />)}
          </div>
        </section>
      )}

      {/* All events */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">🎪 All events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({length:6}).map((_,i)=><Skeleton key={i} />) : events.map((e) => <Card key={e._id} e={e} />)}
        </div>
      </section>
    </div>
  );
}