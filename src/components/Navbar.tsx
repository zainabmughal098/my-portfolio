import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Cloud,
  LogOut,
  User as UserIcon,
  FolderOpen,
  FileText,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { useAuth } from '../context/AuthContext.tsx';

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
  onOpenAuthModal?: () => void;
  onOpenMyResumes?: () => void;
  activeTemplateName?: string;
  onManualSave?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onSelectViewMode,
  deviceMode,
  onSelectDeviceMode,
  onOpenWalkthrough,
  onOpenAuthModal,
  onOpenMyResumes,
  onManualSave,
}) => {
  const { user, signOutUser, cloudSyncState, lastSavedAt, resumesList, activeResumeTitle } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
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
      {/* Zone 1: Logo & Brand + "Your Resumes" button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
            F
          </div>
          <span className="font-bold text-sm text-white tracking-tight hidden lg:inline">
            FolioCraft
          </span>
        </div>

        {/* PROMINENT "Your Resumes" Button */}
        <button
          onClick={onOpenMyResumes}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/90 to-indigo-950/80 hover:from-blue-900 hover:to-indigo-900 border border-blue-500/40 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-950/50 active:scale-95 group"
          title="Open your saved resumes, switch between job profiles, or create a new one"
        >
          <FolderOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-bold tracking-tight">Your Resumes</span>
          {user && resumesList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none shadow-sm">
              {resumesList.length}
            </span>
          )}
        </button>

        {/* Current Active Resume Name Tag */}
        {user && activeResumeTitle && (
          <button
            onClick={onOpenMyResumes}
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors max-w-[170px] truncate cursor-pointer"
            title={`Active resume: "${activeResumeTitle}". Click to switch or rename.`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium text-slate-200 truncate">{activeResumeTitle}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>
        )}
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

      {/* Zone 3: Cloud Sync, Auth & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
        {/* Cloud Sync Indicator */}
        {user && (
          <div
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
            title={
              cloudSyncState === 'syncing'
                ? 'Syncing changes to PostgreSQL...'
                : cloudSyncState === 'saved'
                ? `Saved to Cloud SQL at ${lastSavedAt?.toLocaleTimeString() || 'recently'}`
                : 'Synced to Cloud SQL'
            }
          >
            {cloudSyncState === 'syncing' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-medium text-slate-300">Syncing...</span>
              </>
            ) : cloudSyncState === 'error' ? (
              <button
                onClick={onManualSave}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                title="Temporary network pause. Click to retry syncing."
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-medium">Retry Sync</span>
              </button>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium text-slate-300">Cloud Synced</span>
              </>
            )}
          </div>
        )}

        {/* User Account / Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white transition-all cursor-pointer"
              title={`Logged in as ${user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-blue-500/40"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden sm:inline max-w-[90px] truncate text-[11px] font-medium">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs text-slate-300 animate-in fade-in duration-150"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
                  <div className="font-bold text-white truncate">
                    {user.displayName || 'Signed In'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenMyResumes) onOpenMyResumes();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-950/60 hover:text-blue-300 transition-colors flex items-center gap-2 cursor-pointer font-medium mb-1"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Your Resumes ({resumesList.length})</span>
                </button>

                {onManualSave && (
                  <button
                    onClick={onManualSave}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-950/60 hover:text-blue-300 transition-colors flex items-center gap-2 cursor-pointer font-medium mb-1"
                  >
                    <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    <span>Save to Cloud SQL</span>
                  </button>
                )}

                <button
                  onClick={() => signOutUser()}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 hover:text-rose-300 text-rose-400 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Sign in with Google to protect & sync your resume"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

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
