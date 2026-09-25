import React, { useState, useRef } from 'react';
import { PortfolioData } from '../types/portfolio';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Check,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onOpenResume?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenResume,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const { personal, socials, contact, experiences, projects, education, skills } = data;
  const safeName = (personal.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${safeName}-resume.pdf`;

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    setSuccessMessage(null);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 6;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pdfHeight - margin * 2) {
        // Fits on single page
        const fitScale = Math.min(1, (pdfHeight - margin * 2) / contentHeight);
        const finalW = contentWidth * fitScale;
        const finalH = contentHeight * fitScale;
        const xOffset = margin + (contentWidth - finalW) / 2;
        pdf.addImage(imgData, 'JPEG', xOffset, margin, finalW, finalH);
      } else {
        // Multi-page clean break
        let heightLeft = contentHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', margin, margin + position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - margin * 2);

        while (heightLeft > 8) {
          position -= (pdfHeight - margin * 2);
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, margin + position, contentWidth, contentHeight);
          heightLeft -= (pdfHeight - margin * 2);
        }
      }

      pdf.save(filename);
      setSuccessMessage(`✅ "${filename}" downloaded successfully! Check your Downloads folder.`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err) {
      console.error('PDF export failed:', err);
      // Native window print fallback
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Download as PDF</h2>
              <p className="text-xs text-slate-400">
                Export your portfolio & resume as an ATS-optimized PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Document Preview Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
            <div className="w-14 h-16 rounded-lg bg-blue-950/60 border border-blue-500/30 flex flex-col items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-300">PDF</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white truncate">
                  {personal.name ? `${personal.name} — Resume` : 'My Resume & Portfolio'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 shrink-0">
                  A4 Standard
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">
                {filename}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ATS-Friendly
                </span>
                <span>•</span>
                <span>Vector High-DPI</span>
                <span>•</span>
                <span>Print-Ready</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-600/50 text-xs text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Vector PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download as PDF</span>
              </>
            )}
          </button>

          {/* Shortcut to Resume Studio */}
          {onOpenResume && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Want to choose another template or layout?</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenResume();
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Customize in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OFF-SCREEN HIGH-RES ATS RESUME TEMPLATE FOR INSTANT PDF GENERATION */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '820px' }}>
        <div ref={printRef} className="w-[820px] bg-white text-slate-900 p-10 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {personal.name || 'Your Name'}
            </h1>
            <p className="text-base font-semibold text-blue-700 mt-0.5">
              {personal.roleTitle || 'Professional Role Title'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
              {personal.location && <span>{personal.location}</span>}
              {(contact.email || personal.email) && (
                <>
                  <span>•</span>
                  <span>{contact.email || personal.email}</span>
                </>
              )}
              {socials.linkedin && (
                <>
                  <span>•</span>
                  <span>LinkedIn: {socials.linkedin.replace(/^https?:\/\//, '')}</span>
                </>
              )}
              {socials.github && (
                <>
                  <span>•</span>
                  <span>GitHub: {socials.github.replace(/^https?:\/\//, '')}</span>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          {(personal.bioShort || personal.bioLong) && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed text-slate-700">
                {personal.bioLong || personal.bioShort}
              </p>
            </div>
          )}

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Work Experience
              </h2>
              <div className="space-y-3.5">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{exp.role}</span>
                        <span className="text-slate-600"> — {exp.company}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">{exp.period}</span>
                    </div>
                    {exp.summary && (
                      <p className="text-xs text-slate-700 mt-1 leading-normal">{exp.summary}</p>
                    )}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Featured Projects
              </h2>
              <div className="space-y-3">
                {projects.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{proj.year}</span>
                    </div>
                    <p className="text-slate-700 mt-0.5 leading-normal">{proj.description}</p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree}</span>
                      <span className="text-slate-600"> — {edu.institution}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{edu.period}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Skills & Technologies
              </h2>
              <div className="space-y-1.5 text-xs text-slate-700">
                {skills.map((s) => (
                  <div key={s.id}>
                    <strong className="text-slate-900">{s.category}: </strong>
                    <span>{s.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
