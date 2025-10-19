import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    totalExhibitors: 0,
    popularEvents: [],
    userEngagement: [],
    boothTraffic: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    setLoading(true);
    setError('');
    try {
      // Fixed the API endpoint URL to match the correct route
      const res = await axios.get(`/api/stats/analytics?days=${timeRange}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics API error:', err);
      setError('Failed to load analytics data: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-800 dark:text-red-200 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Time Range:</label>
          <select 
            className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalEvents}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Total Events
          </div>
        </div>
        
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.totalUsers}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Total Users
          </div>
        </div>
        
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.totalRegistrations}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Total Registrations
          </div>
        </div>
        
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {analytics.totalExhibitors}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Total Exhibitors
          </div>
        </div>
      </div>

      {/* Popular Events */}
      <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-semibold mb-4">Popular Events</h3>
        {analytics.popularEvents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No popular events data available.
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.popularEvents.map((event, index) => (
              <div key={event._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-medium mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {event.category} • {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{event.registrationCount} registrations</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {event.averageRating?.toFixed(1) || 'N/A'} ★
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">User Engagement</h3>
          {analytics.userEngagement.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No user engagement data available.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.userEngagement.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {user.role} • {user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.activityCount} activities</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booth Traffic */}
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="font-semibold mb-4">Booth Traffic</h3>
          {analytics.boothTraffic.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No booth traffic data available.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.boothTraffic.map((booth) => (
                <div key={booth._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <div>
                    <div className="font-medium">Booth #{booth.number}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {booth.companyName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{booth.visitCount} visits</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      Row {booth.row}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}