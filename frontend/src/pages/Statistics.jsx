import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Statistics() {
  const [dash, setDash] = useState({ categories: [], upcomingByMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    if (!user) return;
    
    setLoading(true);
    setError('');
    try {
      const r = await axios.get('/api/stats/dashboard');
      setDash({
        categories: r.data?.categories || [],
        upcomingByMonth: r.data?.upcomingByMonth || [],
      });
    } catch (err) {
      setError('Failed to load statistics. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-8 text-center dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to view event statistics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="rounded p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Event Statistics
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">
          Insights and analytics for events on our platform
        </p>
      </div>
      
      {(dash.categories.length > 0 || dash.upcomingByMonth.length > 0) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
            <h2 className="font-bold text-xl mb-6">📊 Events by Category</h2>
            <div className="space-y-4">
              {dash.categories.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded shadow">
                  <span className="font-medium">{c._id || 'Uncategorized'}</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-semibold">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
            <h2 className="font-bold text-xl mb-6">📅 Upcoming Events</h2>
            <div className="space-y-4">
              {dash.upcomingByMonth.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded shadow">
                  <span className="font-medium">{m._id}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-semibold">
                    {m.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-12 text-center dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">No statistics data available</h2>
          <p className="text-gray-600 dark:text-slate-400">
            There is currently no data to display.
          </p>
        </div>
      )}
    </div>
  );
}