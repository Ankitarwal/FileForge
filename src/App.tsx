import React, { useState, useEffect } from 'react';
import { TOOLS_DATA } from './data/toolsData';
import { ToolItem, UserProfile, HistoryItem } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { PrivacySecurity } from './components/PrivacySecurity';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { IndividualToolPage } from './components/IndividualToolPage';
import { AuthModal, AuthModalView } from './components/AuthModal';
import { DashboardModal } from './components/DashboardModal';
import { SearchModal } from './components/SearchModal';
import { getFileExtension } from './utils/fileUtils';
import { AuthProvider, useAuth } from './context/AuthContext';

function FileForgeContent() {
  const { user, profile, signOut, updateProfileStats } = useAuth();

  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'image' | 'pdf' | 'convert' | 'compress' | 'edit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [authModalMode, setAuthModalMode] = useState<AuthModalView | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Conversion History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('fileforge_conversion_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'h-1',
          toolId: 'image-compressor',
          toolName: 'Image Compressor',
          fileName: 'sample_photo_compressed.jpg',
          timestamp: Date.now() - 1000 * 60 * 30,
          originalSize: 4200000,
          processedSize: 780000,
          status: 'success',
        }
      ];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fileforge_conversion_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // URL hash sync for direct links & protected routes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash === 'verify-email') {
        setAuthModalMode('verify_email');
      } else if (hash === 'reset-password' || hash.includes('type=recovery') || window.location.search.includes('type=recovery') || hash.includes('type=recovery')) {
        setAuthModalMode('reset_password');
      } else if (hash === 'login') {
        setAuthModalMode('login');
      } else if (hash === 'signup') {
        setAuthModalMode('signup');
      } else if (hash === 'dashboard') {
        if (user) {
          setIsDashboardOpen(true);
        } else {
          setAuthModalMode('login');
        }
      } else if (hash.startsWith('tool/')) {
        const slug = hash.replace('tool/', '');
        const found = TOOLS_DATA.find((t) => t.slug === slug || t.id === slug);
        if (found) {
          setActiveToolId(found.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === 'image-tools') {
        setSelectedCategory('image');
        setActiveToolId(null);
      } else if (hash === 'pdf-tools') {
        setSelectedCategory('pdf');
        setActiveToolId(null);
      } else if (hash === 'pricing') {
        setActiveToolId(null);
        setTimeout(() => {
          document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (!hash) {
        setActiveToolId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // Open specific tool and update hash
  const handleOpenTool = (toolId: string) => {
    const tool = TOOLS_DATA.find((t) => t.id === toolId);
    if (tool) {
      setActiveToolId(tool.id);
      window.location.hash = `tool/${tool.slug}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back to home
  const handleNavigateHome = () => {
    setActiveToolId(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select category
  const handleSelectCategory = (cat: 'all' | 'image' | 'pdf' | 'convert' | 'compress' | 'edit') => {
    setActiveToolId(null);
    setSelectedCategory(cat);
    window.location.hash = '';
    setTimeout(() => {
      document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Auto-route dropped files from hero
  const handleHeroFilesDropped = (droppedFiles: File[]) => {
    if (droppedFiles.length === 0) return;
    const firstFile = droppedFiles[0];
    const ext = getFileExtension(firstFile.name);

    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp'].includes(ext)) {
      if (droppedFiles.length > 1) {
        handleOpenTool('multiple-images-to-pdf');
      } else {
        handleOpenTool('image-compressor');
      }
    } else if (ext === 'pdf') {
      if (droppedFiles.length > 1) {
        handleOpenTool('merge-pdf');
      } else {
        handleOpenTool('pdf-compressor');
      }
    } else {
      handleOpenTool('pdf-to-word');
    }
  };

  // Protected Dashboard Navigation
  const handleOpenDashboard = () => {
    if (user) {
      setIsDashboardOpen(true);
    } else {
      setAuthModalMode('login');
    }
  };

  const handleRecordHistory = (item: {
    toolId: string;
    toolName: string;
    fileName: string;
    originalSize: number;
    processedSize: number;
  }) => {
    const newItem: HistoryItem = {
      id: `h-${Date.now()}`,
      toolId: item.toolId,
      toolName: item.toolName,
      fileName: item.fileName,
      timestamp: Date.now(),
      originalSize: item.originalSize,
      processedSize: item.processedSize,
      status: 'success',
    };

    setHistory((prev) => [newItem, ...prev]);

    // Update Supabase profile stats
    const savedBytesDelta = Math.max(0, item.originalSize - item.processedSize);
    updateProfileStats({ filesProcessed: 1, savedBytes: savedBytesDelta });
  };

  const currentActiveTool = TOOLS_DATA.find((t) => t.id === activeToolId);

  // Active user profile view for UI
  const displayUserProfile: UserProfile | null = profile || (user ? {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    plan: 'pro',
    monthlyUsage: 1,
    filesProcessed: history.length,
    savedBytes: history.reduce((acc, h) => acc + Math.max(0, h.originalSize - h.processedSize), 0),
    emailVerified: !!user.email_confirmed_at,
  } : null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Sticky Navbar with Supabase Auth */}
      <Navbar
        onNavigateHome={handleNavigateHome}
        onSelectCategory={(c) => handleSelectCategory(c as any)}
        onSelectTool={handleOpenTool}
        onOpenPricing={() => {
          setActiveToolId(null);
          setTimeout(() => {
            document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenAbout={() => {
          setActiveToolId(null);
          setTimeout(() => {
            document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onOpenDashboard={handleOpenDashboard}
        user={displayUserProfile}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentActiveTool ? (
          /* Dedicated Tool Page */
          <IndividualToolPage
            tool={currentActiveTool}
            onBack={handleNavigateHome}
            onRecordHistory={handleRecordHistory}
          />
        ) : (
          /* HOMEPAGE LAYOUT:
             Hero -> Popular Tools -> Image Tools -> PDF Tools -> Why FileForge -> How It Works -> Privacy & Security -> Pricing -> FAQ -> CTA -> Footer
          */
          <div>
            {/* Hero Section */}
            <Hero
              onExploreImages={() => handleSelectCategory('image')}
              onExplorePdf={() => handleSelectCategory('pdf')}
              onFilesDropped={handleHeroFilesDropped}
            />

            {/* Popular, Image & PDF Tools Section with Search & Filters */}
            <ToolGrid
              tools={TOOLS_DATA}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenTool={handleOpenTool}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Why Choose FileForge? */}
            <WhyChooseUs />

            {/* How It Works (3 Steps) */}
            <HowItWorks />

            {/* Privacy & Security ("Your Files Stay Private") */}
            <PrivacySecurity />

            {/* Pricing Section (Free vs Pro) */}
            <PricingSection onSelectPlan={(plan) => setAuthModalMode('signup')} />

            {/* FAQ Accordion Section */}
            <FAQSection />

            {/* Final CTA Banner */}
            <CtaSection onExploreTools={() => handleSelectCategory('all')} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(c) => handleSelectCategory(c as any)}
        onSelectTool={handleOpenTool}
        onOpenPricing={() => {
          setActiveToolId(null);
          setTimeout(() => {
            document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenAbout={() => {
          setActiveToolId(null);
          setTimeout(() => {
            document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Supabase Auth Modal (Signup, Email OTP Verification, Login, Forgot Password, Reset Password) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => {
            setAuthModalMode(null);
            if (window.location.hash === '#verify-email' || window.location.hash === '#reset-password' || window.location.hash === '#login' || window.location.hash === '#signup') {
              window.location.hash = '';
            }
          }}
          onSuccess={() => {
            setAuthModalMode(null);
            window.location.hash = '';
          }}
        />
      )}

      {/* Protected User Dashboard Modal */}
      {isDashboardOpen && displayUserProfile && (
        <DashboardModal
          user={displayUserProfile}
          onClose={() => {
            setIsDashboardOpen(false);
            if (window.location.hash === '#dashboard') {
              window.location.hash = '';
            }
          }}
          onLogout={async () => {
            await signOut();
            setIsDashboardOpen(false);
            window.location.hash = '';
          }}
          onOpenTool={handleOpenTool}
          recentHistory={history}
          tools={TOOLS_DATA}
        />
      )}

      {/* ⌘K Spotlight Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        tools={TOOLS_DATA}
        onSelectTool={handleOpenTool}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <FileForgeContent />
    </AuthProvider>
  );
}
