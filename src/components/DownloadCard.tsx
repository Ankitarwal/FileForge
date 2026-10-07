import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  ArrowRight,
  Edit3,
  Check,
  Undo2,
  Eye,
  EyeOff,
  Maximize2,
  X,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';
import { ProcessedResult } from '../types';

interface DownloadCardProps {
  result: ProcessedResult;
  onDownload: (customFileName?: string) => void;
  onReset: () => void;
  onEdit?: () => void;
  isMultiple?: boolean;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  result,
  onDownload,
  onReset,
  onEdit,
  isMultiple,
}) => {
  const isImage = result.mimeType.startsWith('image/');
  const isZip = result.mimeType.includes('zip') || result.fileName.endsWith('.zip');
  const isPdf = result.mimeType.includes('pdf') || result.fileName.endsWith('.pdf');

  // Parse default base name & extension
  const lastDotIndex = result.fileName.lastIndexOf('.');
  const defaultExt = lastDotIndex !== -1 ? result.fileName.substring(lastDotIndex) : '';
  const defaultBaseName = lastDotIndex !== -1 ? result.fileName.substring(0, lastDotIndex) : result.fileName;

  const [customBaseName, setCustomBaseName] = useState(defaultBaseName);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // Sync if result changes
  useEffect(() => {
    const dotIdx = result.fileName.lastIndexOf('.');
    setCustomBaseName(dotIdx !== -1 ? result.fileName.substring(0, dotIdx) : result.fileName);
  }, [result.fileName]);

  const finalFileName = `${customBaseName.trim() || 'FileForge_Export'}${defaultExt}`;

  const handleDownloadClick = () => {
    onDownload(finalFileName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDownloadClick();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Success Badge */}
      <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Your file is processed & ready for download!</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        Processing Completed
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mb-6">
        Preview your live result, rename your file, or adjust settings before saving.
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

      {/* ================= LIVE PDF INTERACTIVE PREVIEW ================= */}
      {isPdf && result.downloadUrl && (
        <div className="mb-6 text-left bg-slate-50/90 rounded-2xl border border-slate-200 p-4 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Live PDF Document Viewer</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/70 transition-colors"
              >
                {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showLivePreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                title="Open in full screen modal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>
            </div>
          </div>

          {showLivePreview && (
            <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                src={`${result.downloadUrl}#toolbar=1&navpanes=0`}
                title="Live PDF Document Preview"
                className="w-full h-80 sm:h-96 rounded-xl border-none"
              />
            </div>
          )}
        </div>
      )}

      {/* ================= LIVE IMAGE PREVIEW ================= */}
      {isImage && result.downloadUrl && (
        <div className="mb-6 text-left bg-slate-50/90 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Live Image Result Preview</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Preview</span>
            </button>
          </div>

          <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center checkerboard-pattern min-h-[160px] max-h-80 overflow-hidden">
            <img
              src={result.downloadUrl}
              alt="Processed Preview"
              className="max-h-72 max-w-full rounded-lg object-contain shadow-sm hover:scale-[1.01] transition-transform"
            />
          </div>
        </div>
      )}

      {/* ================= RENAME FILE / SAVE AS SECTION ================= */}
      <div className="mb-6 text-left max-w-lg mx-auto bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="file-rename-input" className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save As / File Name</span>
          </label>

          {customBaseName !== defaultBaseName && (
            <button
              type="button"
              onClick={() => setCustomBaseName(defaultBaseName)}
              className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center space-x-1 font-medium transition-colors"
              title="Reset to default generated name"
            >
              <Undo2 className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            id="file-rename-input"
            type="text"
            value={customBaseName}
            onChange={(e) => setCustomBaseName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter file name..."
            className="w-full pl-3.5 pr-20 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          />
          {defaultExt && (
            <span className="absolute right-2 px-2.5 py-1 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 select-none">
              {defaultExt}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">
          Tip: You can rename this file to whatever you like. Press Enter or click Download below.
        </p>
      </div>

      {/* ================= ACTION BUTTONS (DOWNLOAD / EDIT / RESET) ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Primary Download Button */}
        <button
          onClick={handleDownloadClick}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 text-base group"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download {isZip ? 'ZIP Archive' : isPdf ? 'PDF Document' : 'Processed File'}</span>
        </button>

        {/* Edit / Re-tune Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full sm:w-auto px-5 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm border border-indigo-200"
            title="Go back and adjust settings without re-uploading"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Edit / Adjust Settings</span>
          </button>
        )}

        {/* Process Another File Button */}
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New File</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-6">
        🔒 Processed locally in your browser. No files stored on cloud servers.
      </p>

      {/* ================= FULLSCREEN PREVIEW MODAL ================= */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 text-white max-w-6xl w-full mx-auto">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg truncate max-w-md">{finalFileName}</span>
              <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Live HD Preview
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Now</span>
              </button>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-6xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={`${result.downloadUrl}#toolbar=1`}
                title="Fullscreen PDF Preview"
                className="w-full h-full border-none"
              />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4 checkerboard-pattern overflow-auto">
                <img
                  src={result.downloadUrl}
                  alt="Fullscreen Preview"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : (
              <div className="text-center p-8 text-slate-500">
                <p>Preview not available for this file format.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
