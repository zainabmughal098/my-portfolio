import React, { useRef, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';

export type ViewMode = 'split' | 'editor' | 'preview' | 'themes' | 'resume' | 'seo' | 'export';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile' | 'responsive';

interface NavbarProps {
  currentPresetId: string;
  onSelectPreset: (preset: PortfolioData) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  deviceMode: DeviceMode;
  onSelectDeviceMode: (mode: DeviceMode) => void;
  onReset: () => void;
  onStartBlank?: () => void;
  onLoadDemo?: () => void;
  onOpenTemplates?: () => void;
  onOpenWalkthrough?: () => void;
  activeTemplateName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onSelectViewMode,
  deviceMode,
  onSelectDeviceMode,
  onOpenWalkthrough,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active step into view on mobile so it is always fully visible
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [viewMode]);

  return (
    <header className="no-print h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 sm:px-4 flex items-center justify-between text-xs text-slate-300 select-none z-30">
      {/* Zone 1: Logo & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
          F
        </div>
        <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
          FolioCraft
        </span>
      </div>

      {/* Zone 2: Sequential 4-Step Workflow (Details -> Template -> Spacing & PDF -> Preview) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-w-0 overflow-x-auto scrollbar-none flex items-center mx-1.5 sm:mx-3 py-1 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shrink-0">
          {/* Step 1: Enter Details */}
          <button
            ref={viewMode === 'editor' ? activeStepRef : null}
            onClick={() => onSelectViewMode('editor')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'editor'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 1: Enter your personal bio, experience, education, skills & projects"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                viewMode === 'editor' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">1. Enter Details</span>
            <span className="sm:hidden">Details</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1 shrink-0">&rarr;</span>

          {/* Step 2: Choose Template & Themes */}
          <button
            ref={viewMode === 'themes' ? activeStepRef : null}
            onClick={() => onSelectViewMode('themes')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'themes'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 2: Choose your industry template, accent colors, and typography"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                viewMode === 'themes' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">2. Template</span>
            <span className="sm:hidden">Template</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1 shrink-0">&rarr;</span>

          {/* Step 3: Page, Spacing & Download */}
          <button
            ref={viewMode === 'resume' ? activeStepRef : null}
            onClick={() => onSelectViewMode('resume')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'resume'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 3: Choose 1 Page / 2 Pages, adjust compact/normal spacing & download PDF"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                viewMode === 'resume' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">3. Page, Spacing & Download</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1 shrink-0">&rarr;</span>

          {/* Step 4: Preview */}
          <button
            ref={viewMode === 'preview' ? activeStepRef : null}
            onClick={() => onSelectViewMode('preview')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 4: Interactive Live Portfolio Preview"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                viewMode === 'preview' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              4
            </span>
            <span className="hidden sm:inline">4. Preview</span>
            <span className="sm:hidden font-semibold">Preview</span>
          </button>
        </div>

        {/* Device Switcher (shown when in Step 4 Preview on large screen) */}
        {viewMode === 'preview' && (
          <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 ml-2 shrink-0">
            <button
              onClick={() => onSelectDeviceMode('desktop')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${deviceMode === 'desktop' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceMode('tablet')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${deviceMode === 'tablet' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceMode('mobile')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${deviceMode === 'mobile' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Zone 3: App Tour & Direct Download PDF Action */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onOpenWalkthrough && (
          <button
            onClick={onOpenWalkthrough}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-white border border-blue-800/60 hover:border-blue-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs shrink-0"
            title="App Tour & Feature Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">App Tour</span>
          </button>
        )}

        {viewMode !== 'resume' && (
          <button
            onClick={() => onSelectViewMode('resume')}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm text-xs cursor-pointer active:scale-95 shrink-0"
            title="Jump to Step 3: Page, Spacing & PDF Download"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        )}
      </div>
    </header>
  );
};
