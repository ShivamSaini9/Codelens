import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FolderGit2, Terminal, FolderUp, Loader2, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchProjects } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import ConnectGithubDialog from '../components/ConnectGithubDialog.jsx';
import UploadZipDialog from '../components/UploadZipDialog.jsx';

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await fetchProjects(token);
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Polling for processing projects
  useEffect(() => {
    const hasProcessing = projects.some(p => ['queued', 'extracting', 'indexing'].includes(p.status));
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      loadProjects();
    }, 3000);

    return () => clearInterval(interval);
  }, [projects]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready
          </span>
        );
      case 'extracting':
      case 'indexing':
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}...
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Codebases</h1>
            <p className="text-sm text-slate-400">Manage and explore your indexed repositories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGithubModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Connect GitHub</span>
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg font-medium transition-colors text-sm border border-slate-800 cursor-pointer"
            >
              <FolderUp className="w-4 h-4" />
              <span>Upload ZIP</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p className="text-sm">Loading your codebases...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No projects indexed yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Connect a GitHub repository or upload a ZIP archive of your source code to start exploring.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGithubModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm cursor-pointer"
              >
                Connect GitHub
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-medium transition-colors text-sm border border-slate-800 cursor-pointer"
              >
                Upload ZIP
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        {project.sourceType === 'github' ? (
                          <FolderGit2 className="w-5 h-5" />
                        ) : (
                          <FolderUp className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-xs text-slate-500 capitalize">{project.sourceType} source</span>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-4 font-mono">
                    {project.sourceUrl || 'Local Upload'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-500">
                  <span>
                    {project.stats?.filesCount ? `${project.stats.filesCount} files` : 'Files pending'}
                    {project.stats?.chunksCount ? ` · ${project.stats.chunksCount} chunks` : ''}
                  </span>
                  <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-indigo-400 font-medium">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConnectGithubDialog 
        open={githubModalOpen} 
        onOpenChange={setGithubModalOpen} 
        onSuccess={loadProjects} 
      />
      
      <UploadZipDialog 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen} 
        onSuccess={loadProjects} 
      />
    </div>
  );
}
