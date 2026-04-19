import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const loc = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T';

  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  if (!user) {
    if (loc.pathname !== '/') return null;
    const isHome = true;
    return (
       <nav className={`relative transition-all ${isHome ? 'bg-white/10 dark:bg-black/20 backdrop-blur-sm border-none' : 'bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-gray-200 dark:border-white/10'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-20">
             <Link to="/" className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 border border-white/20 flex items-center justify-center">
                 <span className="text-white font-bold font-serif text-lg leading-none">L</span>
               </div>
               <span className="font-serif font-bold text-xl text-gray-950 dark:text-white drop-shadow-sm">LessonGen</span>
             </Link>
             
             {isHome && (
                <div className="hidden md:flex gap-8 items-center font-bold text-gray-950 dark:text-white text-sm">
                  <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition drop-shadow-sm">Features</a>
                  <Link to="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition drop-shadow-sm">About Us</Link>
                  <a href="#pricing" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition drop-shadow-sm">Pricing</a>
                </div>
             )}

             <div className="flex gap-4 items-center">
               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-xl bg-white/30 dark:bg-white/10 text-gray-950 dark:text-white hover:scale-110 transition shadow-sm border border-black/10 dark:border-white/20"
               >
                 {theme === 'light' ? '🌙' : '☀️'}
               </button>
               <Link to="/login" className="text-sm font-bold text-gray-950 dark:text-white hover:text-emerald-700 transition drop-shadow-sm">Sign in</Link>
               <Link to="/register" className="text-sm font-bold bg-emerald-700 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:scale-105 transition shadow-lg">Get Started Free</Link>
             </div>
           </div>
         </div>
       </nav>
     );
  }

  // Logged-in SaaS Navbar
  return (
    <nav className="relative bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* BRAND */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center shadow-inner">
                <span className="text-white font-bold font-serif text-lg leading-none">L</span>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900 dark:text-white hidden sm:block">LessonGen</span>
            </Link>
            
            {/* LINKS */}
            <div className="hidden md:flex gap-1">
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${loc.pathname === '/dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} 
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${loc.pathname === '/generate' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} 
                onClick={() => navigate('/generate')}
              >
                Generate
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${loc.pathname === '/lessons' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} 
                onClick={() => navigate('/lessons')}
              >
                My Lessons
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${loc.pathname === '/about' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} 
                onClick={() => navigate('/about')}
              >
                About
              </button>
              {user?.role === 'sys_admin' && (
                <button 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${loc.pathname === '/admin' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`} 
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE USER MENU */}
          <div className="flex items-center gap-3">
             {/* THEME TOGGLE */}
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition"
                title="Toggle Dark Mode"
             >
                {theme === 'light' ? '🌙' : '☀️'}
             </button>

             {/* PLAN BADGE */}
             <div className="hidden sm:flex items-center">
                 <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${user?.plan === 'free' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'}`}>
                   {user?.plan} Plan
                 </span>
             </div>

             {/* PROFILE DROPDOWN */}
             <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition focus:outline-none"
                >
                   <span className="text-sm font-medium text-gray-700 pl-1 hidden sm:block truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                      {initials}
                   </div>
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in origin-top-right z-50">
                     <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                     </div>
                     <div className="py-1">
                        <button onClick={() => { setDropdownOpen(false); navigate('/payment'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                           {user?.plan === 'free' ? '⭐ Upgrade to Pro' : '💳 Manage Subscription'}
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                           Sign out
                        </button>
                     </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
