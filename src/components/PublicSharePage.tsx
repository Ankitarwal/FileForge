import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  FileArchive, 
  Share2, 
  FileCheck,
  RefreshCw,
  ExternalLink,
  Flame
} from 'lucide-react';
import { FileSharingService } from '../services/fileSharingService';
import { FileShareRecord, ShareValidationResult } from '../types/fileShare';
import { formatBytes, triggerConfetti } from '../utils/fileUtils';

interface PublicSharePageProps {
  token: string;
  onNavigateHome: () => void;
}

export const PublicSharePage: React.FC<PublicSharePageProps> = ({ token, onNavigateHome }) => {
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<ShareValidationResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadShare() {
      setLoading(true);
      try {
        const res = await FileSharingService.getShareByToken(token);
        if (mounted) {
          setValidation(res);
        }
      } catch (err: any) {
        if (mounted) {
          setValidation({ isValid: false, reason: 'not_found' });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadShare();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleDownload = async () => {
    if (!validation?.share || downloading) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      await FileSharingService.downloadSharedFile(validation.share);
      setDownloadSuccess(true);
      triggerConfetti();

      // Update local remaining downloads if limit exists
      if (validation.remainingDownloads !== null && validation.remainingDownloads !== undefined) {
        setValidation((prev) => prev ? {
          ...prev,
          remainingDownloads: Math.max(0, (prev.remainingDownloads || 1) - 1),
          share: prev.share ? { ...prev.share, download_count: prev.share.download_count + 1 } : undefined,
        } : prev);
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err.message || 'Unable to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (fileName: string, mime: string) => {
    if (mime.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-10 h-10 text-rose-500" />;
    }
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|gif|bmp|svg)$/i.test(fileName)) {
      return <ImageIcon className="w-10 h-10 text-indigo-500" />;
    }
    if (mime.includes('zip') || mime.includes('compressed') || /\.(zip|rar|7z|tar|gz)$/i.test(fileName)) {
      return <FileArchive className="w-10 h-10 text-amber-500" />;
    }
    return <FileCheck className="w-10 h-10 text-blue-500" />;
  };

  const formatExpiryTime = (isoString: string | null) => {
    if (!isoString) return 'Never expires';
    const expiry = new Date(isoString);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 1) {
      return `Expires in ${days} days (${expiry.toLocaleDateString()})`;
    } else if (hours >= 1) {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `Expires in ${hours}h ${minutes}m`;
    } else {
      const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Expires in ${minutes} minutes`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between text-slate-800">
      
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            type="button"
            onClick={onNavigateHome}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">File<span className="text-indigo-600">Forge</span></span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Share</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to FileForge Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-base font-bold text-slate-800">Verifying secure link...</h2>
            <p className="text-xs text-slate-400">Checking permissions, expiration, and download tokens</p>
          </div>
        ) : !validation || !validation.isValid ? (
          /* Error States: Expired / Limit Reached / Revoked / Not Found */
          <div className="p-8 sm:p-10 bg-white rounded-3xl border border-rose-100 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {validation?.reason === 'expired'
                  ? 'Link Has Expired'
                  : validation?.reason === 'limit_reached'
                  ? 'Download Limit Reached'
                  : validation?.reason === 'revoked'
                  ? 'Share Link Revoked'
                  : 'File Not Found'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {validation?.reason === 'expired'
                  ? 'This file is no longer available because the owner’s expiration timer has elapsed.'
                  : validation?.reason === 'limit_reached'
                  ? 'This file had a maximum download limit set by the sender, and that limit has now been reached.'
                  : validation?.reason === 'revoked'
                  ? 'The owner of this link has revoked public access.'
                  : 'The share token is invalid or the file has been permanently deleted.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md"
              >
                Go to FileForge Home
              </button>
            </div>
          </div>
        ) : (
          /* Active Valid Shared File Card */
          <div className="p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Security Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified FileForge Secure Share</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Encrypted in Transit
              </div>
            </div>

            {/* File Details Box */}
            <div className="flex items-start space-x-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
                {getFileIcon(validation.share!.file_name, validation.share!.mime_type)}
              </div>
              <div className="overflow-hidden flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate" title={validation.share!.file_name}>
                  {validation.share!.file_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    {formatBytes(validation.share!.file_size)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="truncate max-w-[150px]">{validation.share!.mime_type}</span>
                </div>
              </div>
            </div>

            {/* Info Badges: Expiry & Download Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Link Expiration</div>
                  <div className="font-bold text-slate-800">{formatExpiryTime(validation.share!.expires_at)}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Downloads Left</div>
                  <div className="font-bold text-slate-800">
                    {validation.remainingDownloads !== null && validation.remainingDownloads !== undefined
                      ? `${validation.remainingDownloads} download${validation.remainingDownloads === 1 ? '' : 's'} remaining`
                      : 'Unlimited downloads'}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Error Notice if any */}
            {downloadError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Download Action Button */}
            <div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Preparing Secure Download...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Download Started! Click to Re-Download</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download File ({formatBytes(validation.share!.file_size)})</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy Disclaimer */}
            <p className="text-[11px] text-center text-slate-400 leading-normal">
              Files are securely stored and automatically become unavailable after the selected expiration time or download limit.
            </p>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} FileForge. Client-First Cloud & Document Solutions.</p>
      </footer>

    </div>
  );
};
