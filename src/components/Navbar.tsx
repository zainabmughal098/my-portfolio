import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Sliders,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  LayoutTemplate,
  FileText,
  Globe2,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { PRESETS_LIST } from '../data/presets';
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
  activeTemplateName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPreset,
  viewMode,
  onSelectViewMode,
  deviceMode,
  onSelectDeviceMode,
  onReset,
  onStartBlank,
  onLoadDemo,
  onOpenTemplates,
  activeTemplateName,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isWebPortfolioActive = viewMode === 'split' || viewMode === 'editor' || viewMode === 'preview';

  return (
    <header className="no-print h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between text-xs text-slate-300 select-none z-30">
      {/* Zone 1: Logo & Active Template Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
            F
          </div>
          <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
            FolioCraft
          </span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Current Template Pill - 1-Click to Template Studio */}
        <button
          onClick={() => {
            if (onOpenTemplates) onOpenTemplates();
            else onSelectViewMode('themes');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
          title="Click to view and switch templates"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400 hidden md:inline">Template:</span>
          <span className="font-semibold text-white truncate max-w-[130px] sm:max-w-[160px]">
            {activeTemplateName || 'Tech & Architect'}
          </span>
          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 hidden lg:inline">
            Change
          </span>
        </button>
      </div>

      {/* Zone 2: 3 Primary Studios (Desktop & Tablet) */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {/* 1. Web Portfolio Studio */}
          <button
            onClick={() => onSelectViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isWebPortfolioActive
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Edit Portfolio & View Live Web Page"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Web Portfolio</span>
          </button>

          {/* 2. Templates & Styles Studio */}
          <button
            onClick={() => onSelectViewMode('themes')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'themes'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Choose from 6 Field Templates, Colors & Fonts"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Templates & Styles</span>
          </button>

          {/* 3. Resume Studio */}
          <button
            onClick={() => onSelectViewMode('resume')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'resume'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="1-Page / 2-Page Printable Resume with Spacing & PDF"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Resume Studio</span>
          </button>
        </div>

        {/* Device Switcher (shown when working on Web Portfolio) */}
        {isWebPortfolioActive && (
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
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

      {/* Zone 3: Download PDF & More Options */}
      <div className="flex items-center gap-2">
        {/* Primary Download Action */}
        <button
          onClick={() => onSelectViewMode('export')}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm text-xs cursor-pointer active:scale-95"
          title="Export as Printable PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </button>

        {/* More Options Dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in duration-100 divide-y divide-slate-800">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Tools & Samples
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onSelectViewMode('seo');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Social Share & SEO Cards</span>
                </button>

                {onLoadDemo && (
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      onLoadDemo();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load Example Profile Data</span>
                  </button>
                )}

                {onStartBlank && (
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      onStartBlank();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Start with Blank Canvas</span>
                  </button>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onReset();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Everything to Default</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
