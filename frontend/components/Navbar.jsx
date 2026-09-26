import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-slate-800 bg-slate-950 flex-none">
      <div className="px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">CodeLens</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-slate-400 font-mono hidden sm:inline">{user.email}</span>
              <button 
                onClick={signOut}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
