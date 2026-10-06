import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Image as ImageIcon, 
  FileText,
  Lock
} from 'lucide-react';

interface HeroProps {
  onExploreImages: () => void;
  onExplorePdf: () => void;
  onFilesDropped: (files: File[]) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreImages,
  onExplorePdf,
  onFilesDropped,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(Array.from(e.target.files));
    }
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
      
      {/* Background decoration dots & blur glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-r from-indigo-400/15 via-blue-400/15 to-purple-400/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm animate-in fade-in zoom-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>Next-Gen Image & PDF Studio — 100% Client-Side Privacy</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
          All Your Image & PDF Tools.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600">
            In One Place.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          Convert, compress, resize, edit, merge and transform your images and PDFs quickly and securely — right from your browser.
        </p>

        {/* Primary Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={onExploreImages}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center space-x-2 group"
          >
            <ImageIcon className="w-5 h-5 text-indigo-100" />
            <span>Explore Image Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onExplorePdf}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 group"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Explore PDF Tools</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Trust Message */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 mb-10">
          <span className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Fast</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure & Private</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span>Easy to Use</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-blue-500" />
            <span>No Software Installation</span>
          </span>
        </div>

        {/* Large Drag-and-Drop Multi-File Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative max-w-3xl mx-auto rounded-3xl border-2 border-dashed p-8 sm:p-12 transition-all duration-200 cursor-pointer text-center bg-white/95 shadow-xl ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01] ring-4 ring-indigo-500/20'
              : 'border-slate-300 hover:border-indigo-400 hover:shadow-2xl'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif,.svg,.docx,.xlsx,.pptx"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
              isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <UploadCloud className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Drop your files here
            </h3>
            <p className="text-sm sm:text-base text-slate-500 mb-5">
              or <span className="font-semibold text-indigo-600 underline underline-offset-2">choose files from your device</span>
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {['PDF', 'JPG', 'PNG', 'WebP', 'AVIF', 'DOCX', 'XLSX'].map((ext) => (
                <span key={ext} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200/60">
                  {ext}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-file upload supported • Up to 200MB per file • Processed securely</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
