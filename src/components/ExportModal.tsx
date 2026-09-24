import React, { useState } from 'react';
import { PortfolioData } from '../types/portfolio';
import { generateStandaloneHtml } from '../utils/exportHtml';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  Code2,
  FileJson,
  FileCode,
  Globe,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onImportData: (data: PortfolioData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'json'>('html');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(data);
  const jsonCode = JSON.stringify(data, null, 2);

  const activeContent = activeTab === 'html' ? htmlCode : jsonCode;

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${data.personal.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${data.personal.name.toLowerCase().replace(/\s+/g, '-')}-portfolio-data.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.personal || !parsed.projects) {
          throw new Error('Invalid portfolio schema. Missing personal or projects definitions.');
        }
        onImportData(parsed);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export & Download Center
              </h2>
              <p className="text-xs text-slate-400">
                Produce a self-contained static site or backup your configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1-Click Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HTML Single-file export */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                  <FileCode className="w-4 h-4" />
                  <span>Standalone Single-File Website</span>
                </div>
                <h3 className="text-sm font-bold text-white">Download index.html</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Zero build step required. Double-click to open in any web browser or drag-and-drop to GitHub Pages.
                </p>
              </div>

              <button
                onClick={handleDownloadHtml}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HTML Bundle</span>
              </button>
            </div>

            {/* JSON configuration export / import */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                  <FileJson className="w-4 h-4" />
                  <span>Configuration & Data</span>
                </div>
                <h3 className="text-sm font-bold text-white">Save / Restore JSON</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Backup your custom text, projects, and styling settings to reload anytime.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJson}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save JSON</span>
                </button>

                <label className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {importError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300">
              {importError}
            </div>
          )}

          {/* Code Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'html' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'json' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON Schema
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-4 text-xs font-mono text-slate-300 h-64 overflow-auto scrollbar-thin">
                {activeContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
