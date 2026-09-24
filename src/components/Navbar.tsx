import React from 'react';
import {
  Sparkles,
  Eye,
  Sliders,
  Download,
  Share2,
  Printer,
  Github,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  LayoutTemplate,
  FileText,
  Globe2,
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
  onExportHtml: () => void;
  onOpenGithubSync: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPresetId,
  onSelectPreset,
  viewMode,
  onSelectViewMode,
  deviceMode,
  onSelectDeviceMode,
  onExportHtml,
  onOpenGithubSync,
  onPrint,
  onReset,
}) => {
  return (
    <header className="no-print h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between text-xs text-slate-300 select-none z-30">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
            F
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            FolioCraft
          </span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Archetype / Preset switcher */}
        <div className="relative hidden sm:flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={currentPresetId}
            onChange={(e) => {
              const selected = PRESETS_LIST.find((p) => p.id === e.target.value);
              if (selected) onSelectPreset(selected);
            }}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {PRESETS_LIST.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: View modes & Device selectors */}
      <div className="flex items-center gap-2">
        {/* Workspace View Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => onSelectViewMode('split')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'split' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split Editor & Live Preview"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split</span>
          </button>
          <button
            onClick={() => onSelectViewMode('editor')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'editor' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Editor"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => onSelectViewMode('preview')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'preview' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Interactive Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => onSelectViewMode('themes')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'themes' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visual Theme Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Themes</span>
          </button>
          <button
            onClick={() => onSelectViewMode('resume')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'resume' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Choose Resume Templates, 1-Page/2-Page Options & PDF Download"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Resume & Templates</span>
          </button>
          <button
            onClick={() => onSelectViewMode('seo')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'seo' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Social Share & OpenGraph Cards"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Social SEO</span>
          </button>
        </div>

        {/* Device Switcher (active in preview or split) */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <button
              onClick={() => onSelectDeviceMode('desktop')}
              className={`p-1 rounded transition-colors ${deviceMode === 'desktop' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Desktop (1440px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceMode('tablet')}
              className={`p-1 rounded transition-colors ${deviceMode === 'tablet' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceMode('mobile')}
              className={`p-1 rounded transition-colors ${deviceMode === 'mobile' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceMode('responsive')}
              className={`p-1 rounded transition-colors ${deviceMode === 'responsive' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
              title="Fluid Full Width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Zone 3: Actions (Export HTML, GitHub Push, Print) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGithubSync}
          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
          title="Connect & Push to GitHub"
        >
          <Github className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline font-medium">Link GitHub</span>
        </button>

        <button
          onClick={onPrint}
          className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Print / Save as PDF"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectViewMode('export')}
          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
          title="Export JSON & Standalone HTML"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>

        <button
          onClick={onExportHtml}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          title="Download Standalone Single-File Website"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
};
