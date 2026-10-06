import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProgressBarProps {
  status: ProcessingState;
  customMessage?: string;
  progressPercent?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  status,
  customMessage,
  progressPercent = 50,
}) => {
  const steps: { key: ProcessingState; label: string }[] = [
    { key: 'uploading', label: 'Uploading' },
    { key: 'processing', label: 'Processing' },
    { key: 'optimizing', label: 'Optimizing' },
    { key: 'finalizing', label: 'Finalizing' },
    { key: 'completed', label: 'Complete' },
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'uploading':
        return 0;
      case 'processing':
        return 1;
      case 'optimizing':
        return 2;
      case 'finalizing':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-card text-center animate-in fade-in zoom-in-95 duration-200">
      
      {/* Animated Icon Spinner */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        {status === 'completed' ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        ) : (
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-1">
        {customMessage || (status === 'completed' ? 'Processing Complete!' : 'Processing your file...')}
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Please wait while FileForge executes high-speed optimizations
      </p>

      {/* Step Indicators */}
      <div className="relative flex items-center justify-between mb-4 px-2">
        {/* Track Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 88}%` }}
        />

        {steps.map((s, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={s.key} className="flex flex-col items-center z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                  isDone
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                    : 'bg-white border border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[11px] font-medium mt-1.5 transition-colors ${
                  isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress percentage bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-4">
        <div
          className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${status === 'completed' ? 100 : Math.max(25, progressPercent)}%` }}
        />
      </div>
    </div>
  );
};
