import React, { useState } from 'react';
import {
  Sliders,
  Eye,
  FileText,
  Sparkles,
  Menu,
  X,
  Download,
  Github,
  Printer,
  Globe2,
  Share2,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import { ViewMode } from './Navbar';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onExportHtml: () => void;
  onOpenGithubSync: () => void;
  onPrint: () => void;
  onStartBlank?: () => void;
  onLoadDemo?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  onSelectViewMode,
  onExportHtml,
  onOpenGithubSync,
  onPrint,
  onStartBlank,
  onLoadDemo,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isEditActive = viewMode === 'editor' || viewMode === 'split';
  const isPreviewActive = viewMode === 'preview';
  const isResumeActive = viewMode === 'resume';
  const isThemesActive = viewMode === 'themes';

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
                <h3 className="text-sm font-bold text-white">More Actions & Tools</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExportHtml();
                }}
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Export HTML</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectViewMode('resume');
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Resume & PDF</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenGithubSync();
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex flex-col items-center justify-center gap-1.5"
              >
                <Github className="w-4 h-4 text-white" />
                <span>Link GitHub</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectViewMode('seo');
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex flex-col items-center justify-center gap-1.5"
              >
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>Social SEO</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onSelectViewMode('export');
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex flex-col items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>Export Modal</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onPrint();
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex flex-col items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Print Dialog</span>
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
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 font-medium"
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
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 font-medium"
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
          <span className="text-[10px]">Resume & PDF</span>
        </button>

        {/* THEMES BUTTON */}
        <button
          type="button"
          onClick={() => onSelectViewMode('themes')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
            isThemesActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 ${isThemesActive ? 'text-amber-400' : 'text-slate-400'}`} />
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
