import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Minimize2, 
  RefreshCw, 
  Menu, 
  X, 
  ChevronDown, 
  Search, 
  User, 
  Crown,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  onNavigateHome: () => void;
  onSelectCategory: (cat: 'all' | 'image' | 'pdf' | 'convert' | 'compress') => void;
  onSelectTool: (toolId: string) => void;
  onOpenPricing: () => void;
  onOpenAbout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDashboard: () => void;
  user: UserProfile | null;
  onOpenSearchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onSelectCategory,
  onSelectTool,
  onOpenPricing,
  onOpenAbout,
  onOpenAuth,
  onOpenDashboard,
  user,
  onOpenSearchModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 transition-all duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">File<span className="text-indigo-600">Forge</span></span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 tracking-wide">v2.0</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 -mt-1 hidden sm:block">Image & PDF Toolkit</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            
            {/* Image Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setImageDropdownOpen(true)}
              onMouseLeave={() => setImageDropdownOpen(false)}
            >
              <button 
                onClick={() => onSelectCategory('image')}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>Image Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {imageDropdownOpen && (
                <div className="absolute top-full left-0 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-100 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Popular Image Tools</div>
                  <button onClick={() => { onSelectTool('image-compressor'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg flex items-center justify-between">
                    <span>Image Compressor</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">Save 80%</span>
                  </button>
                  <button onClick={() => { onSelectTool('background-remover'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg flex items-center justify-between">
                    <span>Background Remover</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">AI</span>
                  </button>
                  <button onClick={() => { onSelectTool('image-resizer'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Image Resizer (Pixel / % / KB)
                  </button>
                  <button onClick={() => { onSelectTool('passport-photo-resize'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Passport / Visa Photo Maker
                  </button>
                  <button onClick={() => { onSelectTool('image-crop'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Image Crop & Frame
                  </button>
                  <button onClick={() => { onSelectTool('image-to-pdf'); setImageDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Image → PDF
                  </button>
                </div>
              )}
            </div>

            {/* PDF Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setPdfDropdownOpen(true)}
              onMouseLeave={() => setPdfDropdownOpen(false)}
            >
              <button 
                onClick={() => onSelectCategory('pdf')}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {pdfDropdownOpen && (
                <div className="absolute top-full left-0 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-100 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Popular PDF Tools</div>
                  <button onClick={() => { onSelectTool('merge-pdf'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg flex items-center justify-between">
                    <span>Merge PDF</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">Fast</span>
                  </button>
                  <button onClick={() => { onSelectTool('split-pdf'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Split PDF
                  </button>
                  <button onClick={() => { onSelectTool('pdf-compressor'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    PDF Compressor
                  </button>
                  <button onClick={() => { onSelectTool('pdf-to-word'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    PDF → Word (.docx)
                  </button>
                  <button onClick={() => { onSelectTool('pdf-ocr'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    PDF OCR (Searchable PDF)
                  </button>
                  <button onClick={() => { onSelectTool('rearrange-pdf-pages'); setPdfDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Delete & Rearrange Pages
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => onSelectCategory('compress')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-emerald-500" />
              <span>Compress</span>
            </button>

            <button 
              onClick={() => onSelectCategory('convert')}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-amber-500" />
              <span>Convert</span>
            </button>

            <button 
              onClick={onOpenPricing}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors flex items-center space-x-1"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Pricing</span>
            </button>

            <button 
              onClick={onOpenAbout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              About
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Quick Search Button */}
            <button 
              onClick={onOpenSearchModal}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 rounded-full border border-slate-200/60 transition-colors"
              title="Search tools"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Quick Search</span>
              <kbd className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>

            {user ? (
              <button 
                onClick={onOpenDashboard}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={onOpenSearchModal}
              className="p-2 text-slate-600 hover:text-indigo-600 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={() => { onSelectCategory('image'); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 p-2.5 rounded-lg bg-indigo-50/70 text-indigo-700 text-sm font-medium"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image Tools</span>
            </button>
            <button 
              onClick={() => { onSelectCategory('pdf'); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 p-2.5 rounded-lg bg-blue-50/70 text-blue-700 text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Tools</span>
            </button>
            <button 
              onClick={() => { onSelectCategory('compress'); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 p-2.5 rounded-lg bg-emerald-50/70 text-emerald-700 text-sm font-medium"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Compress</span>
            </button>
            <button 
              onClick={() => { onSelectCategory('convert'); setMobileMenuOpen(false); }}
              className="flex items-center space-x-2 p-2.5 rounded-lg bg-amber-50/70 text-amber-700 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <button 
              onClick={() => { onOpenPricing(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Pricing Plans</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </button>
            <button 
              onClick={() => { onOpenAbout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              About & Privacy
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col space-y-2">
            {user ? (
              <button 
                onClick={() => { onOpenDashboard(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Sign Up Free
                </button>
                <button 
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
