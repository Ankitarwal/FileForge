import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, ZoomIn, Crop, Check, RotateCcw } from 'lucide-react';
import { CropOptions } from '../services/imageProcessing';

interface InteractiveCropperProps {
  imageSrc: string;
  onApplyCrop: (options: CropOptions) => void;
  onCancel: () => void;
}

type AspectRatioMode = 'free' | '1:1' | '4:3' | '16:9' | 'passport' | '3:2';

export const InteractiveCropper: React.FC<InteractiveCropperProps> = ({
  imageSrc,
  onApplyCrop,
  onCancel,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('free');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // in percentages
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Apply ratio constraint
  const handleRatioChange = (ratio: AspectRatioMode) => {
    setAspectRatio(ratio);
    if (ratio === '1:1') {
      setCropBox({ x: 20, y: 20, width: 60, height: 60 });
    } else if (ratio === '16:9') {
      setCropBox({ x: 10, y: 25, width: 80, height: 45 });
    } else if (ratio === '4:3') {
      setCropBox({ x: 15, y: 20, width: 70, height: 52.5 });
    } else if (ratio === 'passport') {
      setCropBox({ x: 25, y: 10, width: 50, height: 65 });
    } else if (ratio === '3:2') {
      setCropBox({ x: 10, y: 20, width: 80, height: 53.3 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropBox((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    if (!imageRef.current) return;
    const naturalW = imageRef.current.naturalWidth;
    const naturalH = imageRef.current.naturalHeight;

    const realX = (cropBox.x / 100) * naturalW;
    const realY = (cropBox.y / 100) * naturalH;
    const realW = (cropBox.width / 100) * naturalW;
    const realH = (cropBox.height / 100) * naturalH;

    onApplyCrop({
      x: realX,
      y: realY,
      width: realW,
      height: realH,
      rotation,
      zoom,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Crop className="w-5 h-5 text-indigo-600" />
          <span>Interactive Cropper & Framing</span>
        </h3>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          Live Crop
        </span>
      </div>

      {/* Aspect Ratio Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-bold text-slate-500 mr-1">Aspect Ratio:</span>
        {(['free', '1:1', '4:3', '16:9', '3:2', 'passport'] as AspectRatioMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleRatioChange(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
              aspectRatio === mode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {mode === 'passport' ? 'Passport (35x45)' : mode}
          </button>
        ))}
      </div>

      {/* Canvas / Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-80 sm:h-96 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center select-none"
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="To Crop"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transition: 'transform 0.1s ease-out',
          }}
          className="max-h-full max-w-full object-contain pointer-events-none"
        />

        {/* Darkened overlay outside crop box */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Crop Selection Window */}
        <div
          style={{
            left: `${cropBox.x}%`,
            top: `${cropBox.y}%`,
            width: `${cropBox.width}%`,
            height: `${cropBox.height}%`,
          }}
          className="absolute border-2 border-indigo-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] cursor-move"
        >
          {/* Rule of thirds grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Corner Grab Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-sm" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-sm" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-sm" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white rounded-sm" />
        </div>
      </div>

      {/* Sliders: Zoom & Rotation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center space-x-1">
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Rotation</span>
            </span>
            <span>{rotation}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center space-x-1">
              <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Zoom</span>
            </span>
            <span>{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-5">
        <button
          type="button"
          onClick={() => {
            setRotation(0);
            setZoom(1);
            setCropBox({ x: 10, y: 10, width: 80, height: 80 });
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Apply Crop & Frame</span>
        </button>
      </div>
    </div>
  );
};
