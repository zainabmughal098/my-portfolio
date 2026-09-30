import React, { useState } from 'react';
import { PortfolioData } from '../types/portfolio';
import { generateStandaloneHtml } from '../utils/exportHtml.ts';
import {
  Download,
  Check,
  Globe,
  FileText,
  X,
  FolderDown,
  MonitorCheck,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
}

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [downloadedHtml, setDownloadedHtml] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  if (!isOpen) return null;

  const candidateName = data.personal?.name || 'My';
  const safeName = (data.personal?.name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${safeName}-portfolio.html`;

  const handleDownloadHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml(data);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedHtml(true);
      setTimeout(() => setDownloadedHtml(false), 4000);
    } catch (e) {
      console.error('HTML export error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Ambient background glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Download & Share Your Portfolio
            </h3>
            <p className="text-xs text-slate-400">
              Download a self-contained web file that anyone can open anywhere.
            </p>
          </div>
        </div>

        {/* Big Primary Download Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/60 to-slate-950/80 border border-blue-500/30 mb-5 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Interactive Web Portfolio
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              .HTML File
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            A standalone website file containing your complete interactive portfolio, themes, projects, and contact info. No servers or logins needed.
          </p>

          <button
            onClick={handleDownloadHtml}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-blue-900/40 active:scale-98"
          >
            {downloadedHtml ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Downloaded "{filename}"!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-blue-200" />
                <span>Download Portfolio (.html)</span>
              </>
            )}
          </button>
        </div>

        {/* Clear 3-Step Guide: How to open and share */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>3 Simple Steps to View & Share</span>
          </h4>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                  <FolderDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download the File</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click the blue button above. The <strong className="text-slate-200">{filename}</strong> file will save to your computer in seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Double-Click to Open</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Go to your computer's <strong>Downloads folder</strong> and double-click the file. It opens instantly in your web browser (Chrome, Edge, Safari, Firefox). No internet or account login needed!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send to Recruiters</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Attach the <strong className="text-slate-200">.html</strong> file directly to your job application emails, send via LinkedIn, or drop it onto free hosting like GitHub Pages or Netlify.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible FAQ: Why downloading the file works better than a dev link */}
        <div className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden mb-4">
          <button
            onClick={() => setShowFaq(!showFaq)}
            className="w-full p-3 text-left flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Why is downloading the HTML file best for recruiters?
            </span>
            {showFaq ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showFaq && (
            <div className="px-3 pb-3 pt-1 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 space-y-1.5">
              <p>
                Development web links are protected by Google authentication, which blocks external users (like recruiters or your school account) with a 403 error.
              </p>
              <p>
                The downloaded <strong>.html</strong> file is completely self-contained. It contains all styling, layout, and pictures built right in, so any recruiter can open it on their computer or phone with <strong>zero login walls or errors</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Works offline & on all operating systems.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
