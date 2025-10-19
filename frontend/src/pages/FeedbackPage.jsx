import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function FeedbackPage() {
  const [type, setType] = useState('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/api/feedback', {
        type,
        subject,
        message
      });
      
      setSuccess(true);
      setType('suggestion');
      setSubject('');
      setMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-8 text-center dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to send feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Send Feedback
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">
          Help us improve by sharing your suggestions or reporting issues
        </p>
      </div>
      
      <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-8 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded p-5 text-green-800 dark:text-green-200 mb-6">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              Thank you for your feedback! We appreciate your input.
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-5 text-red-800 dark:text-red-200 mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Feedback Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-4 px-6 rounded text-sm font-medium ${
                  type === 'suggestion'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-2 border-indigo-300 dark:border-indigo-700'
                    : 'bg-gray-50 dark:bg-slate-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setType('suggestion')}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">💡</span>
                  <span>Suggestion</span>
                </div>
              </button>
              <button
                type="button"
                className={`py-4 px-6 rounded text-sm font-medium ${
                  type === 'issue'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-2 border-indigo-300 dark:border-indigo-700'
                    : 'bg-gray-50 dark:bg-slate-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setType('issue')}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">🐛</span>
                  <span>Report Issue</span>
                </div>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe your feedback"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full min-h-[150px] bg-white dark:bg-slate-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide detailed information about your suggestion or issue"
              required
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              className={`w-full py-3 rounded font-semibold ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending feedback...
                </div>
              ) : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}