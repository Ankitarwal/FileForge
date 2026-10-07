import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  UploadCloud, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Clock, 
  Download, 
  ShieldCheck, 
  Trash2, 
  Ban, 
  QrCode, 
  FileText, 
  Image as ImageIcon, 
  FileArchive, 
  FileCheck, 
  AlertCircle, 
  ExternalLink,
  Lock,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { FileSharingService } from '../services/fileSharingService';
import { FileShareRecord } from '../types/fileShare';
import { formatBytes, triggerConfetti } from '../utils/fileUtils';
import { generateQRCodeDataUrl } from '../utils/qrGenerator';
import { useAuth } from '../context/AuthContext';

interface FileSharingStudioProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigateHome: () => void;
}

export const FileSharingStudio: React.FC<FileSharingStudioProps> = ({
  onOpenAuth,
  onNavigateHome,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState<number | null>(24);
  const [downloadLimit, setDownloadLimit] = useState<number | null>(null);
  
  // Progress & Execution
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdShare, setCreatedShare] = useState<{ share: FileShareRecord; shareUrl: string } | null>(null);

  // Link copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // QR Modal State
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  // User's Shares Management
  const [myShares, setMyShares] = useState<FileShareRecord[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all');

  // Load user's shares when user is available
  useEffect(() => {
    if (user?.id) {
      loadUserShares(user.id);
    }
  }, [user?.id]);

  const loadUserShares = async (userId: string) => {
    setLoadingShares(true);
    try {
      const shares = await FileSharingService.getUserShares(userId);
      setMyShares(shares);
    } catch (err) {
      console.warn('Error loading shares:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
      setCreatedShare(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
      setCreatedShare(null);
    }
  };

  const handleCreateShare = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to share.');
      return;
    }
    if (!user?.id) {
      onOpenAuth('login');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const result = await FileSharingService.createShare(
        {
          file: selectedFile,
          expiresInHours,
          downloadLimit,
          onProgress: (p) => setUploadProgress(p),
        },
        { id: user.id, email: user.email }
      );

      setCreatedShare(result);
      triggerConfetti();
      // Reload shares
      loadUserShares(user.id);
    } catch (err: any) {
      console.error('Create share error:', err);
      setErrorMessage(err.message || 'Failed to create secure share link. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = (url: string, token: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  const handleWebShare = async (url: string, fileName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FileForge: ${fileName}`,
          text: `Download "${fileName}" securely via FileForge:`,
          url: url,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyLink(url, 'main');
    }
  };

  const handleRevoke = async (share: FileShareRecord) => {
    if (!user?.id) return;
    const confirm = window.confirm(`Are you sure you want to revoke access to "${share.file_name}"? Public downloads will immediately cease.`);
    if (!confirm) return;

    await FileSharingService.revokeShare(share.id, user.id);
    loadUserShares(user.id);
  };

  const handleDelete = async (share: FileShareRecord) => {
    if (!user?.id) return;
    const confirm = window.confirm(`Permanently delete "${share.file_name}" from cloud storage and remove all share records?`);
    if (!confirm) return;

    await FileSharingService.deleteShare(share.id, share.storage_path, user.id);
    loadUserShares(user.id);
  };

  const getFileIcon = (fileName: string, mime: string) => {
    if (mime.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-rose-500" />;
    }
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|gif|bmp)$/i.test(fileName)) {
      return <ImageIcon className="w-8 h-8 text-indigo-500" />;
    }
    if (mime.includes('zip') || /\.(zip|rar|7z)$/i.test(fileName)) {
      return <FileArchive className="w-8 h-8 text-amber-500" />;
    }
    return <FileCheck className="w-8 h-8 text-blue-500" />;
  };

  const isShareExpired = (share: FileShareRecord) => {
    if (!share.expires_at) return false;
    return new Date(share.expires_at) <= new Date();
  };

  const isLimitReached = (share: FileShareRecord) => {
    if (!share.download_limit) return false;
    return share.download_count >= share.download_limit;
  };

  const filteredShares = myShares.filter((s) => {
    const expired = isShareExpired(s) || isLimitReached(s) || s.is_revoked;
    if (activeTab === 'active') return !expired;
    if (activeTab === 'expired') return expired;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-left">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 shadow-subtle py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                <Share2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Secure File Sharing
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Encrypted Cloud
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Upload any document or image and generate self-destructing, tokenized download links with custom expiration and download limits.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl font-semibold border border-emerald-100 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>Tokenized Signed Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {/* Not Logged In Warning Banner */}
        {!user && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold flex items-center justify-center sm:justify-start space-x-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Authentication Required to Create Shares</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Sign in with your FileForge account or Google login to upload files, generate unique share links, and manage active downloads.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-6 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all flex-shrink-0"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN UPLOAD & SHARE CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Create a New Secure Share Link</h2>
          </div>

          {/* Upload Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01] ring-4 ring-indigo-500/20'
                : 'border-slate-300 bg-slate-50/60 hover:bg-white hover:border-indigo-400 hover:shadow-md'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {selectedFile ? selectedFile.name : 'Choose a file or drag & drop here'}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                {selectedFile ? `${formatBytes(selectedFile.size)} • Ready to upload` : 'PDF, Images, Archives, or documents up to 50 MB'}
              </p>
              <button
                type="button"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                {selectedFile ? 'Change File' : 'Browse File'}
              </button>
            </div>
          </div>

          {/* Configuration Grid */}
          {selectedFile && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Expiration Settings */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Link Expiration Duration</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { hours: 1, label: '1 Hour' },
                      { hours: 24, label: '24 Hours' },
                      { hours: 168, label: '7 Days' },
                      { hours: null, label: 'Never Expire' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setExpiresInHours(item.hours)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          expiresInHours === item.hours
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download Limit Settings */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Download Limit (Self-Destruct)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { limit: null, label: 'Unlimited' },
                      { limit: 1, label: '1 Download (Burn)' },
                      { limit: 5, label: '5 Downloads' },
                      { limit: 10, label: '10 Downloads' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setDownloadLimit(item.limit)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          downloadLimit === item.limit
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Uploading to secure cloud vault...</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleCreateShare}
                  disabled={isUploading}
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isUploading ? 'Encrypting & Generating Link...' : 'Generate Secure Share Link'}</span>
                </button>
              </div>

            </div>
          )}

          {/* Generated Share Link Preview Card */}
          {createdShare && (
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-50/80 via-white to-blue-50/60 border-2 border-indigo-200/90 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Link Generated Successfully!</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 font-mono text-xs text-slate-800 truncate shadow-inner">
                  {createdShare.shareUrl}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(createdShare.shareUrl, createdShare.share.share_token)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    {copiedToken === createdShare.share.share_token ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      onClick={() => handleWebShare(createdShare.shareUrl, createdShare.share.file_name)}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                      title="Share via App / Web Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setQrModalUrl(createdShare.shareUrl)}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  📁 {createdShare.share.file_name} ({formatBytes(createdShare.share.file_size)})
                </span>
                <span>•</span>
                <span>
                  ⏳ {createdShare.share.expires_at ? `Expires ${new Date(createdShare.share.expires_at).toLocaleString()}` : 'Never expires'}
                </span>
                {createdShare.share.download_limit && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">🔥 Max {createdShare.share.download_limit} download(s)</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="pt-2 text-[11px] text-slate-400 text-center leading-normal">
            Files are securely stored and automatically become unavailable after the selected expiration time.
          </div>

        </div>

        {/* SHARES MANAGEMENT TABLE & HISTORY */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Your Shared Links</h2>
              <p className="text-xs text-slate-400">View active downloads, copy links, or revoke public access anytime</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {(['all', 'active', 'expired'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    activeTab === tab ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loadingShares ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
              <p>Loading your active shares...</p>
            </div>
          ) : filteredShares.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Share2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No shared files in this view</p>
              <p>Upload a file above to create your first secure share link.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredShares.map((share) => {
                const expired = isShareExpired(share);
                const limitHit = isLimitReached(share);
                const isDead = expired || limitHit || share.is_revoked;
                const shareUrl = `${window.location.origin}/share/${share.share_token}`;

                return (
                  <div
                    key={share.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDead
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 overflow-hidden">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0">
                        {getFileIcon(share.file_name, share.mime_type)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={share.file_name}>
                            {share.file_name}
                          </h4>
                          {share.is_revoked ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              Revoked
                            </span>
                          ) : expired ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Expired
                            </span>
                          ) : limitHit ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              Limit Reached
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{formatBytes(share.file_size)}</span>
                          <span>•</span>
                          <span>
                            Downloads: {share.download_count} {share.download_limit ? `/ ${share.download_limit}` : ''}
                          </span>
                          <span>•</span>
                          <span>
                            {share.expires_at ? `Expires: ${new Date(share.expires_at).toLocaleDateString()}` : 'No expiry'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
                      {!isDead && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(shareUrl, share.share_token)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center space-x-1"
                            title="Copy Share Link"
                          >
                            {copiedToken === share.share_token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedToken === share.share_token ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQrModalUrl(shareUrl)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevoke(share)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Revoke Public Link"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(share)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* QR Code Modal Drawer */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Scan to Download</h3>
              <button
                type="button"
                onClick={() => setQrModalUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
              <img
                src={generateQRCodeDataUrl(qrModalUrl, 240)}
                alt="FileForge QR Code"
                className="w-48 h-48 rounded-xl shadow-sm bg-white p-2"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Point your smartphone camera to immediately access and download the file.
            </p>

            <button
              type="button"
              onClick={() => setQrModalUrl(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
