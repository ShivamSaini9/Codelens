import React from 'react';
import { File, FileCode, Loader2 } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Prism language registrations
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('go', go);

const getLanguage = (extension) => {
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'py':
      return 'python';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'sh':
      return 'bash';
    default:
      return 'javascript';
  }
};

export default function CodeViewer({ activeFile, fileContent, isLoading }) {
  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0d1117]">
        <FileCode className="w-16 h-16 mb-4 text-slate-800" />
        <p className="text-sm">Select a file from the explorer to view its contents</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 shrink-0 text-xs font-mono text-slate-300">
        <File className="w-4 h-4 mr-2 text-indigo-400" />
        <span className="truncate">{activeFile.filePath}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading file...</span>
          </div>
        ) : (
          <SyntaxHighlighter
            language={getLanguage(activeFile.extension)}
            style={vscDarkPlus}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              background: 'transparent',
              fontSize: '13px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
            lineNumberStyle={{
              minWidth: '3.5em',
              paddingRight: '1em',
              color: '#6e7681',
              textAlign: 'right',
              userSelect: 'none',
            }}
          >
            {fileContent}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
