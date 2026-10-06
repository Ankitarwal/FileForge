import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface CtaSectionProps {
  onExploreTools: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onExploreTools }) => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white relative overflow-hidden">
      
      {/* Background radial shapes */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-6 border border-white/15 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Transform Files In Seconds</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Ready to supercharge your Image & PDF workflow?
        </h2>

        <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of creators, professionals, and students who rely on FileForge every day for fast, private, and effortless document transformations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreTools}
            className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-base rounded-2xl shadow-xl shadow-black/20 hover:scale-105 transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Start Processing Now — It's Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-xs text-indigo-200/80 mt-6 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>No credit card required • 100% private • Instant browser execution</span>
        </p>

      </div>
    </section>
  );
};
