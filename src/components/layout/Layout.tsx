import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../services/supabaseClient';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('selectedPDFs');
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: BookOpen, label: 'Home' },
    { path: '/quiz', icon: FileText, label: 'Quiz' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudyHub
              </span>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </Link>


            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg scale-105 text-white hover:text-white'
                          : ''
                          }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(prev => !prev)}
                  className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 ring-2 ring-white ring-offset-2 ring-offset-transparent hover:ring-offset-indigo-100"
                >
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 md:w-56 bg-white rounded-xl shadow-2xl border border-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-3 border-b border-slate-200/50">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center text-lg shadow-md">
                          {user?.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <div className="my-1 border-t border-slate-100"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-lg">
        <div className="grid grid-cols-3 px-2 py-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 rounded-xl text-xs font-medium transition-all duration-300 ${isActive
                  ? 'text-indigo-600 bg-indigo-50 scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`h-6 w-6 mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;