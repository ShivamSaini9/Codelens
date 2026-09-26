import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Terminal, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { createGithubProject } from '../services/api.js';

export default function ConnectGithubDialog({ open, onOpenChange, onSuccess }) {
  const { getToken } = useAuth();
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = await getToken();
      await createGithubProject(token, { url: githubUrl.trim() });
      setGithubUrl('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </div>
              <Dialog.Title className="text-xl font-bold text-white">Connect GitHub</Dialog.Title>
            </div>
            <Dialog.Close className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Repository URL
                </label>
                <input 
                  type="url" 
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
              <p className="text-xs text-slate-500">
                Supports public GitHub repositories. Code will be extracted, chunked, and embedded into the vector index.
              </p>
              <button 
                disabled={isSubmitting}
                type="submit" 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cloning & Indexing...</span>
                  </>
                ) : (
                  'Analyze Repository'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
