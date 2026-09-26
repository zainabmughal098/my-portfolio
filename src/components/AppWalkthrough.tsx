import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Palette,
  Download,
  Laptop,
  Check,
  Rocket,
  Compass,
  Zap,
  Layers,
} from 'lucide-react';
import { ThreeCanvas } from './ThreeCanvas';

interface AppWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBlank: () => void;
  onLoadDemo: () => void;
}

interface WalkthroughStep {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  visualType: 'welcome' | 'editor' | 'templates' | 'resume' | 'preview';
}

const STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    badge: 'Welcome to FolioCraft',
    title: 'The Modern Portfolio & Resume Engine',
    headline: 'Build both a live portfolio and an ATS-ready resume from a single unified input.',
    description:
      'Say goodbye to duplicating your work across multiple tools. FolioCraft combines an interactive web portfolio with an ATS-compliant PDF resume, rendered with real-time themes and precision formatting.',
    icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    features: [
      'Single source of truth — update once, syncs everywhere',
      'Clean ghost hints ready for typing — zero boilerplate to delete',
      'Instant ATS-optimized 1-page & 2-page PDF export',
      'Curated themes for software engineers, product designers & creators',
    ],
    visualType: 'welcome',
  },
  {
    id: 'step1',
    badge: 'Step 1 • Basic Info & Details',
    title: 'Zero-Friction Basic Info Entry',
    headline: 'Fill in your name, contact, headline, bio, experience, and skills without boilerplate.',
    description:
      'Enter your basic information and career milestones. Helpful ghost placeholders guide each field without messy sample text you have to backspace away.',
    icon: <FileText className="w-4 h-4 text-cyan-400" />,
    features: [
      'Basic Info: Name, professional headline, bio, location, and social links',
      'Structured sections: Projects, Work Experience, Education, Skills, & Awards',
      'Manage multiple tailored resumes from "Your Resumes" in the top bar',
      'Continuous auto-save directly to your Serverless PostgreSQL database',
    ],
    visualType: 'editor',
  },
  {
    id: 'step2',
    badge: 'Step 2 • Choose Template & Styles',
    title: 'Curated Aesthetics & Typography',
    headline: 'Switch industry-crafted visual styles with instant live feedback.',
    description:
      'Pick from specialized themes like Tech Architect, Modern Minimalist, Creative Studio, Terminal Hacker, and Executive Slate. Customize accent colors, typography, and density in seconds.',
    icon: <Palette className="w-4 h-4 text-purple-400" />,
    features: [
      'Tailored palettes for software engineers, product designers, and managers',
      'Modern typography pairings: Inter, Plus Jakarta Sans, JetBrains Mono, Syne',
      'Harmonious dark & light contrast modes built to impress recruiters',
      'Custom layout density from compact technical grids to spacious editorials',
    ],
    visualType: 'templates',
  },
  {
    id: 'step3',
    badge: 'Step 3 • Page, Spacing & PDF',
    title: 'ATS Resume Perfection & 1-Click PDF',
    headline: 'Tightly formatted resumes engineered to pass recruiter scanners.',
    description:
      'Eliminate awkward page breaks and trailing lines. Choose between strict 1-page or expanded 2-page formats, dial in spacing density, and download a crisp vector PDF ready to apply immediately.',
    icon: <Download className="w-4 h-4 text-emerald-400" />,
    features: [
      'Strict 1-Page or 2-Page target with intelligent height warning',
      'Micro-spacing adjustments: tight, normal, or relaxed density',
      'ATS-compliant semantic text hierarchy & clean plain-text copy',
      'Direct one-click high-resolution PDF download',
    ],
    visualType: 'resume',
  },
  {
    id: 'step4',
    badge: 'Step 4 • Interactive Live Preview',
    title: 'Responsive Previews & Instant Launch',
    headline: 'Test your interactive portfolio across Desktop, Tablet, and Mobile.',
    description:
      'Experience your portfolio exactly as hiring managers and clients will. Test responsive navigation, filterable project case studies, and live contact triggers before sharing your personal link.',
    icon: <Laptop className="w-4 h-4 text-amber-400" />,
    features: [
      'Instant device switching: Desktop, iPad Tablet, and Mobile phone frames',
      'Working project modal case studies and live demo links',
      'SEO & social sharing card previews (OpenGraph & Twitter Cards)',
      'Export ready-to-host standalone HTML code anytime',
    ],
    visualType: 'preview',
  },
];

export const AppWalkthrough: React.FC<AppWalkthroughProps> = ({
  isOpen,
  onClose,
  onStartBlank,
  onLoadDemo,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === STEPS.length - 1;

  const handleDismiss = () => {
    try {
      localStorage.setItem('foliocraft_walkthrough_seen', 'true');
    } catch (e) {
      console.warn('Storage save warning', e);
    }
    onClose();
  };

  const handleStartBlankCanvas = () => {
    handleDismiss();
    onStartBlank();
  };

  const handleStartWithDemo = () => {
    handleDismiss();
    onLoadDemo();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-hidden">
      {/* Background Canvas Scene with ambient particles & orbiting geometry */}
      <ThreeCanvas currentStepIndex={currentStepIndex} />

      {/* Subtle Radial Gradient Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/80" />

      {/* Solid, stable dialog card — no tilting or box movement */}
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/60 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden max-h-[92vh] backdrop-blur-2xl z-10">
        {/* Top Header / App Status Bar */}
        <div className="border-b border-slate-800/80 px-6 sm:px-8 py-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/25">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">FolioCraft</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  Interactive Tour
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Step {currentStepIndex + 1} of {STEPS.length} &middot; {currentStep.badge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Step Switcher Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={`Go to ${step.badge}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Close / Skip button */}
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Intro & Enter Builder (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Feature highlights */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              {currentStep.icon}
              <span>{currentStep.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {currentStep.title}
            </h2>

            <p className="text-sm sm:text-base font-medium text-blue-200/90 leading-snug">
              {currentStep.headline}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Checklist of features */}
            <div className="pt-2 space-y-2">
              {currentStep.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Preview Card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
              {/* Subtle top light bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

              {currentStep.visualType === 'welcome' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Unified Engine
                    </span>
                    <span className="text-blue-400 font-bold">1 Input &rarr; 2 Outputs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3.5 rounded-xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-800/40 text-blue-300 flex flex-col items-center shadow-inner hover:border-blue-500/50 transition-colors">
                      <Laptop className="w-6 h-6 mb-1.5 text-blue-400" />
                      <span className="font-bold text-white">Live Portfolio</span>
                      <span className="text-[10px] text-blue-300/80 mt-1">Interactive Website</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-800/40 text-indigo-300 flex flex-col items-center shadow-inner hover:border-indigo-500/50 transition-colors">
                      <FileText className="w-6 h-6 mb-1.5 text-indigo-400" />
                      <span className="font-bold text-white">ATS Resume</span>
                      <span className="text-[10px] text-indigo-300/80 mt-1">1-Page PDF Ready</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                    <p className="font-semibold text-white mb-0.5">⚡ Continuous Sync</p>
                    <p className="text-slate-400">Update your details once and both your web portfolio and formatted PDF resume stay perfectly synced.</p>
                  </div>
                </div>
              )}

              {currentStep.visualType === 'editor' && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800 font-sans">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Clean Ghost Hints
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Ready to Type</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans">Full Name</span>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 italic">
                        e.g. Alex Morgan
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans">Role Title</span>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 italic">
                        e.g. Senior Software Engineer
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-[11px] font-sans text-blue-300">
                      💡 Click directly to type — no tedious backspacing of dummy text!
                    </div>
                  </div>
                </div>
              )}

              {currentStep.visualType === 'templates' && (
                <div className="space-y-2.5 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                    Industry Aesthetic Presets:
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-blue-500/50 text-white shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                        <span className="font-semibold">Tech Architect</span>
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono">Inter + Cyan</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        <span>Terminal Hacker</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">JetBrains Mono</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                        <span>Creative Studio</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Syne + Violet</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.visualType === 'resume' && (
                <div className="space-y-2.5 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    ATS Optimization Controls:
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Page Target:</span>
                      <div className="flex gap-1 text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold shadow-xs">1 Page</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400">2 Pages</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Spacing Density:</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">Normal (Auto-Fit)</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Recruiter ATS Score:</span>
                      <span className="text-emerald-400 font-bold">100% Machine-Readable</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.visualType === 'preview' && (
                <div className="space-y-2.5 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Cross-Device Fidelity:
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-around text-slate-300">
                    <div className="flex flex-col items-center gap-1">
                      <Laptop className="w-5 h-5 text-blue-400" />
                      <span className="text-[10px] font-medium">Desktop</span>
                    </div>
                    <div className="w-px h-7 bg-slate-800" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-5 border border-slate-400 rounded-xs flex items-center justify-center text-[9px]">
                        📱
                      </div>
                      <span className="text-[10px] font-medium">Mobile</span>
                    </div>
                    <div className="w-px h-7 bg-slate-800" />
                    <div className="flex flex-col items-center gap-1">
                      <Download className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-medium">PDF Export</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-300 text-center font-medium">
                    ✓ High-resolution print PDF + shareable link
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-400" />
                  Interactive Visual Studio
                </span>
                <span className="text-blue-400/80">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Don't show this intro automatically on open</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isFirst && (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {!isLast ? (
              <>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Skip Intro
                </button>
                <button
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              /* Final step: Launch options */
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartWithDemo}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  title="Explore with pre-filled sample portfolio"
                >
                  <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Load Sample Demo</span>
                </button>
                <button
                  onClick={handleStartBlankCanvas}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xl shadow-blue-500/25 cursor-pointer active:scale-95"
                  title="Start with fresh blank canvas with helpful placeholder hints"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Enter Builder &rarr;</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
