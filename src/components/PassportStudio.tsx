import React, { useState } from 'react';
import { UserCheck, Sparkles, Printer, Sliders, Check } from 'lucide-react';
import { PassportOptions } from '../services/imageProcessing';

interface PassportStudioProps {
  imageSrc: string;
  onGenerate: (options: PassportOptions) => void;
  onCancel: () => void;
}

export const PassportStudio: React.FC<PassportStudioProps> = ({
  imageSrc,
  onGenerate,
  onCancel,
}) => {
  const [preset, setPreset] = useState<'us-passport' | 'eu-visa' | 'id-card' | 'custom'>('us-passport');
  const [widthMm, setWidthMm] = useState(51); // 2 inch
  const [heightMm, setHeightMm] = useState(51);
  const [dpi, setDpi] = useState(300);
  const [bgColor, setBgColor] = useState<'original' | 'white' | 'offwhite' | 'blue' | 'transparent'>('white');
  const [createPrintSheet, setCreatePrintSheet] = useState(true);
  const [showFaceGuide, setShowFaceGuide] = useState(true);

  const handlePresetSelect = (type: 'us-passport' | 'eu-visa' | 'id-card' | 'custom') => {
    setPreset(type);
    if (type === 'us-passport') {
      setWidthMm(50.8);
      setHeightMm(50.8);
    } else if (type === 'eu-visa') {
      setWidthMm(35);
      setHeightMm(45);
    } else if (type === 'id-card') {
      setWidthMm(30);
      setHeightMm(40);
    }
  };

  const handleApply = () => {
    onGenerate({
      preset,
      widthMm,
      heightMm,
      dpi,
      bgColor,
      createPrintSheet,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Passport & Visa Photo Studio</h3>
            <p className="text-xs text-slate-500">Create official government-compliant photos with printable sheets</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Official Presets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Face Guide Preview */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl relative overflow-hidden min-h-[300px]">
          <img
            src={imageSrc}
            alt="Passport Target"
            className="max-h-64 max-w-full object-contain"
          />

          {/* Biometrics Face Positioning Guide Overlay */}
          {showFaceGuide && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Head Oval outline */}
              <div className="w-32 h-44 border-2 border-dashed border-emerald-400/80 rounded-[50%] flex flex-col items-center justify-center relative">
                {/* Eye level line */}
                <div className="w-full border-t border-emerald-400/70 absolute top-16" />
                {/* Chin level line */}
                <div className="w-full border-t border-emerald-400/70 absolute bottom-5" />
                <span className="text-[9px] text-emerald-300 font-bold bg-slate-900/80 px-1 rounded absolute -top-3">
                  TOP OF HEAD
                </span>
                <span className="text-[9px] text-emerald-300 font-bold bg-slate-900/80 px-1 rounded absolute top-14">
                  EYE LEVEL
                </span>
                <span className="text-[9px] text-emerald-300 font-bold bg-slate-900/80 px-1 rounded absolute bottom-2">
                  CHIN LINE
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowFaceGuide(!showFaceGuide)}
            className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-[10px] text-white rounded-lg transition-colors"
          >
            {showFaceGuide ? 'Hide Face Guide' : 'Show Face Guide'}
          </button>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-6 space-y-4 text-left">
          
          {/* Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Standard Country Presets</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('us-passport')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  preset === 'us-passport' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>US Passport / Visa</div>
                <div className="text-[10px] text-slate-500 font-normal">2 x 2 inch (51x51mm)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('eu-visa')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  preset === 'eu-visa' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>Schengen / UK / India</div>
                <div className="text-[10px] text-slate-500 font-normal">35 x 45 mm</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('id-card')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  preset === 'id-card' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>Standard ID Photo</div>
                <div className="text-[10px] text-slate-500 font-normal">30 x 40 mm</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('custom')}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  preset === 'custom' ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>Custom Dimensions</div>
                <div className="text-[10px] text-slate-500 font-normal">Custom mm & DPI</div>
              </button>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Background Color</label>
            <div className="flex items-center space-x-2">
              {[
                { key: 'white', label: 'White', color: '#ffffff' },
                { key: 'offwhite', label: 'Off-White', color: '#f8fafc' },
                { key: 'blue', label: 'Light Blue', color: '#38bdf8' },
                { key: 'original', label: 'Original', color: '#cbd5e1' },
              ].map((bg) => (
                <button
                  key={bg.key}
                  type="button"
                  onClick={() => setBgColor(bg.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    bgColor === bg.key ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: bg.color }} />
                  <span>{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Print Sheet Option */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Printer className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">4x6" Printable Sheet (6 Photos)</div>
                <div className="text-[10px] text-slate-500">Generates 6-photo print grid with cutting crosshairs</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={createPrintSheet}
              onChange={(e) => setCreatePrintSheet(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
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
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Generate Official Photos</span>
        </button>
      </div>
    </div>
  );
};
