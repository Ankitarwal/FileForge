import React, { useState, useMemo } from 'react';
import { Search, X, Image as ImageIcon, FileText, Sparkles, Filter } from 'lucide-react';
import { ToolItem, ToolCategory } from '../types';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: ToolItem[];
  selectedCategory: 'all' | 'image' | 'pdf' | 'convert' | 'compress' | 'edit';
  onSelectCategory: (cat: 'all' | 'image' | 'pdf' | 'convert' | 'compress' | 'edit') => void;
  onOpenTool: (toolId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  selectedCategory,
  onSelectCategory,
  onOpenTool,
  searchQuery,
  onSearchChange,
}) => {
  const categories: { key: 'all' | 'image' | 'pdf' | 'convert' | 'compress' | 'edit'; label: string; count?: number }[] = [
    { key: 'all', label: 'All Tools' },
    { key: 'image', label: 'Image Tools' },
    { key: 'pdf', label: 'PDF Tools' },
    { key: 'convert', label: 'Convert' },
    { key: 'compress', label: 'Compress' },
    { key: 'edit', label: 'Edit & Organize' },
  ];

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'image' || selectedCategory === 'pdf'
          ? tool.category === selectedCategory
          : tool.type === selectedCategory;

      if (!matchesCategory) return false;

      // Search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        tool.longDesc.toLowerCase().includes(q) ||
        tool.acceptedFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
        tool.outputFormat.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q)
      );
    });
  }, [tools, selectedCategory, searchQuery]);

  // Separate image vs pdf when in "all" view
  const imageTools = useMemo(() => filteredTools.filter((t) => t.category === 'image'), [filteredTools]);
  const pdfTools = useMemo(() => filteredTools.filter((t) => t.category === 'pdf'), [filteredTools]);
  const popularTools = useMemo(() => tools.filter((t) => t.popular), [tools]);

  return (
    <section id="tools-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Search Bar & Filter Controls Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for a tool (e.g. compress, OCR, convert)..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* When Search is Active or specific non-all category selected */}
      {searchQuery || selectedCategory !== 'all' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : categories.find((c) => c.key === selectedCategory)?.label}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md mx-auto">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No tools matched your search</h3>
              <p className="text-xs text-slate-500 mb-4">Try searching for keywords like "crop", "merge", "pdf to word", or "compress".</p>
              <button
                onClick={() => {
                  onSearchChange('');
                  onSelectCategory('all');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Clear Search & Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard Default Categorized Layout: Popular -> Image Tools -> PDF Tools */
        <div className="space-y-16">
          
          {/* POPULAR TOOLS SECTION */}
          <div>
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Popular Tools</h2>
                <p className="text-xs text-slate-500">Most frequently used tools by creators, students, and professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {popularTools.slice(0, 8).map((tool) => (
                <ToolCard key={`pop-${tool.id}`} tool={tool} onOpen={onOpenTool} />
              ))}
            </div>
          </div>

          {/* IMAGE TOOLS SECTION (15 Tools) */}
          <div id="image-tools-section">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Image Tools</h2>
                  <p className="text-xs text-slate-500">Convert, crop, resize, compress, and edit photos and graphics</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {imageTools.length} Tools
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {imageTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
              ))}
            </div>
          </div>

          {/* PDF TOOLS SECTION (18 Tools) */}
          <div id="pdf-tools-section">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">PDF Tools</h2>
                  <p className="text-xs text-slate-500">Merge, split, compress, convert, sign, and organize PDF documents</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {pdfTools.length} Tools
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {pdfTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
};
