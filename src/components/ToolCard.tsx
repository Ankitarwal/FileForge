import React from 'react';
import * as Icons from 'lucide-react';
import { ToolItem } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: ToolItem;
  onOpen: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onOpen }) => {
  // Dynamically resolve icon from lucide-react with fallback
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[tool.iconName] || Icons.File;

  return (
    <div
      onClick={() => onOpen(tool.id)}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-indigo-400/80 shadow-sm hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden text-left"
    >
      {/* Top background accent subtle glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-indigo-500/15 transition-all" />

      <div>
        {/* Top Header Row: Icon & Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${tool.accentColor} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform duration-200`}>
            <IconComponent className="w-6 h-6" />
          </div>

          {tool.badge && (
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
              tool.badge === 'Popular' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : tool.badge === 'Smart AI' || tool.badge === 'AI Powered'
                ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100'
                : tool.badge === 'Security' || tool.badge === 'Archival'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {(tool.badge === 'Popular' || tool.badge === 'Smart AI') && <Sparkles className="w-3 h-3 text-current" />}
              <span>{tool.badge}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {tool.shortDesc}
        </p>
      </div>

      {/* Footer / Open Button */}
      <div className="pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {tool.outputFormat}
        </span>
        <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-200">
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
