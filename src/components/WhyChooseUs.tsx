import React from 'react';
import { Zap, ShieldCheck, Cpu, Smartphone, Layers, CheckCircle } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Client-Side Privacy',
      desc: 'Most tasks run directly inside your browser with WebAssembly & Canvas. Your sensitive files never leave your computer.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Zap,
      title: 'Blazing Fast Performance',
      desc: 'Zero server queue delays. Instant transformations, compressions, and conversions in milliseconds.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Cpu,
      title: '30+ Specialized Tools',
      desc: 'From passport photo resize to PDF OCR, redaction, and next-gen AVIF conversion — all under one unified roof.',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: Smartphone,
      title: 'Flawless Mobile Experience',
      desc: 'Fully optimized for iOS Safari and Android Chrome. Edit, resize, and convert camera photos on the go.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Layers,
      title: 'Zero Software Installation',
      desc: 'No heavy desktop software, plugins, or driver installations. Accessible anywhere with a modern web browser.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: CheckCircle,
      title: 'High-Fidelity Output',
      desc: 'Perceptual quantization algorithms preserve crystal-clear text, sharp vector graphics, and vibrant color gamuts.',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-100/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Why Choose FileForge
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
            Engineered for Speed, Privacy & Precision
          </h2>
          <p className="text-base text-slate-600">
            Experience an image and PDF suite that respects your privacy and works without limitations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-subtle hover:shadow-card-hover transition-all duration-200 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} text-white flex items-center justify-center shadow-md shadow-slate-200 mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
