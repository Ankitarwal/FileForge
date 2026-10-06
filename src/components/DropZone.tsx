import React, { useRef, useState } from 'react';
import { UploadCloud, Plus, FileText, Image as ImageIcon, X } from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';

interface DropZoneProps {
  acceptedFormats: string[];
  supportsMultiple: boolean;
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile?: (index: number) => void;
  title?: string;
  subtitle?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptedFormats,
  supportsMultiple,
  onFilesSelected,
  files,
  onRemoveFile,
  title = 'Drop your files here',
  subtitle = 'or click to browse from your device',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01] ring-4 ring-indigo-500/20'
            : 'border-slate-300 bg-slate-50/60 hover:bg-white hover:border-indigo-400 hover:shadow-md'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={supportsMultiple}
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 mb-4">{subtitle}</p>

          {/* Formats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Supported:</span>
            {acceptedFormats.map((fmt) => (
              <span key={fmt} className="px-2 py-0.5 bg-white text-slate-600 text-[11px] font-semibold rounded border border-slate-200 uppercase">
                {fmt.replace('.', '')}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            {supportsMultiple ? 'Select Files' : 'Choose File'}
          </button>
        </div>
      </div>

      {/* Selected Files List if any */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Selected Files ({files.length})</span>
            {supportsMultiple && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    {file.type.includes('pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                  </div>
                </div>

                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-2"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
