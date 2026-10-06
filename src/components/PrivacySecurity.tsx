import React from 'react';
import { Lock, EyeOff, ShieldCheck, ServerCrash, Clock, FileCheck } from 'lucide-react';

export const PrivacySecurity: React.FC = () => {
  const points = [
    {
      icon: EyeOff,
      title: 'Browser-Based Local Processing',
      desc: 'Most tasks run directly inside your browser using HTML5 Canvas & WebAssembly. Your files never get uploaded to the cloud.',
    },
    {
      icon: Clock,
      title: 'Automatic Instant Purging',
      desc: 'For any server-assisted processing, files are strictly wiped within 60 minutes or immediately upon manual download.',
    },
    {
      icon: Lock,
      title: 'End-to-End TLS Encryption',
      desc: 'All network transactions are strictly forced through 256-bit SSL/TLS HTTPS encryption tunnels.',
    },
    {
      icon: ServerCrash,
      title: 'Zero Document Logging',
      desc: 'We never read, harvest, train AI on, or inspect the private textual content of your contracts or photos.',
    },
    {
      icon: FileCheck,
      title: 'Input Sanitization',
      desc: 'Every file header and MIME signature is rigorously checked to defend against corrupted or malicious uploads.',
    },
    {
      icon: ShieldCheck,
      title: 'GDPR & CCPA Compliant',
      desc: 'Designed strictly to adhere to global privacy statutes and data protection mandates.',
    },
  ];

  return (
    <section id="privacy-section" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Bank-Grade Privacy Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your Files Stay Private
          </h2>
          <p className="text-base text-slate-400">
            We built FileForge with a privacy-first architecture. Your confidential documents, signatures, and photos belong to you alone.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-indigo-500/60 transition-all text-left group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
