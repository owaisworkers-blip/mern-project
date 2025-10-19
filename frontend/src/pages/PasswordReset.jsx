import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function PasswordReset() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function requestReset(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      await axios.post('/api/auth/request-password-reset', { email });
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset instructions');
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await axios.post('/api/auth/reset-password', { token, password: newPassword });
      setMessage('Password has been reset successfully. You can now login with your new password.');
      setTimeout(() => nav('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-bold text-xl mb-4">
        {step === 'request' ? 'Reset Password' : 'Set New Password'}
      </h1>
      
      {message && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded p-3 text-green-800 dark:text-green-200 text-sm">
          {message}
        </div>
      )}
      
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}
      
      {step === 'request' ? (
        <form onSubmit={requestReset} className="space-y-3">
          <input 
            className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <button className="btn-primary w-full" type="submit">
            Send Reset Instructions
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-3">
          <input 
            className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800" 
            placeholder="Reset Token" 
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            required
          />
          <input 
            className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800" 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required
          />
          <input 
            className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800" 
            type="password" 
            placeholder="Confirm New Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required
          />
          <button className="btn-primary w-full" type="submit">
            Reset Password
          </button>
        </form>
      )}
      
      <div className="text-sm text-gray-600 mt-2">
        {step === 'request' ? (
          <>
            Remember your password? <Link to="/login" className="underline">Login</Link>
          </>
        ) : (
          <>
            <button 
              onClick={() => setStep('request')} 
              className="btn-secondary"
            >
              Back to reset request
            </button>
          </>
        )}
      </div>
    </div>
  );
}