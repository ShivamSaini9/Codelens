import React, { useRef, useEffect } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ChatSidebar({
  projectName,
  messages,
  chatInput,
  setChatInput,
  chatLoading,
  onSendMessage,
  onSourceClick,
  userEmail,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="w-[420px] border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
      <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2 shrink-0">
        <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Bot className="w-4 h-4" />
        </div>
        <span className="font-semibold text-white text-sm">CodeLens Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex gap-3 text-sm">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-slate-300 text-sm leading-relaxed">
              Hello! I've indexed <strong className="text-white">{projectName}</strong>. Ask me anything about its architecture, endpoints, or implementation details.
            </p>
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 text-sm">
            {msg.role === 'assistant' ? (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 uppercase font-semibold text-xs">
                {userEmail?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 pt-0.5 min-w-0">
              {msg.role === 'user' ? (
                <p className="text-slate-200 bg-slate-800/60 px-3 py-2 rounded-xl text-sm leading-relaxed border border-slate-800 inline-block">
                  {msg.content}
                </p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none break-words text-slate-300 leading-relaxed">
                  <div className="markdown-body">
                    <Markdown>
                      {msg.content || (chatLoading && msg.id === messages[messages.length - 1].id ? '*Thinking...*' : '')}
                    </Markdown>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        Referenced Sources
                      </span>
                      <div className="space-y-1.5">
                        {msg.sources.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => onSourceClick(s)}
                            className="text-xs text-indigo-400 truncate hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1.5 font-mono"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span className="truncate">{s.filePath}</span>
                            <span className="text-slate-500 shrink-0">(L{s.startLine}-{s.endLine})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
        <div className="relative">
          <textarea
            rows={3}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this codebase... (Enter to send)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <button
            type="button"
            onClick={onSendMessage}
            disabled={!chatInput.trim() || chatLoading}
            className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
