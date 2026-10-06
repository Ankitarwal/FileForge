import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Eraser, 
  Paintbrush, 
  RotateCcw, 
  Check, 
  Eye, 
  Sliders, 
  Pipette, 
  ZoomIn, 
  ZoomOut,
  Layers,
  Palette,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { loadImage } from '../utils/fileUtils';

interface BackgroundRemoverStudioProps {
  imageFile: File;
  onApply: (blob: Blob, mode: 'transparent' | 'white' | 'custom', customColor?: string) => void;
  onCancel: () => void;
}

export const BackgroundRemoverStudio: React.FC<BackgroundRemoverStudioProps> = ({
  imageFile,
  onApply,
  onCancel,
}) => {
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'offwhite' | 'blue' | 'custom'>('transparent');
  const [customColor, setCustomColor] = useState('#6366f1');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState<string>('');
  const [activeTool, setActiveTool] = useState<'none' | 'eraser' | 'restore' | 'picker'>('none');
  const [brushSize, setBrushSize] = useState(25);
  const [tolerance, setTolerance] = useState(35);
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);

  // Canvases
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // stores alpha mask (255 = keep, 0 = remove)
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const isDrawing = useRef(false);

  // Initialize and run auto background removal on load
  const runSmartRemoval = useCallback(async (useAI: boolean = true) => {
    try {
      setIsProcessingAI(true);
      setAiProgress(useAI ? 'Loading AI Model & Segmenting Subject...' : 'Processing Edge & Color Mask...');

      const originalImg = await loadImage(URL.createObjectURL(imageFile));
      originalImageRef.current = originalImg;

      const w = originalImg.naturalWidth || originalImg.width;
      const h = originalImg.naturalHeight || originalImg.height;

      // Create internal mask canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;

      let aiSuccess = false;

      if (useAI) {
        try {
          const aiBlob = await imglyRemoveBackground(imageFile, {
            progress: (key, current, total) => {
              if (total > 0) {
                const percent = Math.round((current / total) * 100);
                setAiProgress(`AI Segmentation: ${percent}%`);
              }
            },
            model: 'isnet_quint8', // fast quantized client-side neural model
          });

          const aiImg = await loadImage(URL.createObjectURL(aiBlob));
          maskCtx.drawImage(aiImg, 0, 0, w, h);
          aiSuccess = true;
        } catch (aiErr) {
          console.warn('AI Model fallback to high-precision perimeter flood-fill algorithm:', aiErr);
        }
      }

      if (!aiSuccess) {
        // High-precision edge & perimeter flood fill fallback
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
        tempCtx.drawImage(originalImg, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample perimeter pixels (top, bottom, left, right edges)
        const borderPixels: [number, number, number][] = [];
        const step = Math.max(1, Math.floor((w + h) / 100));

        for (let x = 0; x < w; x += step) {
          const topIdx = (x) * 4;
          const botIdx = ((h - 1) * w + x) * 4;
          borderPixels.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
          borderPixels.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
        }
        for (let y = 0; y < h; y += step) {
          const leftIdx = (y * w) * 4;
          const rightIdx = (y * w + (w - 1)) * 4;
          borderPixels.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
          borderPixels.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
        }

        // Calculate average background color from border samples
        let avgR = 0, avgG = 0, avgB = 0;
        borderPixels.forEach(([r, g, b]) => {
          avgR += r;
          avgG += g;
          avgB += b;
        });
        avgR /= borderPixels.length;
        avgG /= borderPixels.length;
        avgB /= borderPixels.length;

        // Create initial mask with soft edge transition
        const maskData = maskCtx.createImageData(w, h);
        const md = maskData.data;

        const maxTol = tolerance * 2.5;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Color distance to perimeter background
          const dist = Math.sqrt(
            Math.pow(r - avgR, 2) +
            Math.pow(g - avgG, 2) +
            Math.pow(b - avgB, 2)
          );

          if (dist < maxTol) {
            // Soft transition
            const alpha = Math.min(255, Math.max(0, Math.round(((dist / maxTol) ** 2) * 255)));
            md[i] = r;
            md[i + 1] = g;
            md[i + 2] = b;
            md[i + 3] = alpha;
          } else {
            md[i] = r;
            md[i + 1] = g;
            md[i + 2] = b;
            md[i + 3] = 255;
          }
        }

        maskCtx.putImageData(maskData, 0, 0);
      }

      maskCanvasRef.current = maskCanvas;
      renderComposite();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAI(false);
      setAiProgress('');
    }
  }, [imageFile, tolerance]);

  // Render composite display canvas with current background setting
  const renderComposite = useCallback(() => {
    if (!displayCanvasRef.current || !originalImageRef.current || !maskCanvasRef.current) return;

    const displayCanvas = displayCanvasRef.current;
    const w = originalImageRef.current.naturalWidth || originalImageRef.current.width;
    const h = originalImageRef.current.naturalHeight || originalImageRef.current.height;

    displayCanvas.width = w;
    displayCanvas.height = h;
    const ctx = displayCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);

    if (showOriginal) {
      ctx.drawImage(originalImageRef.current, 0, 0);
      return;
    }

    // 1. Draw chosen background
    if (bgMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'offwhite') {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'blue') {
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'custom') {
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw extracted foreground using mask
    ctx.drawImage(maskCanvasRef.current, 0, 0);
  }, [bgMode, customColor, showOriginal]);

  useEffect(() => {
    runSmartRemoval(true);
  }, [runSmartRemoval]);

  useEffect(() => {
    renderComposite();
  }, [renderComposite]);

  // Interactive Brush: Eraser & Restore
  const handleBrushStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || activeTool === 'none' || activeTool === 'picker' || !maskCanvasRef.current || !originalImageRef.current || !displayCanvasRef.current) return;

    const rect = displayCanvasRef.current.getBoundingClientRect();
    const scaleX = maskCanvasRef.current.width / rect.width;
    const scaleY = maskCanvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const maskCtx = maskCanvasRef.current.getContext('2d')!;
    maskCtx.save();

    if (activeTool === 'eraser') {
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize * (scaleX / zoom), 0, Math.PI * 2);
      maskCtx.fill();
    } else if (activeTool === 'restore') {
      // Draw from original image inside brush radius
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.save();
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize * (scaleX / zoom), 0, Math.PI * 2);
      maskCtx.clip();
      maskCtx.drawImage(originalImageRef.current, 0, 0);
      maskCtx.restore();
    }

    maskCtx.restore();
    renderComposite();
  };

  // Color Eyedropper on image
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'picker' || !maskCanvasRef.current || !originalImageRef.current || !displayCanvasRef.current) return;

    const rect = displayCanvasRef.current.getBoundingClientRect();
    const scaleX = originalImageRef.current.naturalWidth / rect.width;
    const scaleY = originalImageRef.current.naturalHeight / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImageRef.current.naturalWidth;
    tempCanvas.height = originalImageRef.current.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(originalImageRef.current, 0, 0);

    const p = tempCtx.getImageData(clickX, clickY, 1, 1).data;
    const targetR = p[0], targetG = p[1], targetB = p[2];

    // Remove matching color regions
    const maskCtx = maskCanvasRef.current.getContext('2d')!;
    const maskData = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    const md = maskData.data;

    const maxDist = tolerance * 2.5;

    for (let i = 0; i < md.length; i += 4) {
      if (md[i + 3] === 0) continue;
      const r = md[i];
      const g = md[i + 1];
      const b = md[i + 2];

      const dist = Math.sqrt(
        Math.pow(r - targetR, 2) +
        Math.pow(g - targetG, 2) +
        Math.pow(b - targetB, 2)
      );

      if (dist < maxDist) {
        md[i + 3] = 0;
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
    renderComposite();
    setActiveTool('none');
  };

  const handleApplyResult = () => {
    if (!displayCanvasRef.current) return;
    displayCanvasRef.current.toBlob((blob) => {
      if (blob) {
        onApply(blob, bgMode === 'offwhite' || bgMode === 'blue' ? 'custom' : bgMode, bgMode === 'offwhite' ? '#F8FAFC' : bgMode === 'blue' ? '#38BDF8' : customColor);
      }
    }, 'image/png');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-card">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-pink-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>AI Background Remover Studio</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700">
                Neural AI
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Automatic foreground segmentation, transparent PNG export, and background replacement
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => runSmartRemoval(true)}
            disabled={isProcessingAI}
            className="px-3 py-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessingAI ? 'animate-spin' : ''}`} />
            <span>Re-run AI Segmentation</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="relative w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 checkerboard-pattern select-none shadow-inner mb-6">
        
        {/* Loading Spinner during AI processing */}
        {isProcessingAI && (
          <div className="absolute inset-0 z-20 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6">
            <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin mb-3" />
            <h4 className="text-base font-bold mb-1">AI Subject Isolation in Progress</h4>
            <p className="text-xs text-slate-300">{aiProgress || 'Analyzing pixels with neural edge detection...'}</p>
          </div>
        )}

        {/* Display Canvas */}
        <canvas
          ref={displayCanvasRef}
          onMouseDown={(e) => {
            isDrawing.current = true;
            handleBrushStroke(e);
          }}
          onMouseMove={handleBrushStroke}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
          onClick={handleCanvasClick}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out' }}
          className={`max-h-full max-w-full object-contain ${
            activeTool === 'eraser' ? 'cursor-crosshair' : activeTool === 'restore' ? 'cursor-cell' : activeTool === 'picker' ? 'cursor-pointer' : 'cursor-default'
          }`}
        />

        {/* View Controls Toolbar (Overlay at top-right) */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-xs">
          <button
            type="button"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            className="px-2.5 py-1 rounded-lg font-bold text-slate-700 hover:bg-slate-100 flex items-center space-x-1"
            title="Hold to see original photo"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Hold for Original</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-200" />

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono px-1 font-bold">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Panel: Background Selection & Touch-Up Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        
        {/* Left: Background Options */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-fuchsia-600" />
            <span>New Background Setting</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'transparent', label: 'Transparent PNG', color: 'transparent', pattern: true },
              { key: 'white', label: 'Pure White (e-Commerce)', color: '#ffffff' },
              { key: 'offwhite', label: 'Off-White Studio', color: '#f8fafc' },
              { key: 'blue', label: 'Light Blue', color: '#38bdf8' },
              { key: 'custom', label: 'Custom Color', color: customColor },
            ].map((bg) => (
              <button
                key={bg.key}
                type="button"
                onClick={() => setBgMode(bg.key as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
                  bgMode === bg.key
                    ? 'border-fuchsia-600 bg-white text-fuchsia-900 shadow-sm ring-2 ring-fuchsia-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border border-slate-300 ${bg.pattern ? 'checkerboard-pattern' : ''}`}
                  style={{ backgroundColor: bg.pattern ? undefined : bg.color }}
                />
                <span>{bg.label}</span>
              </button>
            ))}
          </div>

          {bgMode === 'custom' && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">Pick any custom branding hex</span>
            </div>
          )}
        </div>

        {/* Right: Manual Touch-Up Brush Tools */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Manual Touch-Up & Refine</span>
          </label>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                activeTool === 'eraser'
                  ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Erase Stray Pixels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'restore' ? 'none' : 'restore')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                activeTool === 'restore'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Restore Foreground</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool(activeTool === 'picker' ? 'none' : 'picker')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                activeTool === 'picker'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
              title="Click anywhere on the preview image to remove that color"
            >
              <Pipette className="w-3.5 h-3.5" />
              <span>Color Eyedropper</span>
            </button>
          </div>

          {(activeTool === 'eraser' || activeTool === 'restore') && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Brush Size: {brushSize}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
              />
            </div>
          )}

          {activeTool === 'picker' && (
            <p className="text-[11px] text-indigo-600 font-medium pt-1">
              👉 Click on any background color in the canvas preview above to erase all matching areas.
            </p>
          )}
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleApplyResult}
          disabled={isProcessingAI}
          className="px-7 py-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-fuchsia-600/25 transition-all flex items-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>Apply & Download Cutout</span>
        </button>
      </div>

    </div>
  );
};
