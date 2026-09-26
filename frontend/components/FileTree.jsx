import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, ChevronRight, ChevronsUpDown } from 'lucide-react';

export default function FileTree({ tree, activeFileId, onSelectFile }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Auto-expand all folders when tree changes so files are immediately visible
  useEffect(() => {
    if (!tree) return;
    const allFolderPaths = new Set(['', 'root']);
    
    function collectDirs(node) {
      if (!node) return;
      if (node.type === 'directory') {
        allFolderPaths.add(node.path);
        if (node.children) {
          Object.values(node.children).forEach(collectDirs);
        }
      }
    }
    
    collectDirs(tree);
    setExpandedFolders(allFolderPaths);
  }, [tree]);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!tree) return;
    const allFolderPaths = new Set(['', 'root']);
    function collectDirs(node) {
      if (node?.type === 'directory') {
        allFolderPaths.add(node.path);
        if (node.children) Object.values(node.children).forEach(collectDirs);
      }
    }
    collectDirs(tree);
    setExpandedFolders(allFolderPaths);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set(['', 'root']));
  };

  const renderNode = (node, depth = 0) => {
    if (!node) return null;

    if (node.type === 'file') {
      const isSelected = activeFileId === node.fileId;
      return (
        <div 
          key={node.path}
          onClick={() => onSelectFile(node.fileId, node.path, node.extension || '')}
          style={{ paddingLeft: `${depth * 12 + 10}px` }}
          className={`flex items-center gap-2 py-1 px-2 rounded text-xs font-mono cursor-pointer transition-colors select-none ${
            isSelected 
              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-l-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title={node.path}
        >
          <File className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    // Root directory is always expanded
    const isRoot = node.name === 'root' || node.path === '';
    const isExpanded = isRoot || expandedFolders.has(node.path);

    return (
      <div key={node.path || 'root-tree-node'}>
        {!isRoot && (
          <div 
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${(depth - 1) * 12 + 10}px` }}
            className="flex items-center gap-1.5 py-1 px-2 rounded text-xs font-medium cursor-pointer transition-colors text-slate-300 hover:text-white hover:bg-slate-800/60 select-none"
            title={node.path}
          >
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform text-slate-500 ${isExpanded ? 'rotate-90' : ''}`} />
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            )}
            <span className="truncate font-sans font-medium">{node.name}</span>
          </div>
        )}
        {isExpanded && node.children && (
          <div className="space-y-0.5">
            {Object.values(node.children)
              .sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'directory' ? -1 : 1;
              })
              .map((child) => renderNode(child, isRoot ? depth : depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!tree || !tree.children || Object.keys(tree.children).length === 0) {
    return (
      <div className="p-4 text-xs text-slate-500 text-center">
        No files in directory
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end gap-1 px-2 py-1 mb-1 border-b border-slate-800/50">
        <button
          onClick={expandAll}
          className="text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Expand all folders"
        >
          Expand All
        </button>
        <span className="text-slate-600 text-[10px]">•</span>
        <button
          onClick={collapseAll}
          className="text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Collapse all folders"
        >
          Collapse All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderNode(tree)}
      </div>
    </div>
  );
}
