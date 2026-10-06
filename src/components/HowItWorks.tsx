import React from 'react';
import { UploadCloud, Sliders, Download, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: UploadCloud,
      title: '1. Upload',
      desc: 'Choose your image or PDF from your computer, tablet, or smartphone camera.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      step: '02',
      icon: Sliders,
      title: '2. Process',
      desc: 'Select settings, crop, compress, adjust quality or organize pages with live preview.',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      step: '03',
      icon: Download,
      title: '3. Download',
      desc: 'Download the finished file instantly or bundle multiple assets into a clean ZIP archive.',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Simple 3-Step Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
          How FileForge Works
        </h2>
        <p className="text-base text-slate-600 max-w-2xl mx-auto mb-14">
          Fast, effortless file conversions in three intuitive steps without registration barriers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting arrow for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-8 pointer-events-none text-slate-300">
            <ArrowRight className="w-8 h-8" />
          </div>
          <div className="hidden md:block absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-8 pointer-events-none text-slate-300">
            <ArrowRight className="w-8 h-8" />
          </div>

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center text-center group hover:bg-white hover:shadow-card-hover transition-all duration-200"
              >
                <span className="text-4xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors absolute top-4 right-6 select-none">
                  {s.step}
                </span>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
