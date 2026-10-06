import React from 'react';
import { Download, RotateCcw, CheckCircle2, Sparkles, FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';
import { ProcessedResult } from '../types';

interface DownloadCardProps {
  result: ProcessedResult;
  onDownload: () => void;
  onReset: () => void;
  isMultiple?: boolean;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  result,
  onDownload,
  onReset,
  isMultiple,
}) => {
  const isImage = result.mimeType.startsWith('image/');
  const isZip = result.mimeType.includes('zip') || result.fileName.endsWith('.zip');
  const isPdf = result.mimeType.includes('pdf') || result.fileName.endsWith('.pdf');

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Success Badge */}
      <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Your file is ready for download!</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        Processing Completed
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 truncate max-w-md mx-auto">
        {result.fileName}
      </p>

      {/* Savings & Metric Card */}
      {result.savingsPercentage !== undefined && result.savingsPercentage > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/60 flex items-center justify-around">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Original Size</span>
            <span className="text-sm font-bold text-slate-700">{formatBytes(result.originalSize)}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">New Size</span>
            <span className="text-sm font-bold text-emerald-600">{formatBytes(result.processedSize)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center space-x-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>You saved {result.savingsPercentage}%</span>
          </div>
        </div>
      )}

      {/* Preview Box if applicable */}
      {isImage && result.downloadUrl && (
        <div className="mb-6 p-2 rounded-2xl bg-slate-50 border border-slate-200 inline-block max-w-sm max-h-64 overflow-hidden checkerboard-pattern">
          <img
            src={result.downloadUrl}
            alt="Processed Preview"
            className="max-h-56 max-w-full rounded-xl mx-auto object-contain shadow-sm"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onDownload}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 text-base group"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download {isZip ? 'ZIP Archive' : isPdf ? 'PDF File' : 'Processed File'}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Process Another File</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-6">
        🔒 Processed locally in your browser. No files stored on cloud servers.
      </p>
    </div>
  );
};
