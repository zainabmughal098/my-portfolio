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
import { SharePreviewModal } from './components/SharePreviewModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FIELD_TEMPLATES, FieldTemplate } from './data/templates';
import { FolderOpen, Edit2, Check, Sparkles, Share2, Eye, ExternalLink, Loader2 } from 'lucide-react';

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
    setActiveResumeId,
    activeResumeTitle,
    setActiveResumeTitle,
    renameResumeInCloud,
  } = useAuth();

  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasUrlParams = Boolean(
        params.get('id') || params.get('view') === 'preview' || params.get('view') === 'resume'
      );
      // If URL parameters indicate standalone preview or shared ID, do NOT prioritize stale local storage
      if (!hasUrlParams) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return sanitizeBlankCanvas(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached portfolio', e);
    }
    // Default to clean blank template while shared data is fetched
    return sanitizeBlankCanvas(BLANK_PORTFOLIO_TEMPLATE);
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView === 'preview' || urlView === 'resume' || urlView === 'themes' || urlView === 'editor') {
        return urlView as ViewMode;
      }
    } catch {
      // Ignore
    }
    return 'editor';
  });

  // Check if opened as standalone preview (?view=preview or ?view=resume)
  const [isStandalonePreview, setIsStandalonePreview] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      return urlView === 'preview' || urlView === 'resume';
    } catch {
      return false;
    }
  });

  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyResumesOpen, setIsMyResumesOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('tech-architect');

  // Inline resume rename state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState('');

  // Track if a public shared resume is being fetched
  const [isLoadingShared, setIsLoadingShared] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const publicId = params.get('id');
      const isStandalone = params.get('view') === 'preview' || params.get('view') === 'resume';
      // In standalone preview or with a public ID, always start in loading state to prioritize URL params
      return Boolean(publicId || isStandalone);
    } catch {
      return false;
    }
  });

  // Fetch public resume data prioritizing URL parameters over localStorage
  useEffect(() => {
    let isCancelled = false;
    try {
      const params = new URLSearchParams(window.location.search);
      const publicId = params.get('id');
      const isStandalone = params.get('view') === 'preview' || params.get('view') === 'resume';

      // PRIORITY 1: Specific Public ID specified in URL (?id=...)
      if (publicId) {
        setIsLoadingShared(true);
        fetch(`/api/public/resume/${publicId}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then((result) => {
            if (isCancelled) return;
            if (result && result.data) {
              const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
              setData(parsed);
              if (result.title) {
                setActiveResumeTitle(result.title);
              }
              if (result.id) {
                setActiveResumeId(result.id);
              }
            }
          })
          .catch((err) => {
            console.warn(`Public resume fetch notice for ID ${publicId}:`, err);
            // Fallback to latest public resume if specific ID failed
            if (!isCancelled) {
              fetch('/api/public/resume/latest')
                .then((res) => (res.ok ? res.json() : null))
                .then((fallbackResult) => {
                  if (isCancelled || !fallbackResult || !fallbackResult.data) return;
                  const parsed =
                    typeof fallbackResult.data === 'string'
                      ? JSON.parse(fallbackResult.data)
                      : fallbackResult.data;
                  setData(parsed);
                  if (fallbackResult.title) setActiveResumeTitle(fallbackResult.title);
                  if (fallbackResult.id) setActiveResumeId(fallbackResult.id);
                })
                .catch(() => {});
            }
          })
          .finally(() => {
            if (!isCancelled) {
              setIsLoadingShared(false);
            }
          });
        return () => {
          isCancelled = true;
        };
      }

      // PRIORITY 2: Standalone preview requested (?view=preview or ?view=resume) without explicit ?id=
      // Query server for latest public snapshot first to prioritize active data over local storage
      if (isStandalone) {
        setIsLoadingShared(true);
        fetch('/api/public/resume/latest')
          .then((res) => (res.ok ? res.json() : null))
          .then((result) => {
            if (isCancelled) return;
            if (result && result.data) {
              const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
              setData(parsed);
              if (result.title) {
                setActiveResumeTitle(result.title);
              }
              if (result.id) {
                setActiveResumeId(result.id);
              }
            } else {
              // Only fallback to localStorage if database returned nothing
              const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (saved) {
                try {
                  const parsed = JSON.parse(saved);
                  setData(sanitizeBlankCanvas(parsed));
                } catch {}
              }
            }
          })
          .catch((err) => {
            console.warn('Latest public resume fetch notice:', err);
            if (isCancelled) return;
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                setData(sanitizeBlankCanvas(parsed));
              } catch {}
            }
          })
          .finally(() => {
            if (!isCancelled) {
              setIsLoadingShared(false);
            }
          });
        return () => {
          isCancelled = true;
        };
      }

      // Normal builder mode (not a standalone preview)
      setIsLoadingShared(false);
    } catch {
      setIsLoadingShared(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [setActiveResumeTitle, setActiveResumeId]);

  // Track if we have already loaded the user's cloud resume on initial auth
  const hasLoadedCloudRef = useRef<boolean>(false);
  const isInitialMount = useRef<boolean>(true);
  const isSwitchingResumeRef = useRef<boolean>(false);

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
    // If opening a standalone preview or shared public preview, NEVER overwrite preview data!
    if (isStandalonePreview) return;
    const hasSharedId = new URLSearchParams(window.location.search).get('id');
    if (hasSharedId) return;

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
  }, [user, isStandalonePreview]);

  // Sync to local storage ONLY in builder mode (never overwrite local storage while viewing a preview)
  useEffect(() => {
    if (isStandalonePreview) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [data, isStandalonePreview]);

  // Debounced auto-save to Cloud SQL whenever data changes in builder mode
  useEffect(() => {
    if (isStandalonePreview) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isSwitchingResumeRef.current) {
      return;
    }

    if (!user) return;

    const debounceTimer = setTimeout(() => {
      saveResumeToCloud(data);
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [data, user, isStandalonePreview]);

  // Show intro modal on first open if user is not signed in yet (unless opened with ?view=preview/resume)
  useEffect(() => {
    const isPublicPreview = new URLSearchParams(window.location.search).get('view');
    if (!authLoading && !user && !isPublicPreview) {
      setIsAuthModalOpen(true);
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
    saveResumeToCloud(preset);
  };

  const handleStartBlank = () => {
    const blank = sanitizeBlankCanvas(BLANK_PORTFOLIO_TEMPLATE);
    setData(blank);
    saveResumeToCloud(blank);
  };

  const handleLoadDemo = () => {
    setData(PRESET_PRODUCT_DESIGNER);
    saveResumeToCloud(PRESET_PRODUCT_DESIGNER);
    fetch('/api/public/save-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: PRESET_PRODUCT_DESIGNER,
        title: 'Elena Rostova - Principal Staff Product Designer',
        resumeId: activeResumeId || undefined,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (result && result.resume && result.resume.id) {
          setActiveResumeId(result.resume.id);
          setActiveResumeTitle(result.resume.title);
        }
      })
      .catch(() => {});
  };

  const handleReset = () => {
    handleStartBlank();
  };

  const handleSelectResume = (selectedData: PortfolioData, title: string, id: number) => {
    isSwitchingResumeRef.current = true;
    setData(selectedData);
    setActiveResumeId(id > 0 ? id : null);
    setActiveResumeTitle(title);
    setTitleInputValue(title);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedData));
    } catch (e) {
      console.warn('Failed to update local storage', e);
    }
    setTimeout(() => {
      isSwitchingResumeRef.current = false;
    }, 1500);
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

  // STANDALONE PUBLIC PREVIEW: When opening a preview link (?view=preview or ?view=resume),
  // show ONLY the pure preview visualization without the builder navbar, step buttons,
  // subheaders, or device mockup borders.
  if (isStandalonePreview) {
    if (isLoadingShared) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
          <Loader2 className="w-9 h-9 animate-spin text-blue-500 mb-4" />
          <h2 className="text-base font-semibold text-white tracking-tight">Loading Portfolio Preview...</h2>
          <p className="text-xs text-slate-400 mt-1">Fetching latest published portfolio visualization</p>
        </div>
      );
    }

    return (
      <div className="w-screen h-screen overflow-y-auto bg-slate-950 font-sans text-slate-100 relative">
        {viewMode === 'resume' ? (
          <ResumeView
            data={data}
            onBack={() => {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              setIsStandalonePreview(false);
              setViewMode('editor');
            }}
            onOpenTemplateGallery={() => setViewMode('themes')}
            onOpenPreview={() => setViewMode('preview')}
            onOpenShare={() => setIsShareModalOpen(true)}
          />
        ) : (
          <div className="w-full min-h-screen">
            <PortfolioRenderer data={data} isInteractive={true} />
          </div>
        )}

        {/* Discreet Floating Action Pill at Bottom-Right for Owner/Viewer */}
        <div className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
              setIsStandalonePreview(false);
              setViewMode('editor');
            }}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all opacity-80 hover:opacity-100 cursor-pointer"
            title="Open in FolioCraft Builder"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Builder</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-2 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white border border-blue-400/40 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all opacity-85 hover:opacity-100 cursor-pointer"
            title="Share this public preview"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
        </div>

        <SharePreviewModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          data={data}
        />
      </div>
    );
  }

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
        onOpenShare={() => setIsShareModalOpen(true)}
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
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* STEP 1: ENTER DETAILS */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="w-full h-full flex flex-col">
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
              onOpenShare={() => setIsShareModalOpen(true)}
            />
          </div>
        )}

        {/* STEP 4: FULL PREVIEW VIEW (LIVE INTERACTIVE PORTFOLIO) */}
        {viewMode === 'preview' && (
          <div className="w-full h-full bg-slate-950 overflow-hidden relative flex flex-col">
            {/* Quick Preview Toolbar */}
            <div className="no-print bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs shrink-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Live Portfolio Preview</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const previewUrl = `${window.location.origin}${window.location.pathname}?view=preview`;
                    window.history.pushState({}, '', previewUrl);
                    setIsStandalonePreview(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                  title="View full-screen exactly as recipients will see it"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fullscreen View</span>
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Preview</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <DeviceFrame deviceMode={deviceMode}>
                <PortfolioRenderer data={data} isInteractive={true} />
              </DeviceFrame>
            </div>
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
        onSelectResume={handleSelectResume}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Public Share Preview Link Modal */}
      <SharePreviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={data}
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
