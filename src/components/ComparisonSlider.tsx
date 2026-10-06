import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ComparisonSliderProps {
  originalSrc: string;
  processedSrc: string;
  originalLabel?: string;
  processedLabel?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalSrc,
  processedSrc,
  originalLabel = 'Original',
  processedLabel = 'Compressed',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2 px-1">
        <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">{originalLabel} (Left)</span>
        <span className="text-[11px] text-slate-400">Drag slider to compare</span>
        <span className="bg-indigo-100 px-2 py-0.5 rounded text-indigo-700">{processedLabel} (Right)</span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-slate-200 shadow-md checkerboard-pattern"
      >
        {/* Processed (Right/Bottom Layer) */}
        <img
          src={processedSrc}
          alt="Processed"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Original (Left Clipped Layer) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={originalSrc}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none -translate-x-1/2"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-700 rounded-full shadow-lg border border-slate-200 flex items-center justify-center font-bold text-xs">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
};
