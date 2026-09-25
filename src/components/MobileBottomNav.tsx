import React, { useState } from 'react';
import {
  Sliders,
  Eye,
  FileText,
  Sparkles,
  Menu,
  X,
  Download,
  Globe2,
  Trash2,
  Lightbulb,
  LayoutTemplate,
} from 'lucide-react';
import { ViewMode } from './Navbar';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onStartBlank?: () => void;
  onLoadDemo?: () => void;
  onOpenTemplates?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  onSelectViewMode,
  onStartBlank,
  onLoadDemo,
  onOpenTemplates,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isEditActive = viewMode === 'editor' || viewMode === 'split';
  const isPreviewActive = viewMode === 'preview';
  const isResumeActive = viewMode === 'resume';

  return (
    <>
      {/* MOBILE BOTTOM SLIDE-UP ACTION SHEET / DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sheet Modal */}
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  F
                </div>
                <h3 className="text-sm font-bold text-white">More Tools & Options</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean, Non-Redundant Action Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {onOpenTemplates && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenTemplates();
                  }}
                  className="p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 col-span-2"
                >
                  <LayoutTemplate className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-blue-300">Templates Gallery •</span>
                  <span className="text-[10px] text-slate-400 font-normal">Choose & preview multiple field-tested layouts</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectViewMode('export');
                }}
                className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download as PDF</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectViewMode('seo');
                }}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>Social SEO Card</span>
              </button>
            </div>

            {/* Quick Presets Reset */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Canvas Setup
              </div>
              <div className="flex gap-2">
                {onStartBlank && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onStartBlank();
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>✨ Blank Canvas</span>
                  </button>
                )}
                {onLoadDemo && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLoadDemo();
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>💡 Load Sample</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-2xl">
        {/* EDIT BUTTON */}
        <button
          type="button"
          onClick={() => onSelectViewMode('editor')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isEditActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Edit</span>
        </button>

        {/* PREVIEW BUTTON */}
        <button
          type="button"
          onClick={() => onSelectViewMode('preview')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isPreviewActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Preview</span>
        </button>

        {/* TEMPLATES BUTTON */}
        {onOpenTemplates ? (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex-1 py-1 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer text-slate-200 hover:text-white bg-slate-900 border border-slate-800"
          >
            <LayoutTemplate className="w-4 h-4 mb-0.5 text-blue-400" />
            <span className="text-[10px] font-semibold">Templates</span>
          </button>
        ) : null}

        {/* RESUME BUTTON (Emphasized) */}
        <button
          type="button"
          onClick={() => onSelectViewMode('resume')}
          className={`flex-1 py-1 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
            isResumeActive
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-200 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FileText className={`w-4 h-4 mb-0.5 ${isResumeActive ? 'text-white' : 'text-blue-400'}`} />
          <span className="text-[10px]">Resume</span>
        </button>

        {/* THEMES BUTTON */}
        <button
          type="button"
          onClick={() => onSelectViewMode('themes')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
            viewMode === 'themes'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 ${viewMode === 'themes' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-[10px]">Themes</span>
        </button>

        {/* MORE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </>
  );
};
