import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PortfolioData } from './types/portfolio';
import { BLANK_PORTFOLIO_TEMPLATE, PRESET_PRODUCT_DESIGNER } from './data/presets';
import { Navbar, ViewMode, DeviceMode } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { TemplatesStudio } from './components/TemplatesStudio';
import { PortfolioRenderer } from './components/PortfolioRenderer';
import { DeviceFrame } from './components/DeviceFrame';
import { ExportModal } from './components/ExportModal';
import { TemplateModal } from './components/TemplateModal';
import { ResumeView } from './components/ResumeView';
import { SocialSharePreview } from './components/SocialSharePreview';
import { AppWalkthrough } from './components/AppWalkthrough';
import { AuthModal } from './components/AuthModal';
import { MyResumesModal } from './components/MyResumesModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FIELD_TEMPLATES, FieldTemplate } from './data/templates';
import { FolderOpen, Edit2, Check, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'foliocraft_portfolio_v2';

// Helper to ensure legacy placeholder dummy values are wiped to empty strings so user only sees hints
function sanitizeBlankCanvas(portfolio: PortfolioData): PortfolioData {
  const p = { ...portfolio };
  if (p.personal) {
    p.personal = { ...p.personal };
    if (p.personal.name === 'Your Name') p.personal.name = '';
    if (p.personal.roleTitle === 'Software Engineer & Designer') p.personal.roleTitle = '';
    if (p.personal.headline === 'Building thoughtful digital products, clean interfaces, and modern applications.') p.personal.headline = '';
    if (p.personal.location === 'City, Country (or Remote)') p.personal.location = '';
    if (p.personal.statusText === 'Open to new opportunities & freelance projects') p.personal.statusText = '';
    if (p.personal.bioShort?.includes('A brief 1-2 sentence introduction')) p.personal.bioShort = '';
    if (p.personal.bioLong?.includes('Write a few paragraphs about your background')) p.personal.bioLong = '';
  }
  if (p.contact?.email === 'you@example.com') {
    p.contact = { ...p.contact, email: '' };
  }
  if (p.socials?.github === 'https://github.com/your-username') {
    p.socials = { ...p.socials, github: '', linkedin: '', email: '' };
  }
  return p;
}

function PortfolioApp() {
  const {
    user,
    loading: authLoading,
    saveResumeToCloud,
    loadResumeFromCloud,
    activeResumeId,
    activeResumeTitle,
    setActiveResumeTitle,
    renameResumeInCloud,
  } = useAuth();

  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeBlankCanvas(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse cached portfolio', e);
    }
    // Default to clean blank template
    return sanitizeBlankCanvas(BLANK_PORTFOLIO_TEMPLATE);
  });

  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyResumesOpen, setIsMyResumesOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('tech-architect');

  // Inline resume rename state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState('');

  // Track if we have already loaded the user's cloud resume on initial auth
  const hasLoadedCloudRef = useRef<boolean>(false);
  const isInitialMount = useRef<boolean>(true);

  // Track login state to launch App Tour immediately after signing in
  const prevUserUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && user.uid !== prevUserUidRef.current) {
      const tourCompletedKey = `foliocraft_tour_completed_${user.uid}`;
      const hasCompleted = localStorage.getItem(tourCompletedKey);
      if (!hasCompleted) {
        // Automatically launch App Tour right after signing in!
        setIsWalkthroughOpen(true);
        setIsAuthModalOpen(false);
      }
      prevUserUidRef.current = user.uid;
    } else if (!user) {
      prevUserUidRef.current = null;
    }
  }, [user]);

  // When user logs in, automatically fetch and load their saved resume from Cloud SQL
  useEffect(() => {
    if (user && !hasLoadedCloudRef.current) {
      hasLoadedCloudRef.current = true;
      loadResumeFromCloud().then((cloudData) => {
        if (cloudData) {
          setData(cloudData);
        } else {
          // If no resume in cloud yet, save current resume to cloud
          saveResumeToCloud(data);
        }
      });
    } else if (!user) {
      hasLoadedCloudRef.current = false;
    }
  }, [user, loadResumeFromCloud, saveResumeToCloud]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [data]);

  // Debounced auto-save to Cloud SQL whenever data changes and user is signed in
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!user) return;

    const debounceTimer = setTimeout(() => {
      saveResumeToCloud(data);
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [data, user, saveResumeToCloud]);

  // Prompt sign-in on first visit if user is not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      const prompted = sessionStorage.getItem('foliocraft_auth_prompted');
      if (!prompted) {
        sessionStorage.setItem('foliocraft_auth_prompted', 'true');
        setIsAuthModalOpen(true);
      }
    }
  }, [authLoading, user]);

  const activeTemplate = FIELD_TEMPLATES.find((t) => t.id === currentTemplateId) || FIELD_TEMPLATES[0];

  const handleApplyTemplate = (template: FieldTemplate) => {
    setCurrentTemplateId(template.id);
    setData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        id: template.themePreset,
        accent: template.accent,
        fontHeading: template.fontHeading,
        borderRadius: template.borderRadius,
        layoutDensity: template.layoutDensity,
      },
      resumeConfig: {
        ...(prev.resumeConfig || {
          template: 'modern',
          pageTarget: 1,
          spacing: 'normal',
          fontSize: 'standard',
          showProjects: true,
          showEducation: true,
          showSkills: true,
          showSummary: true,
          accentColor: '#2563eb',
        }),
        template: template.resumeTemplate,
      },
    }));
  };

  const handleSelectPreset = (preset: PortfolioData) => {
    setData(preset);
  };

  const handleStartBlank = () => {
    setData(sanitizeBlankCanvas(BLANK_PORTFOLIO_TEMPLATE));
  };

  const handleLoadDemo = () => {
    setData(PRESET_PRODUCT_DESIGNER);
  };

  const handleReset = () => {
    handleStartBlank();
  };

  const handleSaveActiveTitle = async () => {
    if (!titleInputValue.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const newTitle = titleInputValue.trim();
    if (activeResumeId) {
      await renameResumeInCloud(activeResumeId, newTitle);
    } else {
      setActiveResumeTitle(newTitle);
      if (user) {
        saveResumeToCloud(data, newTitle);
      }
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentPresetId={data.id}
        onSelectPreset={handleSelectPreset}
        viewMode={viewMode}
        onSelectViewMode={(mode) => {
          if (mode === 'export') {
            setIsExportOpen(true);
          } else {
            setViewMode(mode);
          }
        }}
        deviceMode={deviceMode}
        onSelectDeviceMode={setDeviceMode}
        onReset={handleReset}
        onStartBlank={handleStartBlank}
        onLoadDemo={handleLoadDemo}
        onOpenTemplates={() => setViewMode('themes')}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenMyResumes={() => setIsMyResumesOpen(true)}
        onManualSave={() => saveResumeToCloud(data)}
        activeTemplateName={activeTemplate.name}
      />

      {/* Sub-Header: Active Resume Name & Quick Switcher */}
      <div className="no-print bg-slate-900/70 border-b border-slate-800/80 px-3 sm:px-5 py-1.5 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400 font-medium shrink-0 hidden sm:inline">Resume:</span>

          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={titleInputValue}
                onChange={(e) => setTitleInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveActiveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-950 border border-blue-500 text-white text-xs font-semibold focus:outline-none"
              />
              <button
                onClick={handleSaveActiveTitle}
                className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                title="Save name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {activeResumeTitle || 'My Portfolio Resume'}
              </span>
              <button
                onClick={() => {
                  setTitleInputValue(activeResumeTitle || '');
                  setIsEditingTitle(true);
                }}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Rename this resume"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMyResumesOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all"
            title="Manage all your resumes"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Your Resumes</span>
          </button>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* STEP 1: ENTER DETAILS */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
            <EditorPanel
              data={data}
              onChange={setData}
              onOpenResume={() => setViewMode('resume')}
              onOpenTemplates={() => setViewMode('themes')}
              onStartBlank={handleStartBlank}
              onLoadDemo={handleLoadDemo}
            />
          </div>
        )}

        {/* STEP 2: TEMPLATES & STYLES STUDIO */}
        {viewMode === 'themes' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950">
            <TemplatesStudio
              data={data}
              currentTemplateId={currentTemplateId}
              onApplyTemplate={handleApplyTemplate}
              onUpdateTheme={(updatedTheme) => setData({ ...data, theme: updatedTheme })}
              onOpenResume={() => setViewMode('resume')}
              onBackToDetails={() => setViewMode('editor')}
            />
          </div>
        )}

        {/* STEP 3: ATS RESUME, SPACING & PDF DOWNLOAD */}
        {viewMode === 'resume' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950">
            <ResumeView
              data={data}
              onChangeData={setData}
              onBack={() => setViewMode('themes')}
              onOpenTemplateGallery={() => setViewMode('themes')}
              onOpenPreview={() => setViewMode('preview')}
            />
          </div>
        )}

        {/* STEP 4: FULL PREVIEW VIEW (LIVE INTERACTIVE PORTFOLIO) */}
        {viewMode === 'preview' && (
          <div className="w-full h-full bg-slate-950 overflow-hidden">
            <DeviceFrame deviceMode={deviceMode}>
              <PortfolioRenderer data={data} isInteractive={true} />
            </DeviceFrame>
          </div>
        )}

        {/* SOCIAL SHARE & OPENGRAPH PREVIEW */}
        {viewMode === 'seo' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950 p-2 sm:p-4">
            <SocialSharePreview data={data} />
          </div>
        )}
      </div>

      {/* Unified Export / Download PDF Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={data}
        onOpenResume={() => {
          setIsExportOpen(false);
          setViewMode('resume');
        }}
      />

      {/* Interactive Template Gallery & Visual Preview Modal */}
      <TemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        currentTemplateId={currentTemplateId}
        onApplyTemplate={handleApplyTemplate}
        userData={data}
        onOpenResume={() => {
          setIsTemplatesOpen(false);
          setViewMode('resume');
        }}
      />

      {/* Interactive Onboarding Walkthrough & Product Tour */}
      <AppWalkthrough
        isOpen={isWalkthroughOpen}
        onClose={() => {
          setIsWalkthroughOpen(false);
          // Transition smoothly into Basic Info / Details editor
          setViewMode('editor');
          if (user) {
            localStorage.setItem(`foliocraft_tour_completed_${user.uid}`, 'true');
          }
        }}
        onStartBlank={() => {
          handleStartBlank();
          setIsWalkthroughOpen(false);
          setViewMode('editor');
          if (user) {
            localStorage.setItem(`foliocraft_tour_completed_${user.uid}`, 'true');
          }
        }}
        onLoadDemo={() => {
          handleLoadDemo();
          setIsWalkthroughOpen(false);
          setViewMode('editor');
          if (user) {
            localStorage.setItem(`foliocraft_tour_completed_${user.uid}`, 'true');
          }
        }}
      />

      {/* Google Login & Cloud Backup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          const guestTourSeen = localStorage.getItem('foliocraft_walkthrough_seen');
          if (!guestTourSeen) {
            setIsWalkthroughOpen(true);
          }
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Launch App Tour immediately after sign-in!
          setIsWalkthroughOpen(true);
        }}
        canDismiss={true}
      />

      {/* Multiple Resumes Manager Modal ("Your Resumes") */}
      <MyResumesModal
        isOpen={isMyResumesOpen}
        onClose={() => setIsMyResumesOpen(false)}
        currentData={data}
        onSelectResume={(selectedData, title) => {
          setData(selectedData);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioApp />
    </AuthProvider>
  );
}
