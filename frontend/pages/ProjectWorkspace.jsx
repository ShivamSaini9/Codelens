import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Search, Folder, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchProjectFiles, fetchProjectById, fetchFileContent, sendChatMessage } from '../services/api.js';
import FileTree from '../components/FileTree.jsx';
import CodeViewer from '../components/CodeViewer.jsx';
import ChatSidebar from '../components/ChatSidebar.jsx';

export default function ProjectWorkspace() {
  const { id: projectId } = useParams();
  const { getToken, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load project files and metadata
  const loadWorkspaceData = async () => {
    if (!user) return;
    setLoadingFiles(true);
    try {
      const token = await getToken();
      if (!token) return;

      const [filesData, projectData] = await Promise.all([
        fetchProjectFiles(token, projectId),
        fetchProjectById(token, projectId).catch(() => null),
      ]);

      const fileList = Array.isArray(filesData) ? filesData : [];
      setFiles(fileList);
      if (projectData) {
        setProject(projectData);
      }

      // Auto-select initial file if available
      if (fileList.length > 0) {
        const preferredFile =
          fileList.find((f) => f.filePath.toLowerCase().endsWith('readme.md')) ||
          fileList.find((f) => f.filePath.toLowerCase().endsWith('package.json')) ||
          fileList.find((f) => f.filePath.toLowerCase().includes('index.')) ||
          fileList[0];

        if (preferredFile) {
          handleSelectFile(preferredFile.id, preferredFile.filePath, preferredFile.extension);
        }
      }
    } catch (err) {
      console.error('Failed to load project files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadWorkspaceData();
    }
  }, [projectId, user, authLoading]);

  // Build file hierarchy
  const fileTree = useMemo(() => {
    const root = { name: 'root', path: '', type: 'directory', children: {} };

    files.forEach((file) => {
      const parts = file.filePath.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (isFile) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: 'file',
            fileId: file.id,
            extension: file.extension,
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: currentPath,
              type: 'directory',
              children: {},
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  }, [files]);

  // Load file content
  const handleSelectFile = async (fileId, filePath, extension) => {
    setActiveFile({ id: fileId, filePath, extension });
    setLoadingContent(true);
    try {
      const token = await getToken();
      const data = await fetchFileContent(token, projectId, fileId);
      setFileContent(data?.content ?? '// File is empty');
    } catch (err) {
      console.error('Failed to load file content:', err);
      setFileContent('// Error loading file content');
    } finally {
      setLoadingContent(false);
    }
  };

  // Open file from citation
  const handleSourceClick = (source) => {
    const file = files.find((f) => f.filePath === source.filePath);
    if (file) {
      handleSelectFile(file.id, file.filePath, file.extension);
    }
  };

  // Send chat message with SSE
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: chatInput.trim() };
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage = { id: assistantMessageId, role: 'assistant', content: '', sources: [] };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    const promptToSend = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      const token = await getToken();
      const response = await sendChatMessage(token, projectId, promptToSend);

      if (!response.ok) {
        let errMessage = 'Failed to fetch response';
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'sources') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, sources: data.sources } : m
                  )
                );
              } else if (data.type === 'text') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: m.content + data.text } : m
                  )
                );
              } else if (data.type === 'error') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: m.content + `\n\n⚠️ **Error:** ${data.error}` }
                      : m
                  )
                );
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', line, e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: `⚠️ **Error:** ${err.message || 'Failed to send message. Please try again.'}` }
            : m
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  const projectName = project?.name || 'Codebase';

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Back to dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800"></div>

          {/* CodeLens Logo - Redirects to Landing Page */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Go to CodeLens Landing Page"
          >
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors text-sm">
              CodeLens
            </span>
          </div>

          <span className="text-slate-600 text-xs">/</span>
          <span className="font-medium text-slate-300 text-xs truncate max-w-xs">{projectName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadWorkspaceData}
            title="Refresh files"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Tree Explorer */}
        <div className="w-72 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
          <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 text-xs font-semibold text-slate-400 tracking-wider uppercase">
            <div className="flex items-center">
              <Folder className="w-3.5 h-3.5 mr-2 text-indigo-400" />
              <span>Explorer</span>
            </div>
            <span className="text-[11px] font-normal text-slate-500 font-mono">
              {files.length > 0 ? `${files.length} files` : ''}
            </span>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            {loadingFiles ? (
              <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Loading file tree...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center flex flex-col items-center gap-2">
                <Folder className="w-6 h-6 text-slate-700" />
                <span>No files found in this project yet</span>
              </div>
            ) : (
              <FileTree
                tree={fileTree}
                activeFileId={activeFile?.id}
                onSelectFile={handleSelectFile}
              />
            )}
          </div>
        </div>

        {/* Center: Code Viewer */}
        <CodeViewer
          activeFile={activeFile}
          fileContent={fileContent}
          isLoading={loadingContent}
        />

        {/* Right: CodeLens AI Chat Assistant */}
        <ChatSidebar
          projectName={projectName}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatLoading={chatLoading}
          onSendMessage={handleSendMessage}
          onSourceClick={handleSourceClick}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
}
