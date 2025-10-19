import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket(window.location.origin);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', handleNewNotification);
      
      // Clean up listener on unmount
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }

  function handleNewNotification(notification) {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Event Manager', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  async function markAsRead(notificationId) {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  }

  async function markAsUnread(notificationId) {
    try {
      await axios.post(`/api/notifications/${notificationId}/unread`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to mark notification as unread');
    }
  }

  async function markAllAsRead() {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read');
    }
  }

  async function deleteNotification(notificationId) {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification');
    }
  }

  async function deleteAllRead() {
    try {
      await axios.delete('/api/notifications/read/all');
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (err) {
      console.error('Failed to delete all read notifications');
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      const diffInHoursInt = Math.floor(diffInHours);
      return `${diffInHoursInt}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <svg 
          className="w-5 h-5 text-gray-600 dark:text-slate-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded shadow-lg border border-gray-200 dark:border-slate-800 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button 
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    onClick={deleteAllRead}
                  >
                    Clear read
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                No notifications yet
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li 
                    key={notification._id} 
                    className={`border-b border-gray-100 dark:border-slate-800 last:border-b-0 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800">
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {formatTime(notification.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-slate-300 text-sm mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                          notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                          notification.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' :
                          'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200'
                        }`}>
                          {notification.type}
                        </span>
                        <div className="flex gap-2">
                          {!notification.read ? (
                            <button
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={() => markAsRead(notification._id)}
                            >
                              Mark read
                            </button>
                          ) : (
                            <button
                              className="text-xs text-gray-600 dark:text-slate-400 hover:underline"
                              onClick={() => markAsUnread(notification._id)}
                            >
                              Mark unread
                            </button>
                          )}
                          <button
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 text-center border-t border-gray-200 dark:border-slate-800">
            <button 
              className="text-sm text-gray-600 dark:text-slate-400 hover:underline"
              onClick={() => setShowNotifications(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Request notification permission on mount */}
      {user && (
        <div className="hidden">
          {Notification.permission === 'default' && (
            <button 
              onClick={() => Notification.requestPermission()}
              className="hidden"
            >
              Enable notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}