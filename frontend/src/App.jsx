import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pass from './pages/Pass.jsx';
import PasswordReset from './pages/PasswordReset.jsx';
import Schedule from './pages/Schedule.jsx';
import ExhibitorPortal from './pages/ExhibitorPortal.jsx';
import ExhibitorProfile from './pages/ExhibitorProfile.jsx';
import Statistics from './pages/Statistics.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import Notifications from './components/Notifications.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useEffect, useState } from 'react';

// Enhanced animated background effect
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 dark:opacity-10">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-1/3 left-2/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>
  </div>
);

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function useTheme() {
  const getInitial = () => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState(getInitial);
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') { root.classList.add('dark'); body && body.classList.add('dark'); }
    else { root.classList.remove('dark'); body && body.classList.remove('dark'); }
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, setTheme };
}

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-2 z-20 glass-card mx-4 mt-2 transition-all duration-300 hover:shadow-3xl rounded-2xl backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">EVENT MANAGMENT SYSTEM</Link>
        <nav className="flex items-center gap-2 md:gap-4 text-sm">
          <Link to="/" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname==='/'?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
            Home
          </Link>
          <Link to="/schedule" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname==='/schedule'?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
            Schedule
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname.startsWith('/dashboard')?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
                Dashboard
              </Link>
              <Link to="/exhibitors" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname==='/exhibitors'?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
                Exhibitors
              </Link>
              <Link to="/statistics" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname==='/statistics'?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
                Statistics
              </Link>
              <Link to="/feedback" className={`px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${location.pathname==='/feedback'?'bg-white/30 dark:bg-slate-700/30 font-semibold backdrop-blur-xl':'hover:bg-white/30 dark:hover:bg-slate-700/30'}`}>
                Feedback
              </Link>
            </>
          )}
          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Notifications />
                <button 
                  onClick={logout} 
                  className="btn-primary btn-sm btn-rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn-outline btn-sm btn-rounded"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary btn-sm btn-rounded"
                >
                  Sign up
                </Link>
              </>
            )}
            <button 
              aria-label="Toggle theme" 
              className="input px-3 py-1.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" 
              onClick={()=>{
                const next = theme==='dark' ? 'light' : 'dark';
                const root = document.documentElement; const body = document.body;
                if (next==='dark') { root.classList.add('dark'); body && body.classList.add('dark'); }
                else { root.classList.remove('dark'); body && body.classList.remove('dark'); }
                localStorage.setItem('theme', next);
                setTheme(next);
              }}
            >
              {theme==='dark'?'🌙 Dark':'☀️ Light'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Layout({ children }) {
  const location = useLocation();
  // Slideshow images array
  const slideshowImages = [
    '/stopwatch-3699314_1920.jpg',
    '/event conference.jpg',
    '/photography.jpg'
  ];

  // Check if we're on login or signup page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    // Simplified layout for auth pages with just navbar and content
    return (
      <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col relative">
        {/* Animated background effect */}
        <AnimatedBackground />
        
        {/* Light mode background */}
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat dark:hidden" 
             style={{backgroundImage: 'url("/white image.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
        
        {/* Dark mode background with cards theme */}
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" 
             style={{backgroundImage: 'url("/dark-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
        
        {/* Enhanced overlay for better contrast */}
        <div className="fixed inset-0 bg-white/20 dark:bg-slate-900/60"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-4">
            {children}
          </main>
          <footer className="mt-auto border-t border-gray-200/30 dark:border-slate-700/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-t-3xl shadow-lg">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/software house logo.jpeg" 
                    alt="Software House Logo" 
                    className="h-12 w-12 rounded-full object-cover border-2 border-white/50 dark:border-slate-600/50 shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-center md:text-right">
                  <p className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                    Powered by FLUX
                  </p>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                    &copy; {new Date().getFullYear()} All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Full layout for other pages
  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col relative">
      {/* Animated background effect */}
      <AnimatedBackground />
      
      {/* Light mode background */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat dark:hidden" 
           style={{backgroundImage: 'url("/white image.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
      
      {/* Dark mode background with cards theme */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" 
           style={{backgroundImage: 'url("/dark-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
      
      {/* Enhanced overlay for better contrast */}
      <div className="fixed inset-0 bg-white/20 dark:bg-slate-900/60"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <section className="border-b border-slate-200 dark:border-slate-800 relative overflow-hidden py-16">
          {/* Gradient overlay with image slideshow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 dark:from-indigo-500/5 dark:to-emerald-500/5">
            <Slideshow images={slideshowImages} />
          </div>
          <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-emerald-700 bg-clip-text text-transparent dark:from-indigo-300 dark:to-emerald-300 mb-6 animate-fade-in-down">Discover and Manage Events</h1>
              <p className="text-slate-800 dark:text-slate-300 mt-2 max-w-2xl mx-auto text-xl animate-fade-in-up">Register, organize, review, and track your event participation.</p>
            </div>
          </div>
        </section>
        <main className="max-w-6xl mx-auto p-4 flex-1">
          {children}
        </main>
        <footer className="mt-10 border-t border-gray-200/30 dark:border-slate-700/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-t-3xl shadow-lg">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/software house logo.jpeg" 
                  alt="Software House Logo" 
                  className="h-12 w-12 rounded-full object-cover border-2 border-white/50 dark:border-slate-600/50 shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center md:text-right">
                <p className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  Powered by FLUX
                </p>
                <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                  &copy; {new Date().getFullYear()} All rights reserved
                </p>
              </div>
            </div>
          </div>
        </footer>
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
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}

// Slideshow component for rotating images
const Slideshow = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Only start the slideshow if there are images
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Don't render slideshow if no images
  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ marginLeft: '100px', marginRight: '100px' }}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform ${
            index === currentIndex 
              ? 'opacity-30 scale-110' 
              : 'opacity-0 scale-100'
          }`}
          style={{ 
            backgroundImage: `url("${image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            marginLeft: '100px',
            marginRight: '100px'
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/exhibitors" element={<ExhibitorPortal />} />
            <Route path="/exhibitors/:id" element={<ExhibitorProfile />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/statistics" element={<PrivateRoute roles={["customer","organizer","admin"]}><Statistics /></PrivateRoute>} />
            <Route path="/feedback" element={<PrivateRoute roles={["customer","organizer","admin"]}><FeedbackPage /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/pass" element={<PrivateRoute roles={["customer","organizer","admin"]}><Pass /></PrivateRoute>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["customer", "organizer", "admin"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}