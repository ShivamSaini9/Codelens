import React from 'react';
import { Terminal, FolderUp, Search, Layers, Cpu, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router';

export default function LandingPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      signIn();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CodeLens</span>
          </div>
          <div>
            {!user ? (
              <button 
                onClick={signIn}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors text-sm shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <button 
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-sm border border-slate-700 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Codebase Intelligence Platform
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight max-w-4xl">
          Understand any <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            codebase instantly.
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mb-12">
          Connect a GitHub repository or upload your project ZIP and ask natural-language questions grounded directly in your source code.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <button 
            onClick={handleAction}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-base transition-colors cursor-pointer shadow-lg"
          >
            <Terminal className="w-5 h-5" />
            Connect GitHub Repository
          </button>
          <button 
            onClick={handleAction}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base transition-colors border border-slate-800 cursor-pointer"
          >
            <FolderUp className="w-5 h-5" />
            Upload Local Project
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Semantic Search</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by pgvector and vector embeddings. Find exactly what you're looking for by semantic concept, not just keyword matches.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Q&A</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ask architectural questions, debug issues, and get detailed streaming explanations grounded in your project's files.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Source Citations</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Never wonder where an answer came from. Every explanation includes exact filenames and line numbers with one-click code inspection.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
