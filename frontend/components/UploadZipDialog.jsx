import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FolderUp, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { uploadLocalProject } from '../services/api.js';

export default function UploadZipDialog({ open, onOpenChange, onSuccess }) {
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = await getToken();
      await uploadLocalProject(token, formData);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload zip archive');
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
                <FolderUp className="w-5 h-5" />
              </div>
              <Dialog.Title className="text-xl font-bold text-white">Upload Local Project</Dialog.Title>
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

          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Select a <span className="text-slate-200 font-mono">.zip</span> archive of your project. Heavy build artifacts (<span className="text-slate-400 font-mono">node_modules</span>, <span className="text-slate-400 font-mono">dist</span>, lockfiles) and media assets will be automatically filtered.
            </p>
            <input 
              type="file" 
              accept=".zip"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full flex flex-col items-center justify-center gap-2 h-36 bg-slate-950 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 rounded-xl transition-colors disabled:opacity-50 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-sm text-slate-400 font-medium">Extracting and queueing...</span>
                </>
              ) : (
                <>
                  <FolderUp className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-slate-300 font-medium text-sm">Click to select ZIP file</span>
                  <span className="text-xs text-slate-500">Up to 100MB</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
