import { useState } from 'react';
import axios from 'axios';

export default function Feedback() {
  const [type, setType] = useState('suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 className="font-semibold mb-4">Send Feedback</h2>
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-800 dark:text-green-200 text-sm mb-4">
          Thank you for your feedback! We appreciate your input.
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Feedback Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                type === 'suggestion'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
              onClick={() => setType('suggestion')}
            >
              Suggestion
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                type === 'issue'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
              onClick={() => setType('issue')}
            >
              Report Issue
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            className="input w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your feedback"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="input w-full"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please provide detailed information about your suggestion or issue"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}