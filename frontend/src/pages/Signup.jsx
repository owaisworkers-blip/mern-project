import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState('');

  useEffect(() => {
    // Check if there's a signup message in localStorage
    const message = localStorage.getItem('signupMessage');
    if (message) {
      setSignupMessage(message);
      // Remove the message from localStorage so it doesn't persist
      localStorage.removeItem('signupMessage');
    }
  }, []);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit(e) {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password, role });
      login(res.data);
      
      // Check if there's a return URL stored in localStorage
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        // Remove the return URL from localStorage
        localStorage.removeItem('returnUrl');
        // Redirect to the return URL
        nav(returnUrl);
      } else {
        // Default redirect to home page
        nav('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 dark:opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 left-2/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      {/* Light mode background */}
      <div className="fixed inset-0 bg-cover bg-center dark:hidden" style={{backgroundImage: 'url("/white image.jpeg")'}}></div>
      
      {/* Dark mode background */}
      <div className="fixed inset-0 bg-cover bg-center hidden dark:block" style={{backgroundImage: 'url("/dark-bg.jpg")'}}></div>
      
      {/* Enhanced overlay for better card contrast */}
      <div className="fixed inset-0 bg-white/30 dark:bg-slate-900/40"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent animate-pulse mb-2">
            Create Account
          </h1>
          <p className="text-slate-700 dark:text-slate-300">
            Join our community today
          </p>
        </div>
        
        {/* Enhanced card with better shadow and border */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 transition-all duration-300 hover:shadow-3xl">
          {signupMessage && (
            <div className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 rounded-2xl p-4 text-sm mb-6 slide-in-right">
              <div className="flex items-center">
                <span className="mr-2">ℹ️</span>
                {signupMessage}
              </div>
            </div>
          )}
          
          {errors.general && (
            <div className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-2xl p-4 text-sm mb-6 slide-in-right">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {errors.general}
              </div>
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Full Name</label>
              <input 
                className={`input w-full ${errors.name ? 'border-rose-500' : ''}`} 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={loading}
              />
              {errors.name && <div className="text-rose-600 text-sm mt-1">{errors.name}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Email Address</label>
              <input 
                className={`input w-full ${errors.email ? 'border-rose-500' : ''}`} 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
              />
              {errors.email && <div className="text-rose-600 text-sm mt-1">{errors.email}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Password</label>
              <input 
                className={`input w-full ${errors.password ? 'border-rose-500' : ''}`} 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading}
              />
              {errors.password && <div className="text-rose-600 text-sm mt-1">{errors.password}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Account Type</label>
              <select 
                className="input w-full" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="customer">Customer (Attend events)</option>
                <option value="organizer">Organizer (Create events)</option>
              </select>
            </div>
            
            <button 
              className={`btn-primary w-full ${loading ? 'opacity-75 cursor-not-allowed' : ''}`} 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
