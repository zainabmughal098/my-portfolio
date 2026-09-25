import React from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Monitor,
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
  activeTemplateName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onSelectViewMode,
  deviceMode,
  onSelectDeviceMode,
}) => {
  return (
    <header className="no-print h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between text-xs text-slate-300 select-none z-30">
      {/* Zone 1: Logo & Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
          F
        </div>
        <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
          FolioCraft
        </span>
      </div>

      {/* Zone 2: Sequential 4-Step Workflow (Details -> Template -> Page & Spacing -> Preview) */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {/* Step 1: Enter Details */}
          <button
            onClick={() => onSelectViewMode('editor')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'editor'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 1: Enter your personal bio, experience, education, skills & projects"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                viewMode === 'editor' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">1. Enter Details</span>
            <span className="sm:hidden">Details</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1">&rarr;</span>

          {/* Step 2: Choose Template & Themes */}
          <button
            onClick={() => onSelectViewMode('themes')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'themes'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 2: Choose your industry template, accent colors, and typography"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                viewMode === 'themes' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">2. Template</span>
            <span className="sm:hidden">Template</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1">&rarr;</span>

          {/* Step 3: Page, Spacing & Download */}
          <button
            onClick={() => onSelectViewMode('resume')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'resume'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 3: Choose 1 Page / 2 Pages, adjust compact/normal spacing & download PDF"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                viewMode === 'resume' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">3. Page, Spacing & Download</span>
            <span className="sm:hidden">Spacing & PDF</span>
          </button>

          <span className="text-slate-700 px-0.5 sm:px-1">&rarr;</span>

          {/* Step 4: Preview */}
          <button
            onClick={() => onSelectViewMode('preview')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Step 4: Interactive Live Portfolio Preview"
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                viewMode === 'preview' ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
              }`}
            >
              4
            </span>
            <span className="hidden sm:inline">4. Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>
        </div>

        {/* Device Switcher (shown when in Step 4 Preview) */}
        {viewMode === 'preview' && (
          <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
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

      {/* Zone 3: Direct Download PDF Action (only shown if not already in Step 3 where toolbar has it) */}
      <div className="flex items-center gap-2">
        {viewMode !== 'resume' && (
          <button
            onClick={() => onSelectViewMode('resume')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm text-xs cursor-pointer active:scale-95"
            title="Jump to Step 3: Page, Spacing & PDF Download"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        )}
      </div>
    </header>
  );
};
