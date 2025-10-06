import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageSquare, UserRound, FileText, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BookOpen, label: 'Home' },
    { path: '/quiz', icon: FileText, label: 'Quiz' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/profile', icon: UserRound, label: 'Profile' },
    { path: '/history', icon: UserRound, label: 'History' },    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg scale-105 text-white hover:text-white'
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-lg">
        <div className="grid grid-cols-4 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 rounded-xl text-xs font-medium transition-all duration-300 ${isActive
                  ? 'text-indigo-600 bg-indigo-50 scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
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