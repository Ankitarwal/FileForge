import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ToolItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolItem[];
  onSelectTool: (toolId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
          t.acceptedFormats.some((fmt) => fmt.toLowerCase().includes(query.toLowerCase())) ||
          t.outputFormat.toLowerCase().includes(query.toLowerCase())
      )
    : tools.slice(0, 8); // show popular / first 8

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name, format (e.g. compress, ocr, passport, word)..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-800 focus:outline-none placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-semibold bg-white text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            {query.trim() ? `Search Results (${filtered.length})` : 'Popular Quick Access Tools'}
          </div>

          {filtered.length > 0 ? (
            filtered.map((tool) => {
              const IconComponent =
                (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.iconName] || Icons.File;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50/70 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.accentColor} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 group-hover:text-indigo-600">
                    <span className="hidden sm:inline-block text-[11px] uppercase">{tool.outputFormat}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching tools found for "{query}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
