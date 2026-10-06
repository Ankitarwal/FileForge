import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Layers, 
  FileText, 
  HardDrive, 
  Clock, 
  Star, 
  Sparkles, 
  ArrowUpRight, 
  LogOut,
  Download,
  Settings,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile, HistoryItem, ToolItem } from '../types';
import { formatBytes } from '../utils/fileUtils';

interface DashboardModalProps {
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onOpenTool: (toolId: string) => void;
  recentHistory: HistoryItem[];
  tools: ToolItem[];
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  user,
  onClose,
  onLogout,
  onOpenTool,
  recentHistory,
  tools,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'favorites' | 'settings'>('overview');

  const favoriteToolIds = ['image-compressor', 'background-remover', 'merge-pdf', 'pdf-to-word', 'passport-photo-resize'];
  const favoriteTools = tools.filter((t) => favoriteToolIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-extrabold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide flex items-center space-x-1 border border-amber-400/30">
                  <Crown className="w-3 h-3 fill-current" />
                  <span>Pro Member</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center space-x-1 border border-emerald-500/30">
                  <span>✓ Verified</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50">
          {[
            { key: 'overview', label: 'Overview & Stats' },
            { key: 'history', label: 'Conversion History' },
            { key: 'favorites', label: 'Favorite Tools' },
            { key: 'settings', label: 'Account & Plan' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Tools Used This Month</span>
                    <h4 className="text-2xl font-black text-slate-900">{user.monthlyUsage}</h4>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Files Processed</span>
                    <h4 className="text-2xl font-black text-slate-900">{user.filesProcessed}</h4>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Storage Bandwidth Saved</span>
                    <h4 className="text-2xl font-black text-slate-900">{formatBytes(user.savedBytes)}</h4>
                  </div>
                </div>
              </div>

              {/* Recently Used Tools */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Recently Used Tools</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {favoriteTools.slice(0, 4).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onOpenTool(tool.id);
                        onClose();
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all group"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate block">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tool.outputFormat}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Recent Conversion Activity</h4>
              {recentHistory.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {recentHistory.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {item.toolName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.fileName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.toolName} • {formatBytes(item.originalSize)} → {formatBytes(item.processedSize)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Success
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No conversions recorded in this browser session yet.</p>
                </div>
              )}
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Favorite Bookmarked Tools</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onOpenTool(tool.id);
                      onClose();
                    }}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">{tool.name}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Membership Tier</h5>
                  <p className="text-[11px] text-slate-500">Pro Plan — Unlimited access & batch operations</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">Active</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of FileForge</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
