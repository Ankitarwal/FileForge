import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: 'all' | 'image' | 'pdf' | 'convert' | 'compress') => void;
  onSelectTool: (toolId: string) => void;
  onOpenPricing: () => void;
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectTool,
  onOpenPricing,
  onOpenAbout,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                File<span className="text-indigo-400">Forge</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The all-in-one browser toolkit for modern creators and professionals. Convert, compress, edit, and secure images and PDFs right on your device.
            </p>

            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Privacy Guarantee</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onSelectCategory('image')} className="hover:text-white transition-colors">
                  Image Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('pdf')} className="hover:text-white transition-colors">
                  PDF Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('compress')} className="hover:text-white transition-colors">
                  Compress Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('convert')} className="hover:text-white transition-colors">
                  Convert Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTool('image-compressor')} className="hover:text-white transition-colors">
                  Image Compressor
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTool('merge-pdf')} className="hover:text-white transition-colors">
                  Merge PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onOpenAbout} className="hover:text-white transition-colors">
                  About FileForge
                </button>
              </li>
              <li>
                <button onClick={onOpenPricing} className="hover:text-white transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-white transition-colors">
                  FAQ Center
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Product Blog (Soon)</span>
              </li>
              <li>
                <a href="mailto:support@fileforge.app" className="hover:text-white transition-colors">
                  Help & Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal & Trust</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#privacy-section" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#privacy-section" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy-section" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#privacy-section" className="hover:text-white transition-colors">
                  Security Architecture
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 FileForge. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for speed and privacy.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
