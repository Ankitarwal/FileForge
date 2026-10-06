import React, { useState, useRef } from 'react';
import { ShieldAlert, EyeOff, Check, RotateCcw, Trash2 } from 'lucide-react';
import { RedactBox } from '../services/imageProcessing';

interface RedactEditorProps {
  imageSrc: string;
  onApplyRedaction: (boxes: RedactBox[]) => void;
  onCancel: () => void;
}

export const RedactEditor: React.FC<RedactEditorProps> = ({
  imageSrc,
  onApplyRedaction,
  onCancel,
}) => {
  const [redactionMode, setRedactionMode] = useState<'blur' | 'pixelate' | 'black'>('black');
  const [boxes, setBoxes] = useState<RedactBox[]>([]);
  const [currentBox, setCurrentBox] = useState<{ startX: number; startY: number; currX: number; currY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentBox({ startX: x, startY: y, currX: x, currY: y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentBox || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setCurrentBox((prev) => (prev ? { ...prev, currX: x, currY: y } : null));
  };

  const handleMouseUp = () => {
    if (!currentBox || !containerRef.current || !imageRef.current) {
      setCurrentBox(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const naturalW = imageRef.current.naturalWidth;
    const naturalH = imageRef.current.naturalHeight;

    const scaleX = naturalW / rect.width;
    const scaleY = naturalH / rect.height;

    const x = Math.min(currentBox.startX, currentBox.currX) * scaleX;
    const y = Math.min(currentBox.startY, currentBox.currY) * scaleY;
    const w = Math.abs(currentBox.currX - currentBox.startX) * scaleX;
    const h = Math.abs(currentBox.currY - currentBox.startY) * scaleY;

    if (w > 5 && h > 5) {
      setBoxes((prev) => [...prev, { x, y, width: w, height: h, type: redactionMode }]);
    }
    setCurrentBox(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <EyeOff className="w-5 h-5 text-slate-800" />
          <span>Blur & Redact Sensitive Information</span>
        </h3>
        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Permanent Censor</span>
        </span>
      </div>

      {/* Security Caution Box */}
      <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Security Notice:</strong> Redaction permanently removes the underlying pixels/text before export. Review the highlighted boxes carefully before downloading.
        </p>
      </div>

      {/* Redaction Mode Selector */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xs font-bold text-slate-500">Censor Style:</span>
        <button
          type="button"
          onClick={() => setRedactionMode('black')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            redactionMode === 'black' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ■ Black Redaction
        </button>
        <button
          type="button"
          onClick={() => setRedactionMode('pixelate')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            redactionMode === 'pixelate' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ▦ Pixelate
        </button>
        <button
          type="button"
          onClick={() => setRedactionMode('blur')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            redactionMode === 'blur' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ≋ Blur
        </button>

        {boxes.length > 0 && (
          <button
            type="button"
            onClick={() => setBoxes([])}
            className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All ({boxes.length})</span>
          </button>
        )}
      </div>

      {/* Drawing Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-80 sm:h-96 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center cursor-crosshair select-none"
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="To Redact"
          className="max-h-full max-w-full object-contain pointer-events-none"
        />

        {/* Existing Redaction Boxes Overlay */}
        {containerRef.current && imageRef.current && boxes.map((b, idx) => {
          const rect = containerRef.current!.getBoundingClientRect();
          const naturalW = imageRef.current!.naturalWidth;
          const naturalH = imageRef.current!.naturalHeight;
          const scaleX = rect.width / naturalW;
          const scaleY = rect.height / naturalH;

          return (
            <div
              key={idx}
              style={{
                left: `${b.x * scaleX}px`,
                top: `${b.y * scaleY}px`,
                width: `${b.width * scaleX}px`,
                height: `${b.height * scaleY}px`,
              }}
              className={`absolute border border-red-500 flex items-center justify-center text-[10px] font-bold ${
                b.type === 'black' ? 'bg-black text-white' : b.type === 'pixelate' ? 'bg-indigo-900/80 backdrop-blur-sm text-white' : 'bg-slate-400/80 backdrop-blur-md text-slate-900'
              }`}
            >
              REDACTED
            </div>
          );
        })}

        {/* Current Active Drawing Box */}
        {currentBox && (
          <div
            style={{
              left: `${Math.min(currentBox.startX, currentBox.currX)}px`,
              top: `${Math.min(currentBox.startY, currentBox.currY)}px`,
              width: `${Math.abs(currentBox.currX - currentBox.startX)}px`,
              height: `${Math.abs(currentBox.currY - currentBox.startY)}px`,
            }}
            className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
          />
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-3 text-center">
        💡 Click and drag with your mouse to draw redaction rectangles over names, passwords, or faces.
      </p>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onApplyRedaction(boxes)}
          className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Apply Redactions ({boxes.length})</span>
        </button>
      </div>
    </div>
  );
};
