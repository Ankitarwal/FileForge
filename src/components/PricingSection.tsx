import React, { useState } from 'react';
import { Check, Crown, Zap, Shield, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'free' | 'pro') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing-section" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Simple, Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
          Choose the Perfect Plan for Your Workflow
        </h2>
        <p className="text-base text-slate-600 max-w-2xl mx-auto mb-10">
          Get started for free with generous daily limits, or upgrade to Pro for unrestricted batch processing.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mb-12">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              !isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
              Save 30%
            </span>
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* FREE PLAN */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between text-left hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">For Casual Use</span>
              </div>

              <div className="flex items-baseline space-x-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">$0</span>
                <span className="text-sm font-medium text-slate-400">/ forever free</span>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Full access to all 30+ tools without registration or watermarks.
              </p>

              <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Access to all 15 Image & 18 PDF tools</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Client-side private processing</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Standard processing speed</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Up to 50MB image & 100MB PDF files</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>No software installation required</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('free')}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all"
            >
              Get Started Free
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border-2 border-indigo-500 shadow-xl flex flex-col justify-between text-left relative overflow-hidden">
            
            {/* Top Popular Ribbon */}
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wide shadow-md">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Most Popular</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-indigo-300">FileForge Pro</span>
              </div>

              <div className="flex items-baseline space-x-1 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">
                  {isAnnual ? '$7' : '$9'}
                </span>
                <span className="text-sm font-medium text-slate-400">/ month billed {isAnnual ? 'annually' : 'monthly'}</span>
              </div>

              <p className="text-xs text-indigo-200/80 mb-6">
                Supercharge your workflow with massive batch conversions, dedicated speed, and unlimited storage.
              </p>

              <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Unlimited batch uploads (up to 100 files at once)</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Max file size up to 1 GB per upload</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Ultra-fast dedicated multi-threaded rendering</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Advanced Multi-Language PDF OCR indexing</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Ad-free distraction-free workspace</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>24/7 Priority email & live chat support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('pro')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Upgrade to Pro Now</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
