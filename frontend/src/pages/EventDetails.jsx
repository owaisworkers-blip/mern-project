import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // New state to track registration status
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  // Add missing state variables
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  useEffect(() => {
    load();
  }, [id, user]);

  async function load() {
    const [e, r] = await Promise.all([
      axios.get(`/api/events/${id}`),
      axios.get(`/api/reviews/${id}`),
    ]);
    setEvent(e.data.event);
    setReviews(r.data.reviews || []);
    
    // Check if current user has already reviewed this event
    if (user) {
      const userReview = r.data.reviews?.find(review => review.user?._id === user.id);
      setHasReviewed(!!userReview);
      
      // Check if current user is registered for this event
      try {
        const registrations = await axios.get('/api/registrations/me');
        const userRegistration = registrations.data.registrations?.find(reg => reg.event?._id === id);
        // User is considered registered if they have an approved registration
        setIsRegistered(userRegistration?.status === 'approved');
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
    }
  }

  async function register() {
    // If user is not logged in, redirect to signup page with a message
    if (!user) {
      // Store a message in localStorage to be displayed on the signup page
      localStorage.setItem('signupMessage', 'Sign up to Register for this event');
      // Store the current event URL in localStorage to redirect back after signup
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/signup');
      return;
    }
    
    // If user is already registered, show a message
    if (isRegistered) {
      showToast('info', 'You are already registered for this event.');
      return;
    }
    
    // If user is logged in, proceed with registration
    try {
      const response = await axios.post(`/api/registrations/${id}/register`);
      showToast('success', response.data.message || 'Registration request submitted! Check your email for confirmation.');
      // Reload the event data to update registration status
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        // Store a message in localStorage to be displayed on the signup page
        localStorage.setItem('signupMessage', 'Please sign up to register for this event');
        // Store the current event URL in localStorage to redirect back after signup
        localStorage.setItem('returnUrl', window.location.pathname);
        navigate('/signup');
      } else {
        showToast('error', `Registration failed: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url); alert('Event link copied!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusEvents//EN
BEGIN:VEVENT
UID:${event._id}@campus
DTSTAMP:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTSTART:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event.title}.ics`; a.click(); URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      console.log('Submitting review:', { rating, comment, eventId: id, user: user?.id });
      console.log('Auth token:', axios.defaults.headers.common.Authorization);
      
      const response = await axios.post(`/api/reviews/${id}`, { rating, comment });
      console.log('Review submitted successfully:', response.data);
      showToast('success', 'Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      console.error('Review submission error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        showToast('warning', 'Please log in to post a review.');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('reviewed')) {
        showToast('info', 'You have already reviewed this event.');
      } else {
        showToast('error', `Failed to post review: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  if (!event) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg ${toast.type==='success'?'bg-green-500 text-white':toast.type==='warning'?'bg-yellow-500 text-white':toast.type==='error'?'bg-red-500 text-white':'bg-blue-500 text-white'}`}>
          <div className="flex items-start gap-2">
            <span className="font-semibold capitalize">{toast.type}</span>
            <span>{toast.message}</span>
            <button className="ml-2" onClick={()=>setToast({ ...toast, open:false })}>×</button>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img 
            src={event.posterUrl ? `${event.posterUrl}?v=${Date.now()}` : '/placeholder.svg'} 
            alt={`${event.title} poster`}
            className="w-full h-80 object-cover"
            onError={(ev)=>{ 
              ev.currentTarget.onerror=null; 
              ev.currentTarget.src='/placeholder.svg';
              ev.currentTarget.alt='Event poster placeholder';
            }}
          />
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded ${event.status==='approved' ? 'bg-green-100 text-green-800' : event.status==='pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{event.status}</span>
          </div>
        </div>
        
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">{event.category}</span>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">⭐ {event.averageRating?.toFixed?.(1) || '0.0'}</span>
          </div>
          <p className="text-gray-700 dark:text-slate-300 mb-6">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
            <div>
              <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-1">
                <span className="mr-2">📅</span>
                Date & Time
              </div>
              <div className="font-semibold">{new Date(event.date).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-1">
                <span className="mr-2">📍</span>
                Location
              </div>
              <div className="font-semibold">{event.location}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-1">
                <span className="mr-2">👥</span>
                Capacity
              </div>
              <div className="font-semibold">{event.capacity ? `${event.capacity} people` : 'Unlimited'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-1">
                <span className="mr-2">👤</span>
                Organizer
              </div>
              <div className="font-semibold">{event.organizer?.name || 'Unknown'}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              className={user 
                ? isRegistered 
                  ? 'btn-secondary' 
                  : 'btn-primary'
                : 'btn-primary'}
              onClick={register}
              disabled={isRegistered}
            >
              {!user ? 'Sign Up to Register' : isRegistered ? 'Already Registered' : 'Register for Event'}
            </button>
            <button className="btn-secondary" onClick={shareEvent}>Share</button>
            <button className="btn-secondary" onClick={downloadIcs}>Calendar</button>
          </div>
        </div>
      </div>

      <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
        <h2 className="text-xl font-bold mb-6">💬 Reviews</h2>
        
        {user && !hasReviewed && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded">
            <select className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)
              }
            </select>
            <input className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 flex-1" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience" />
            <button className="btn-primary" onClick={submitReview} disabled={!comment.trim()}>Post</button>
          </div>
        )}

        {user && hasReviewed && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded p-4 mb-6">
            <p className="text-green-800 dark:text-green-200">
              ✅ You have already reviewed this event.
            </p>
          </div>
        )}
        
        <ul className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <li key={r._id} className="p-5 bg-white dark:bg-slate-700 rounded shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-slate-300">{r.user?.name}</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="mb-3 flex items-center">
                  <div className="flex text-amber-500">
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </div>
                  <span className="ml-2 text-gray-700 dark:text-slate-300 font-medium">{r.rating}.0</span>
                </div>
                <p className="text-gray-700 dark:text-slate-200">{r.comment}</p>
              </li>
            ))
          ) : (
            <li className="text-center py-8 text-gray-500 dark:text-slate-400">
              No reviews yet. Be the first to review this event!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}