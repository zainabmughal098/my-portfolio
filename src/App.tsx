import React, { useState, useEffect } from 'react';
import { PortfolioData } from './types/portfolio';
import { BLANK_PORTFOLIO_TEMPLATE, PRESET_PRODUCT_DESIGNER, PRESETS_LIST } from './data/presets';
import { Navbar, ViewMode, DeviceMode } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { ThemeStudio } from './components/ThemeStudio';
import { PortfolioRenderer } from './components/PortfolioRenderer';
import { DeviceFrame } from './components/DeviceFrame';
import { ExportModal } from './components/ExportModal';
import { GitHubModal } from './components/GitHubModal';
import { ResumeView } from './components/ResumeView';
import { SocialSharePreview } from './components/SocialSharePreview';
import { generateStandaloneHtml } from './utils/exportHtml';

const LOCAL_STORAGE_KEY = 'foliocraft_portfolio_v2';

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached portfolio', e);
    }
    // Default to clean blank template so shared/deployed links don't have confusing fake demo data
    return BLANK_PORTFOLIO_TEMPLATE;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [data]);

  const handleSelectPreset = (preset: PortfolioData) => {
    if (window.confirm(`Switch to the "${preset.name}" preset? Any unsaved edits will be replaced.`)) {
      setData(preset);
    }
  };

  const handleStartBlank = () => {
    if (window.confirm('Start fresh with a clean, blank portfolio canvas? Your current inputs will be reset.')) {
      setData(BLANK_PORTFOLIO_TEMPLATE);
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('Load sample demo portfolio for design inspiration?')) {
      setData(PRESET_PRODUCT_DESIGNER);
    }
  };

  const handleReset = () => {
    handleStartBlank();
  };

  const handleDownloadHtml = () => {
    const html = generateStandaloneHtml(data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${data.personal.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    // Delay revoking URL so browser has time to trigger the download stream
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
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
        onExportHtml={handleDownloadHtml}
        onOpenGithubSync={() => setIsGithubOpen(true)}
        onPrint={handlePrint}
        onReset={handleReset}
        onStartBlank={handleStartBlank}
        onLoadDemo={handleLoadDemo}
      />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* SPLIT VIEW */}
        {viewMode === 'split' && (
          <>
            <div className="w-[450px] xl:w-[480px] shrink-0 h-full border-r border-slate-800">
              <EditorPanel
                data={data}
                onChange={setData}
                onOpenResume={() => setViewMode('resume')}
                onStartBlank={handleStartBlank}
                onLoadDemo={handleLoadDemo}
              />
            </div>
            <div className="flex-1 h-full bg-slate-950 overflow-hidden">
              <DeviceFrame deviceMode={deviceMode}>
                <PortfolioRenderer data={data} isInteractive={true} />
              </DeviceFrame>
            </div>
          </>
        )}

        {/* FULL EDITOR VIEW */}
        {viewMode === 'editor' && (
          <div className="w-full max-w-5xl mx-auto h-full">
            <EditorPanel
              data={data}
              onChange={setData}
              onOpenResume={() => setViewMode('resume')}
              onStartBlank={handleStartBlank}
              onLoadDemo={handleLoadDemo}
            />
          </div>
        )}

        {/* FULL PREVIEW VIEW */}
        {viewMode === 'preview' && (
          <div className="w-full h-full bg-slate-950">
            <DeviceFrame deviceMode={deviceMode}>
              <PortfolioRenderer data={data} isInteractive={true} />
            </DeviceFrame>
          </div>
        )}

        {/* THEME STUDIO VIEW */}
        {viewMode === 'themes' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950 p-4">
            <ThemeStudio
              theme={data.theme}
              onChangeTheme={(updated) => setData({ ...data, theme: updated })}
            />
          </div>
        )}

        {/* ATS RESUME & PRINTABLE CV VIEW */}
        {viewMode === 'resume' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950">
            <ResumeView data={data} onChangeData={setData} onBack={() => setViewMode('split')} />
          </div>
        )}

        {/* SOCIAL SHARE & OPENGRAPH PREVIEW */}
        {viewMode === 'seo' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950 p-4">
            <SocialSharePreview data={data} />
          </div>
        )}
      </div>

      {/* Export / Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={data}
        onImportData={(imported) => setData(imported)}
      />

      {/* GitHub Link & Push Modal */}
      <GitHubModal
        isOpen={isGithubOpen}
        onClose={() => setIsGithubOpen(false)}
      />
    </div>
  );
}
