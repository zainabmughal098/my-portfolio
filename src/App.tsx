import React, { useState, useEffect } from 'react';
import { PortfolioData } from './types/portfolio';
import { BLANK_PORTFOLIO_TEMPLATE, PRESET_PRODUCT_DESIGNER, PRESETS_LIST } from './data/presets';
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
import { FIELD_TEMPLATES, FieldTemplate } from './data/templates';

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

export default function App() {
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
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('foliocraft_walkthrough_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('tech-architect');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [data]);

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
        activeTemplateName={activeTemplate.name}
      />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* STEP 1: ENTER DETAILS (CLEAN, FOCUSED FULL EDITOR - NO CRAMPED SPLIT VIEW) */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
            <EditorPanel
              data={data}
              onChange={setData}
              onOpenResume={() => setViewMode('resume')}
              onOpenTemplates={() => setViewMode('themes')}
              onStartBlank={handleStartBlank}
              onLoadDemo={handleLoadDemo}
              onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
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
        onClose={() => setIsWalkthroughOpen(false)}
        onStartBlank={handleStartBlank}
        onLoadDemo={handleLoadDemo}
      />
    </div>
  );
}
