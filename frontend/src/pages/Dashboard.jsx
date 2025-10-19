import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  // Validate event form
  const validateEventForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!date) {
      newErrors.date = 'Date and time are required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadTicketDirect = async (registration) => {
    try {
      // Create a temporary div to render the ticket
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '980px';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Render the ticket HTML directly
      const event = registration.event;
      const eventDate = new Date(event?.date);
      const registrationDate = new Date(registration.createdAt);

      tempDiv.innerHTML = `
        <div style="width: 980px; padding: 20px;">
          <div style="display: flex; min-height: 360px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <!-- Left main area -->
            <div style="flex: 1; padding: 32px; color: white; background: linear-gradient(135deg, #3730a3, #7c3aed, #3730a3);">
              <!-- Top brand row -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div>
                  <div style="font-size: 14px; letter-spacing: 0.1em; color: #f0abfc;">EVENT MANAGER</div>
                  <div style="font-size: 12px; color: #c7d2fe;">Official Event Ticket</div>
                </div>
              </div>
              
              <!-- Event title -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.025em;">${event?.title}</div>
                <div style="color: #67e8f9; font-weight: 600; margin-top: 4px;">${event?.category} EVENT</div>
              </div>
              
              <!-- Big date/time row -->
              <div style="display: flex; align-items: end; gap: 32px; margin-bottom: 24px;">
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleDateString('en-GB')}</div>
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div style="text-transform: uppercase; letter-spacing: 0.1em; color: #67e8f9; margin-bottom: 24px;">${event?.location}</div>
              
              <!-- Barcode -->
              <div style="display: flex; align-items: center;">
                <div style="height: 64px; width: 224px; background: repeating-linear-gradient(90deg, #fff 0, #fff 2px, transparent 2px, transparent 4px); border-radius: 4px;"></div>
              </div>
            </div>
            
            <!-- Perforation divider -->
            <div style="width: 2px; background: rgba(255,255,255,0.4); position: relative;">
              <div style="position: absolute; top: 24px; bottom: 24px; left: 0; right: 0; border-left: 2px dashed rgba(255,255,255,0.7);"></div>
            </div>
            
            <!-- Right stub -->
            <div style="width: 256px; padding: 24px; color: white; background: linear-gradient(to bottom, #312e81, #1e40af); display: flex; flex-direction: column;">
              <!-- Vertical date/time -->
              <div style="color: #67e8f9; font-size: 16px; font-weight: 700; margin-bottom: 20px; writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 2px; text-shadow: 0 0 10px rgba(103, 232, 249, 0.5);">
                ${eventDate.getDate().toString().padStart(2, '0')} ${(eventDate.getMonth() + 1).toString().padStart(2, '0')} ${eventDate.getFullYear()} • ${eventDate.getHours().toString().padStart(2, '0')} ${eventDate.getMinutes().toString().padStart(2, '0')}
              </div>
              
              <!-- QR -->
              <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: center;">
                <div style="color: #c7d2fe; font-size: 14px; margin-bottom: 8px;">ENTRY QR</div>
                ${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" alt="QR" style="margin: 0 auto; width: 144px; height: 144px; border-radius: 6px; background: white; padding: 4px;" />` : ''}
              </div>
              
              <!-- Footer small -->
              <div style="margin-top: auto; text-align: center; font-size: 10px; color: rgba(199, 210, 254, 0.8);">
                <div style="font-weight: 600;">EventManager</div>
                <div>© 2025 All rights reserved</div>
                <div style="opacity: 0.7;">www.eventmanager.com</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        padding: 20
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const fileName = `${event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      showToast('success', 'Ticket downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Failed to download ticket. Please try again.');
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') loadPending();
  }, [user]);

  async function loadMyRegs() {
    try {
      setLoading(true);
      const res = await axios.get('/api/registrations/me');
      setMine(res.data.registrations || []);
    } catch (error) {
      showToast('error', 'Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMyEvents() {
    try {
      setLoading(true);
      const res = await axios.get('/api/events', { params: { organizer: user.id } });
      setMine(res.data.events || []);
    } catch (error) {
      showToast('error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPending() {
    try {
      setLoading(true);
      const [eventsRes, registrationsRes] = await Promise.all([
        axios.get('/api/events', { params: { status: 'pending' } }),
        axios.get('/api/registrations/pending')
      ]);
      setPending(eventsRes.data.events || []);
      setPendingRegistrations(registrationsRes.data.registrations || []);
    } catch (error) {
      showToast('error', 'Failed to load pending items. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadParticipants(eventId) {
    try {
      setLoading(true);
      const res = await axios.get(`/api/registrations/${eventId}/participants`);
      setParticipants(res.data.participants || []);
    } catch (error) {
      showToast('error', 'Failed to load participants. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function approveRegistration(id) {
    try {
      setLoading(true);
      await axios.post(`/api/registrations/${id}/approve`);
      showToast('success', 'Registration approved successfully');
      loadPending(); // Refresh the list
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to approve registration');
    } finally {
      setLoading(false);
    }
  }

  async function denyRegistration(id, reason = '') {
    try {
      setLoading(true);
      await axios.post(`/api/registrations/${id}/deny`, { reason });
      showToast('success', 'Registration denied');
      loadPending(); // Refresh the list
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to deny registration');
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv(eventId) {
    try {
      setLoading(true);
      // Check if participants exist first
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      const list = check.data.participants || [];
      if (!Array.isArray(list) || list.length === 0) {
        showToast('error', 'No participants available for this event.');
        return;
      }
    } catch (e) {
      // If the check fails, show error and abort
      showToast('error', 'Unable to fetch participants. Please try again.');
      return;
    }

    try {
      const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; 
      a.download = `participants-${eventId}.csv`; 
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('success', 'CSV exported successfully');
    } catch (error) {
      showToast('error', 'Failed to export CSV. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e) {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateEventForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('date', date);
      fd.append('location', location);
      fd.append('category', category);
      fd.append('description', description);
      if (poster) fd.append('poster', poster);
      await axios.post('/api/events', fd);
      setTitle(''); 
      setDate(''); 
      setLocation(''); 
      setDescription(''); 
      setPoster(null);
      await loadMyEvents();
      showToast('success', 'Event created successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create event. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) { 
    try {
      setLoading(true);
      await axios.post(`/api/admin/events/${id}/approve`); 
      await loadPending(); 
      showToast('success', 'Event approved successfully');
    } catch (error) {
      showToast('error', 'Failed to approve event. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function reject(id) { 
    try {
      setLoading(true);
      await axios.post(`/api/admin/events/${id}/reject`); 
      await loadPending(); 
      showToast('success', 'Event rejected successfully');
    } catch (error) {
      showToast('error', 'Failed to reject event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const analytics = useMemo(() => {
    // Simple mini-analytics: count by status and category
    const byStatus = mine.reduce((acc,e)=>{ acc[e.status]=(acc[e.status]||0)+1; return acc; },{});
    const byCategory = mine.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+1; return acc; },{});
    return { byStatus, byCategory };
  }, [mine]);

  return (
    <div className="space-y-8">
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${toast.type==='error'?'bg-red-500 text-white':toast.type==='success'?'bg-green-500 text-white':'bg-blue-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold capitalize">{toast.type}</span>
            <span>{toast.message}</span>
            <button className="ml-2" onClick={()=>setToast({ ...toast, open:false })}>×</button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm">
            {user?.role === 'customer' ? 'Customer' : user?.role === 'organizer' ? 'Organizer' : 'Admin'}
          </div>
          <button 
            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {user?.role === 'customer' && (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <h2 className="font-bold text-xl mb-6">🎟️ My Registrations</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : mine.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
              <p className="text-gray-600 dark:text-slate-400">
                You haven't registered for any events yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mine.map((r) => (
                <div key={r._id} className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
                  <div className="flex flex-col gap-4">
                    {/* Event poster */}
                    {r.event?.posterUrl && (
                      <div className="rounded overflow-hidden">
                        <img 
                          src={`${r.event.posterUrl}?v=${Date.now()}`} 
                          alt={`${r.event.title} poster`}
                          className="w-full h-32 object-cover"
                          onError={(ev)=>{ 
                            ev.currentTarget.onerror=null; 
                            ev.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{r.event?.title}</h3>
                        <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                          {new Date(r.event?.date).toLocaleDateString()} • {r.event?.location}
                        </div>
                        <div className="text-sm">
                          Status: <span className={`font-medium px-2 py-1 rounded text-xs ${
                            r.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : r.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      {r.qrCodeDataUrl && (
                        <img src={r.qrCodeDataUrl} className="h-16 w-16 border rounded" alt="QR Code" />
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTicket(r)}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500"
                      >
                        View Ticket
                      </button>
                      <button
                        onClick={() => downloadTicketDirect(r)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        disabled={loading}
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user?.role === 'organizer' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={createEvent} className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 lg:col-span-1 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
            <h2 className="font-bold text-xl mb-6">➕ Create Event</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <input 
                  className={`border rounded px-3 py-2 w-full ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} 
                  placeholder="Event title" 
                  value={title} 
                  onChange={(e)=>setTitle(e.target.value)} 
                  disabled={loading}
                />
                {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time *</label>
                <input 
                  className={`border rounded px-3 py-2 w-full ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} 
                  type="datetime-local" 
                  value={date} 
                  onChange={(e)=>setDate(e.target.value)} 
                  disabled={loading}
                />
                {errors.date && <div className="text-red-600 text-sm">{errors.date}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <input 
                  className={`border rounded px-3 py-2 w-full ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} 
                  placeholder="Event location" 
                  value={location} 
                  onChange={(e)=>setLocation(e.target.value)} 
                  disabled={loading}
                />
                {errors.location && <div className="text-red-600 text-sm">{errors.location}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full" 
                  value={category} 
                  onChange={(e)=>setCategory(e.target.value)}
                  disabled={loading}
                >
                  <option>Tech</option>
                  <option>Sports</option>
                  <option>Cultural</option>
                  <option>Workshop</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <textarea 
                  className={`border rounded px-3 py-2 w-full min-h-[120px] ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} 
                  rows="5" 
                  placeholder="Describe the event in detail" 
                  value={description} 
                  onChange={(e)=>setDescription(e.target.value)} 
                  disabled={loading}
                />
                {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Poster</label>
                <input 
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full" 
                  type="file" 
                  onChange={(e)=>setPoster(e.target.files[0])} 
                  disabled={loading}
                />
              </div>
              <div className="pt-2">
                <button 
                  className={`w-full py-3 rounded font-semibold ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`} 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : 'Publish Event'}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-8 lg:col-span-2">
            <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
              <h2 className="font-bold text-xl mb-6">📊 Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-5">
                  <h3 className="font-semibold mb-3">By Status</h3>
                  <ul className="space-y-2">
                    {Object.entries(analytics.byStatus).map(([k,v]) => (
                      <li key={k} className="flex justify-between items-center">
                        <span className="capitalize">{k}</span>
                        <span className="font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                          {v}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-5">
                  <h3 className="font-semibold mb-3">By Category</h3>
                  <ul className="space-y-2">
                    {Object.entries(analytics.byCategory).map(([k,v]) => (
                      <li key={k} className="flex justify-between items-center">
                        <span className="capitalize">{k}</span>
                        <span className="font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                          {v}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
              <h2 className="font-bold text-xl mb-6">🎪 My Events</h2>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : mine.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎪</div>
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    Create your first event using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mine.map((e) => (
                    <div key={e._id} className="bg-white dark:bg-slate-700 rounded-lg shadow p-5">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Event poster */}
                        {e.posterUrl && (
                          <div className="md:w-32 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={`${e.posterUrl}?v=${Date.now()}`} 
                              alt={`${e.title} poster`}
                              className="w-full h-24 object-cover"
                              onError={(ev)=>{ 
                                ev.currentTarget.onerror=null; 
                                ev.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{e.title}</h3>
                          <div className="text-sm text-gray-600 dark:text-slate-400">
                            Organizer: {e.organizer?.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            {new Date(e.date).toLocaleDateString()} • {e.location}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3 md:mt-0">
                          <button 
                            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            onClick={()=>{setSelectedEvent(e._id);loadParticipants(e._id);}}
                            disabled={loading}
                          >
                            Participants
                          </button>
                          <button 
                            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            onClick={()=>exportCsv(e._id)}
                            disabled={loading}
                          >
                            Export CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedEvent && (
              <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
                <h2 className="font-bold text-xl mb-6">👥 Participants</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
                    <p className="text-gray-600 dark:text-slate-400">
                      No one has registered for this event yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map(a => (
                      <div key={a._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded shadow">
                        <div>
                          <div className="font-medium">{a.user?.name}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{a.user?.email}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          a.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : a.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <>
          <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
            <h2 className="font-bold text-xl mb-6">📊 Analytics Dashboard</h2>
            <AnalyticsDashboard />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
              <h2 className="font-bold text-xl mb-6">⏳ Pending Events</h2>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : pending.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎪</div>
                  <h3 className="text-lg font-semibold mb-2">No pending events</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    All events have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map((e) => (
                    <div key={e._id} className="bg-white dark:bg-slate-700 rounded-lg shadow p-5">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Event poster */}
                        {e.posterUrl && (
                          <div className="md:w-32 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={`${e.posterUrl}?v=${Date.now()}`} 
                              alt={`${e.title} poster`}
                              className="w-full h-24 object-cover"
                              onError={(ev)=>{ 
                                ev.currentTarget.onerror=null; 
                                ev.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{e.title}</h3>
                          <div className="text-sm text-gray-600 dark:text-slate-400">
                            Organizer: {e.organizer?.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                            {new Date(e.date).toLocaleDateString()} • {e.location}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3 md:mt-0">
                          <button 
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={()=>approve(e._id)}
                            disabled={loading}
                          >
                            {loading ? 'Approving...' : 'Approve'}
                          </button>
                          <button 
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={()=>reject(e._id)}
                            disabled={loading}
                          >
                            {loading ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
              <h2 className="font-bold text-xl mb-6">⏳ Pending Registrations</h2>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : pendingRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎟️</div>
                  <h3 className="text-lg font-semibold mb-2">No pending registrations</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    All registrations have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRegistrations.map((reg) => (
                    <div key={reg._id} className="bg-white dark:bg-slate-700 rounded-lg shadow p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{reg.user?.name}</h3>
                          <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                            {reg.user?.email}
                          </div>
                          <div className="text-sm">
                            Event: {reg.event?.title}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={()=>approveRegistration(reg._id)}
                            disabled={loading}
                          >
                            {loading ? 'Approving...' : 'Approve'}
                          </button>
                          <button 
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={()=>denyRegistration(reg._id, 'Registration denied')}
                            disabled={loading}
                          >
                            {loading ? 'Denying...' : 'Deny'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Event Ticket</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadAction && downloadAction()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    📥 Download Ticket
                  </button>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </div>
              <EventTicket 
                registration={selectedTicket} 
                user={user}
                onReady={(fn) => setDownloadAction(() => fn)}
                onDownload={() => {
                  // Optional: Show success message or close modal
                  console.log('Ticket downloaded successfully');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}