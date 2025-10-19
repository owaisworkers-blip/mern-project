import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Communications from '../components/Communications.jsx';
import ExhibitorSearch from '../components/ExhibitorSearch.jsx';

export default function ExhibitorPortal() {
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [myExhibitorProfile, setMyExhibitorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('exhibitors'); // 'exhibitors' or 'communications'
  
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchExhibitors();
    if (user?.role === 'organizer') {
      fetchAllExhibitors();
    }
  }, [user]);

  async function fetchExhibitors() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/exhibitors');
      setExhibitors(res.data.exhibitors || []);
    } catch (err) {
      setError('Failed to load exhibitors');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllExhibitors() {
    try {
      const res = await axios.get('/api/exhibitors/all');
      setExhibitors(res.data.exhibitors || []);
    } catch (err) {
      console.error('Failed to load all exhibitors');
    }
  }

  async function fetchMyProfile() {
    try {
      const res = await axios.get('/api/exhibitors/my-profile');
      setMyExhibitorProfile(res.data.exhibitor);
      // Populate form with existing data
      if (res.data.exhibitor) {
        setCompanyName(res.data.exhibitor.companyName);
        setDescription(res.data.exhibitor.description);
        setProducts(res.data.exhibitor.products);
        setContactEmail(res.data.exhibitor.contactEmail);
        setContactPhone(res.data.exhibitor.contactPhone);
        setWebsite(res.data.exhibitor.website);
      }
    } catch (err) {
      console.error('Failed to load exhibitor profile');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('description', description);
    formData.append('products', products);
    formData.append('contactEmail', contactEmail);
    formData.append('contactPhone', contactPhone);
    formData.append('website', website);
    if (logo) {
      formData.append('logo', logo);
    }
    
    try {
      if (myExhibitorProfile) {
        await axios.put('/api/exhibitors/my-profile', formData);
      } else {
        await axios.post('/api/exhibitors', formData);
      }
      
      // Reset form
      resetForm();
      setShowForm(false);
      fetchExhibitors();
      fetchMyProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exhibitor profile');
    }
  }

  async function updateApplicationStatus(exhibitorId, status) {
    try {
      await axios.post(`/api/exhibitors/${exhibitorId}/status`, { status });
      fetchAllExhibitors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status');
    }
  }

  function resetForm() {
    setCompanyName('');
    setDescription('');
    setProducts('');
    setContactEmail('');
    setContactPhone('');
    setWebsite('');
    setLogo(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {user?.role === 'organizer' ? 'Exhibitor Management' : 'Exhibitor Portal'}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {user?.role === 'organizer' 
              ? 'Manage exhibitor applications and approvals' 
              : 'Discover exhibitors and register your company'}
          </p>
        </div>
        {user?.role !== 'organizer' && user?.role !== 'customer' && (
          <button 
            className={`px-4 py-2 rounded ${showForm ? 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            onClick={() => {
              fetchMyProfile();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : myExhibitorProfile ? 'Edit Profile' : 'Register as Exhibitor'}
          </button>
        )}
      </div>
      
      {user?.role !== 'organizer' && user?.role !== 'customer' && (
        <div className="flex border-b border-gray-200 dark:border-slate-800">
          <button
            className={`py-3 px-5 font-medium text-sm ${activeTab === 'exhibitors' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('exhibitors')}
          >
            Exhibitors
          </button>
          <button
            className={`py-3 px-5 font-medium text-sm ${activeTab === 'communications' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('communications')}
          >
            Communications
          </button>
        </div>
      )}
      
      {user?.role === 'customer' ? (
        <ExhibitorSearch />
      ) : (
        <>
          {activeTab === 'exhibitors' && (
            <div className="space-y-6">
              {error && (
                <div className="rounded p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/30">
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              {showForm && user?.role !== 'organizer' && (
                <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
                  <h2 className="font-bold text-xl mb-6">
                    {myExhibitorProfile ? 'Edit Exhibitor Profile' : 'Register as Exhibitor'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Company Name *</label>
                        <input
                          type="text"
                          className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Email *</label>
                        <input
                          type="email"
                          className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Phone *</label>
                        <input
                          type="tel"
                          className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                          type="url"
                          className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description *</label>
                      <textarea
                        className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Products/Services *</label>
                      <textarea
                        className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                        rows="3"
                        value={products}
                        onChange={(e) => setProducts(e.target.value)}
                        placeholder="List your products or services"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Logo</label>
                      <input
                        type="file"
                        className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                        onChange={(e) => setLogo(e.target.files[0])}
                        accept="image/*"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                        onClick={() => {
                          resetForm();
                          setShowForm(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {myExhibitorProfile ? 'Update Profile' : 'Register'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-slate-400">Loading exhibitors...</p>
                </div>
              ) : exhibitors.length === 0 ? (
                <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-12 text-center dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
                  <div className="text-5xl mb-4">🎪</div>
                  <h3 className="text-xl font-semibold mb-2">No exhibitors found</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    {user?.role === 'organizer' 
                      ? 'There are no exhibitor applications yet.' 
                      : 'No exhibitors have registered for this event yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exhibitors.map((exhibitor) => (
                    <div 
                      key={exhibitor._id} 
                      className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center"
                    >
                      {exhibitor.logoUrl && (
                        <img 
                          src={exhibitor.logoUrl} 
                          alt={exhibitor.companyName} 
                          className="w-16 h-16 object-contain mb-4"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-bold text-lg mb-2">
                        <Link to={`/exhibitors/${exhibitor._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          {exhibitor.companyName}
                        </Link>
                      </h3>
                      <p className="text-gray-700 dark:text-slate-300 text-sm mb-4">
                        {exhibitor.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1">Products/Services:</div>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                          {exhibitor.products}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                          <span className="mr-2">📧</span>
                          <span className="truncate">{exhibitor.contactEmail}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-slate-400">
                          <span className="mr-2">📱</span>
                          {exhibitor.contactPhone}
                        </div>
                        {exhibitor.website && (
                          <div className="flex items-center text-gray-600 dark:text-slate-400">
                            <span className="mr-2">🌐</span>
                            <a 
                              href={exhibitor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {user?.role === 'organizer' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                          <button
                            className={`btn-sm rounded-full ${exhibitor.status === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => updateApplicationStatus(exhibitor._id, exhibitor.status === 'approved' ? 'pending' : 'approved')}
                          >
                            {exhibitor.status === 'approved' ? 'Approved' : 'Approve'}
                          </button>
                          <button
                            className="btn-sm btn-danger rounded-full"
                            onClick={() => updateApplicationStatus(exhibitor._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {exhibitor.status && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            exhibitor.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : exhibitor.status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {exhibitor.status === 'approved' 
                              ? '✅ Approved' 
                              : exhibitor.status === 'rejected' 
                                ? '❌ Rejected' 
                                : '⏳ Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'communications' && user?.role !== 'organizer' && (
            <div>
              <Communications />
            </div>
          )}
        </>
      )}
    </div>
  );
}