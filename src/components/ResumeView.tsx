import React, { useState, useEffect, useRef } from 'react';
import {
  PortfolioData,
  ResumeConfig,
  ResumeTemplateId,
  ResumePageTarget,
  ResumeSpacing,
  CustomLink,
} from '../types/portfolio';
import {
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Maximize2,
  Minimize2,
  FileDown,
  Layout,
  Terminal,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ResumeViewProps {
  data: PortfolioData;
  onChangeData?: (updated: PortfolioData) => void;
  onBack: () => void;
}

const PAGE_HEIGHT_PX = 1040; // Printable height threshold at standard 96dpi for A4/Letter

export const ResumeView: React.FC<ResumeViewProps> = ({ data, onChangeData, onBack }) => {
  const { personal, socials, experiences, education, skills, projects, contact, customLinks } = data;

  const [template, setTemplate] = useState<ResumeTemplateId>(data.resumeConfig?.template || 'modern');
  const [pageTarget, setPageTarget] = useState<ResumePageTarget>(data.resumeConfig?.pageTarget || 1);
  const [spacing, setSpacing] = useState<ResumeSpacing>(data.resumeConfig?.spacing || 'normal');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>(data.resumeConfig?.fontSize || 'standard');
  const [accentColor, setAccentColor] = useState<string>(data.resumeConfig?.accentColor || '#1d4ed8');
  const [showTemplateGallery, setShowTemplateGallery] = useState(true);

  // Section visibility toggles
  const [showSummary, setShowSummary] = useState(data.resumeConfig?.showSummary ?? true);
  const [showProjects, setShowProjects] = useState(data.resumeConfig?.showProjects ?? true);
  const [showEducation, setShowEducation] = useState(data.resumeConfig?.showEducation ?? true);
  const [showSkills, setShowSkills] = useState(data.resumeConfig?.showSkills ?? true);

  // Link adding modal state
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Measured height & page count state
  const resumeRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Measure content height whenever template, content, spacing, or font size changes
  useEffect(() => {
    const updateMeasurement = () => {
      if (resumeRef.current) {
        const height = resumeRef.current.scrollHeight;
        setMeasuredHeight(height);
      }
    };
    // Run after render
    const timer = setTimeout(updateMeasurement, 150);
    return () => clearTimeout(timer);
  }, [template, spacing, fontSize, showSummary, showProjects, showEducation, showSkills, data]);

  // Sync resume configuration back to data if onChangeData is provided
  useEffect(() => {
    if (onChangeData) {
      const config: ResumeConfig = {
        template,
        pageTarget,
        spacing,
        fontSize,
        showProjects,
        showEducation,
        showSkills,
        showSummary,
        accentColor,
      };
      if (JSON.stringify(config) !== JSON.stringify(data.resumeConfig)) {
        onChangeData({ ...data, resumeConfig: config });
      }
    }
  }, [template, pageTarget, spacing, fontSize, showProjects, showEducation, showSkills, showSummary, accentColor]);

  const estimatedPages = Math.max(1, +(measuredHeight / PAGE_HEIGHT_PX).toFixed(1));
  const isOverflowing =
    pageTarget === 1 ? measuredHeight > PAGE_HEIGHT_PX + 20 : measuredHeight > PAGE_HEIGHT_PX * 2 + 30;

  // Real client-side PDF file download via html2canvas-pro (native oklch support) & jsPDF
  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPdf(true);
    setDownloadSuccessMessage(null);

    const safeName = (personal.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${safeName}-resume.pdf`;

    try {
      const element = resumeRef.current;

      // Render DOM to high-res canvas via html2canvas-pro (fully supports Tailwind v4 oklch colors)
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

      // Standard printable margin
      const margin = 5;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (pageTarget === 1 || contentHeight <= pdfHeight - margin * 2) {
        // Fits precisely on 1 page (or auto-scales proportionally to ensure no overflow onto page 2)
        const fitScale = Math.min(1, (pdfHeight - margin * 2) / contentHeight);
        const finalW = contentWidth * fitScale;
        const finalH = contentHeight * fitScale;
        const xOffset = margin + (contentWidth - finalW) / 2;
        pdf.addImage(imgData, 'JPEG', xOffset, margin, finalW, finalH);
      } else {
        // 2 or more pages with clean page break slicing
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
      setDownloadSuccessMessage(`✅ "${filename}" was downloaded directly to your computer! Check your Downloads folder.`);
      setTimeout(() => setDownloadSuccessMessage(null), 7000);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      // Fallback: download standalone printable HTML resume file
      handleDownloadHtmlResume();
      setDownloadSuccessMessage(`Downloaded standalone resume HTML file (open it in browser to print/save as PDF).`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Standalone offline HTML resume file download fallback
  const handleDownloadHtmlResume = () => {
    if (!resumeRef.current) return;
    const safeName = (personal.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${safeName}-resume.html`;
    const resumeHtml = resumeRef.current.innerHTML;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personal.name} - Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-slate-100 p-4 sm:p-8 flex flex-col items-center">
  <div class="no-print mb-4 p-3 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-3">
    <span>Press Ctrl+P (or Cmd+P on Mac) and choose "Save as PDF" to save this resume.</span>
    <button onclick="window.print()" class="px-3 py-1 bg-white text-blue-700 font-bold rounded">Print / Save PDF Now</button>
  </div>
  <div class="w-full max-w-[850px] bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12">
    ${resumeHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPdf();
    }
  };

  const handleAutoFit = () => {
    setSpacing('compact');
    setFontSize('compact');
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      url = `https://${url}`;
    }

    const newLink: CustomLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      url,
    };

    if (onChangeData) {
      onChangeData({
        ...data,
        customLinks: [...(data.customLinks || []), newLink],
      });
    }
    setNewLinkLabel('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleRemoveCustomLink = (id: string) => {
    if (onChangeData) {
      onChangeData({
        ...data,
        customLinks: (data.customLinks || []).filter((l) => l.id !== id),
      });
    }
  };

  const handleCopyPlainText = () => {
    const lines: string[] = [];
    lines.push(personal.name.toUpperCase());
    lines.push(`${personal.roleTitle} | ${personal.location}`);
    lines.push(`Email: ${contact.email || personal.email || socials.email || ''}`);
    if (socials.github) lines.push(`GitHub: ${socials.github}`);
    if (socials.linkedin) lines.push(`LinkedIn: ${socials.linkedin}`);
    if (socials.website) lines.push(`Website: ${socials.website}`);
    if (customLinks && customLinks.length > 0) {
      customLinks.forEach((cl) => lines.push(`${cl.label}: ${cl.url}`));
    }
    lines.push('');
    if (showSummary && (personal.bioLong || personal.bioShort)) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(personal.bioLong || personal.bioShort);
      lines.push('');
    }
    lines.push('WORK EXPERIENCE');
    experiences.forEach((e) => {
      lines.push(`${e.role} — ${e.company} (${e.period}, ${e.location})`);
      lines.push(e.summary);
      if (e.highlights) {
        e.highlights.forEach((h) => lines.push(`  • ${h}`));
      }
      lines.push('');
    });
    if (showProjects && projects && projects.length > 0) {
      lines.push('FEATURED PROJECTS');
      projects.forEach((p) => {
        lines.push(`${p.title} (${p.year})`);
        lines.push(p.description);
        if (p.liveUrl) lines.push(`  Live: ${p.liveUrl}`);
        if (p.githubUrl) lines.push(`  Code: ${p.githubUrl}`);
      });
      lines.push('');
    }
    if (showEducation && education && education.length > 0) {
      lines.push('EDUCATION');
      education.forEach((edu) => {
        lines.push(`${edu.degree} — ${edu.institution} (${edu.period})`);
      });
      lines.push('');
    }
    if (showSkills && skills && skills.length > 0) {
      lines.push('SKILLS & COMPETENCIES');
      skills.forEach((s) => {
        lines.push(`${s.category}: ${s.items.join(', ')}`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Font size classes
  const fontScaleClasses = {
    compact: {
      name: 'text-2xl',
      title: 'text-base',
      heading: 'text-[11px]',
      subheading: 'text-xs',
      body: 'text-[11px] leading-[1.35]',
      meta: 'text-[10px]',
      gap: 'space-y-2',
      sectionGap: 'mb-3',
      itemGap: 'space-y-1.5',
    },
    standard: {
      name: 'text-3xl',
      title: 'text-lg',
      heading: 'text-xs',
      subheading: 'text-sm',
      body: 'text-xs leading-[1.5]',
      meta: 'text-[11px]',
      gap: 'space-y-3',
      sectionGap: 'mb-4',
      itemGap: 'space-y-2.5',
    },
    large: {
      name: 'text-4xl',
      title: 'text-xl',
      heading: 'text-sm',
      subheading: 'text-base',
      body: 'text-sm leading-[1.6]',
      meta: 'text-xs',
      gap: 'space-y-4',
      sectionGap: 'mb-6',
      itemGap: 'space-y-3.5',
    },
  }[fontSize];

  // Spacing padding classes
  const paddingClass = {
    compact: 'p-8 sm:p-10',
    normal: 'p-10 sm:p-12',
    spacious: 'p-12 sm:p-16',
  }[spacing];

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center pb-24 lg:pb-12">
      {/* TOP CONTROL HUB (Hidden on print) */}
      <div className="no-print w-full max-w-5xl mb-6 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-5 shadow-xl space-y-4">
        {/* Navigation & Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </button>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>Resume Studio</span>
            </div>
          </div>

          {/* Action buttons with real PDF download */}
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            <button
              onClick={handleCopyPlainText}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Copy clean plain text for ATS resume parsers"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copy ATS Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 items-center gap-1.5 transition-colors"
              title="Open native browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Dialog</span>
            </button>

            {/* REAL CLIENT-SIDE PDF DOWNLOAD BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Click here to download your resume as a real PDF file (.pdf)"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION TOAST */}
        {downloadSuccessMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{downloadSuccessMessage}</span>
            </div>
            <button
              onClick={() => setDownloadSuccessMessage(null)}
              className="text-emerald-400 hover:text-white font-bold text-sm px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* 3-STEP USER GUIDANCE (Ensures zero confusion for any user) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <span>
              <strong>Pick a Template:</strong> Modern, Tech, Editorial, or Harvard
            </span>
          </div>
          <div className="hidden md:block text-slate-700">&rarr;</div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <span>
              <strong>Set Target:</strong> Choose 1 Page or 2 Pages (check green status)
            </span>
          </div>
          <div className="hidden md:block text-slate-700">&rarr;</div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <span>
              Click <strong className="text-blue-400 font-bold">Download PDF File</strong> to save to your computer
            </span>
          </div>
        </div>

        {/* VISUAL TEMPLATE GALLERY CARDS */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Resume Template</span>
            </label>
            <button
              onClick={() => setShowTemplateGallery(!showTemplateGallery)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>{showTemplateGallery ? 'Hide Gallery' : 'Show All Templates'}</span>
              {showTemplateGallery ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showTemplateGallery && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'modern' as ResumeTemplateId,
                  title: 'Modern Minimalist',
                  tag: 'Most Popular',
                  badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                  icon: <Layout className="w-4 h-4 text-blue-400" />,
                  desc: 'Clean accent divider line, modern sans-serif typography, and balanced 2-column project grid.',
                },
                {
                  id: 'tech' as ResumeTemplateId,
                  title: 'Tech & Systems Architect',
                  tag: 'Engineers & DevOps',
                  badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                  icon: <Terminal className="w-4 h-4 text-emerald-400" />,
                  desc: 'Core stack & capabilities front-and-center, monospace tags, live GitHub code & demo links.',
                },
                {
                  id: 'editorial' as ResumeTemplateId,
                  title: 'Editorial Elegance',
                  tag: 'Designers & Writers',
                  badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                  icon: <BookOpen className="w-4 h-4 text-amber-400" />,
                  desc: 'Sophisticated serif headlines, centered classic header, and chronological case study narrative.',
                },
                {
                  id: 'classic' as ResumeTemplateId,
                  title: 'Harvard / Ivy League Standard',
                  tag: '100% ATS Optimized',
                  badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
                  icon: <Award className="w-4 h-4 text-purple-400" />,
                  desc: 'Timeless black & white Ivy League layout, centered contact row, uppercase underlined sections.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTemplate(opt.id)}
                  className={`relative p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                    template === opt.id
                      ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {opt.icon}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${opt.badgeClass}`}>
                        {opt.tag}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">{opt.title}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    {template === opt.id ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Template</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium group-hover:text-slate-300">
                        Select Template &rarr;
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Controls Grid: Template Dropdown, Page Target, Spacing, Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1 border-t border-slate-800/80">
          {/* 1. Template Choice */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resume Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as ResumeTemplateId)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="modern">Modern Minimalist (Clean 2-Column)</option>
              <option value="tech">Tech & Software Architect (Skills First)</option>
              <option value="editorial">Editorial Elegance (Serif Titles)</option>
              <option value="classic">Classic Harvard (Ivy League Standard)</option>
            </select>
          </div>

          {/* 2. Target Page Constraint */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Target Length
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setPageTarget(1)}
                className={`py-1 rounded text-center font-semibold transition-colors ${
                  pageTarget === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Page (Standard)
              </button>
              <button
                onClick={() => setPageTarget(2)}
                className={`py-1 rounded text-center font-semibold transition-colors ${
                  pageTarget === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Pages (Senior)
              </button>
            </div>
          </div>

          {/* 3. Spacing / Margins */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Page Spacing
            </label>
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              {(['compact', 'normal', 'spacious'] as ResumeSpacing[]).map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpacing(sp)}
                  className={`py-1 capitalize rounded text-center font-medium transition-colors ${
                    spacing === sp ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Font Scale */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Typography Size
            </label>
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              {(['compact', 'standard', 'large'] as const).map((fs) => (
                <button
                  key={fs}
                  onClick={() => setFontSize(fs)}
                  className={`py-1 capitalize rounded text-center font-medium transition-colors ${
                    fontSize === fs ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Toggles & Custom Links row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-medium">Include:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSummary}
                onChange={(e) => setShowSummary(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
              <span>Summary</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showProjects}
                onChange={(e) => setShowProjects(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
              <span>Projects</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showEducation}
                onChange={(e) => setShowEducation(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
              <span>Education</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSkills}
                onChange={(e) => setShowSkills(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
              />
              <span>Skills</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingLink(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 font-semibold transition-colors"
            >
              <Plus className="w-3 h-3 text-blue-400" />
              <span>Add Custom Link</span>
            </button>
          </div>
        </div>

        {/* CUSTOM LINKS CHIPS LIST */}
        {customLinks && customLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500">Custom Links:</span>
            {customLinks.map((link) => (
              <span
                key={link.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
              >
                <Globe className="w-3 h-3 text-blue-400" />
                <span className="font-semibold">{link.label}:</span>
                <span className="text-slate-400 truncate max-w-[120px]">{link.url.replace(/^https?:\/\//, '')}</span>
                <button
                  onClick={() => handleRemoveCustomLink(link.id)}
                  className="text-slate-500 hover:text-red-400 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ADD LINK POPUP / INLINE FORM */}
        {isAddingLink && (
          <form
            onSubmit={handleAddCustomLink}
            className="p-3 bg-slate-950 rounded-lg border border-slate-700 flex flex-wrap items-center gap-2"
          >
            <input
              type="text"
              required
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Label (e.g. LeetCode, Behance, Blog)"
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              required
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="URL (e.g. leetcode.com/u/zainab)"
              className="flex-1 min-w-[200px] px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs"
            >
              Add Link
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLink(false)}
              className="px-2 py-1 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </form>
        )}

        {/* SMART REAL-TIME PAGE OVERFLOW INDICATOR BANNER */}
        <div
          className={`p-3.5 rounded-lg border transition-all ${
            isOverflowing
              ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {isOverflowing ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>
                    {isOverflowing
                      ? `Content Exceeds Target (${pageTarget} Page${pageTarget > 1 ? 's' : ''})`
                      : `Fits Comfortably on ${pageTarget} Page${pageTarget > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-black/40">
                    Est. {estimatedPages} pages ({measuredHeight}px)
                  </span>
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isOverflowing
                    ? pageTarget === 1
                      ? 'Your resume has too much content for a 1-page layout and will spill onto page 2! Use Auto-Fit or switch to 2 Pages.'
                      : 'Your resume has too much content for 2 pages and will spill onto page 3.'
                    : `Optimal density! Ready to download neatly as an ATS-friendly ${pageTarget}-page PDF.`}
                </p>
              </div>
            </div>

            {!isOverflowing && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {pageTarget}-Page PDF</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {isOverflowing && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAutoFit}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fit into {pageTarget} Page</span>
                </button>
                {pageTarget === 1 && (
                  <button
                    onClick={() => setPageTarget(2)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Switch to 2 Pages
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE PRINTABLE RESUME SHEET (Standard A4 / US Letter with Real-Time Page-Break Indicator) */}
      <div className="w-full overflow-x-auto flex justify-center px-0 sm:px-4">
        <div className="relative w-full max-w-[850px] min-w-[320px] shadow-2xl rounded-sm">
          {/* Visual Page Break Marker at exactly PAGE_HEIGHT_PX */}
          <div
            style={{ top: `${PAGE_HEIGHT_PX}px` }}
            className="no-print absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full border-b-2 border-dashed border-red-500/70" />
            <span className="absolute bg-red-600 text-white font-mono text-[10px] uppercase font-bold px-3 py-0.5 rounded shadow">
              --- End of Page 1 (Page Break Boundary) ---
            </span>
          </div>

          {/* 2nd Page Break Marker at PAGE_HEIGHT_PX * 2 */}
          <div
            style={{ top: `${PAGE_HEIGHT_PX * 2}px` }}
            className="no-print absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full border-b-2 border-dashed border-red-500/70" />
            <span className="absolute bg-red-600 text-white font-mono text-[10px] uppercase font-bold px-3 py-0.5 rounded shadow">
              --- End of Page 2 (Page Break Boundary) ---
            </span>
          </div>

          {/* THE RESUME CANVAS */}
          <div
            ref={resumeRef}
            className={`w-full bg-white text-slate-900 border border-slate-300 print:border-none print:shadow-none print:p-0 ${paddingClass}`}
          >
          {/* TEMPLATE 1: MODERN MINIMALIST */}
          {template === 'modern' && (
            <div className="font-sans">
              {/* Header */}
              <div className={`border-b-2 pb-4 ${fontScaleClasses.sectionGap}`} style={{ borderColor: accentColor }}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h1 className={`font-extrabold tracking-tight text-slate-900 ${fontScaleClasses.name}`}>
                      {personal.name}
                    </h1>
                    <div className={`font-semibold mt-0.5 text-blue-700 ${fontScaleClasses.title}`}>
                      {personal.roleTitle}
                    </div>
                  </div>
                  {personal.location && (
                    <div className={`text-slate-600 flex items-center gap-1 ${fontScaleClasses.meta}`}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personal.location}</span>
                    </div>
                  )}
                </div>

                {/* Contact & Social Links Row with real clickable hyperlinks */}
                <div className={`mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-slate-600 ${fontScaleClasses.meta}`}>
                  {(contact.email || personal.email || socials.email) && (
                    <a
                      href={`mailto:${contact.email || personal.email || socials.email}`}
                      className="flex items-center gap-1 hover:text-blue-700"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.email || personal.email || socials.email}</span>
                    </a>
                  )}
                  {socials.website && (
                    <a
                      href={socials.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-blue-700"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{socials.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {socials.linkedin && (
                    <a
                      href={socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-blue-700"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {socials.github && (
                    <a
                      href={socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-blue-700"
                    >
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {customLinks &&
                    customLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-medium hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                </div>
              </div>

              {/* Summary */}
              {showSummary && (personal.bioLong || personal.bioShort) && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className={`font-bold uppercase tracking-widest text-slate-500 mb-1.5 border-b border-slate-200 pb-0.5 ${fontScaleClasses.heading}`}>
                    Professional Summary
                  </h2>
                  <p className={`text-slate-700 ${fontScaleClasses.body}`}>
                    {personal.bioLong || personal.bioShort}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              <div className={fontScaleClasses.sectionGap}>
                <h2 className={`font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-0.5 ${fontScaleClasses.heading}`}>
                  Work Experience
                </h2>
                <div className={fontScaleClasses.itemGap}>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                        <div>
                          <span className={`font-bold text-slate-900 ${fontScaleClasses.subheading}`}>{exp.role}</span>
                          <span className={`text-slate-600 font-medium ${fontScaleClasses.meta}`}> — {exp.company}</span>
                        </div>
                        <span className={`font-semibold text-slate-600 font-mono ${fontScaleClasses.meta}`}>
                          {exp.period}
                        </span>
                      </div>
                      <p className={`text-slate-600 mt-0.5 ${fontScaleClasses.body}`}>{exp.summary}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className={`mt-1 space-y-0.5 text-slate-700 list-disc pl-4 ${fontScaleClasses.body}`}>
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Projects */}
              {showProjects && projects && projects.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className={`font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-0.5 ${fontScaleClasses.heading}`}>
                    Key Projects & Systems
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.slice(0, 4).map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded break-inside-avoid">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-slate-900 ${fontScaleClasses.meta}`}>{p.title}</span>
                          <span className={`text-slate-500 ${fontScaleClasses.meta}`}>{p.year}</span>
                        </div>
                        <p className={`text-slate-600 mt-0.5 line-clamp-2 ${fontScaleClasses.meta}`}>{p.description}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">{p.tags.slice(0, 3).join(' · ')}</span>
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline font-semibold"
                            >
                              Live &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {showSkills && skills && skills.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className={`font-bold uppercase tracking-widest text-slate-500 mb-1.5 border-b border-slate-200 pb-0.5 ${fontScaleClasses.heading}`}>
                    Skills & Competencies
                  </h2>
                  <div className="space-y-1">
                    {skills.map((s) => (
                      <div key={s.id} className={`flex flex-col sm:flex-row sm:items-baseline ${fontScaleClasses.meta}`}>
                        <span className="font-bold text-slate-800 w-36 shrink-0">{s.category}:</span>
                        <span className="text-slate-600">{s.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {showEducation && education && education.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className={`font-bold uppercase tracking-widest text-slate-500 mb-1.5 border-b border-slate-200 pb-0.5 ${fontScaleClasses.heading}`}>
                    Education
                  </h2>
                  <div className="space-y-1">
                    {education.map((edu) => (
                      <div key={edu.id} className={`flex justify-between ${fontScaleClasses.meta}`}>
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          <span className="text-slate-600"> — {edu.institution}</span>
                        </div>
                        <span className="font-mono text-slate-500">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 2: TECH & SOFTWARE ARCHITECT (Skills First, High-Density) */}
          {template === 'tech' && (
            <div className="font-mono-code text-slate-900">
              <div className={`border-b-2 border-slate-900 pb-3 ${fontScaleClasses.sectionGap}`}>
                <h1 className={`font-black tracking-tight text-slate-900 font-sans ${fontScaleClasses.name}`}>
                  {personal.name}
                </h1>
                <div className="font-bold text-blue-800 text-sm mt-0.5 font-sans">
                  {personal.roleTitle} {personal.location ? `· ${personal.location}` : ''}
                </div>

                <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 ${fontScaleClasses.meta}`}>
                  {(contact.email || personal.email || socials.email) && (
                    <a href={`mailto:${contact.email || personal.email || socials.email}`} className="text-blue-700 underline">
                      {contact.email || personal.email || socials.email}
                    </a>
                  )}
                  {socials.github && (
                    <>
                      <span>|</span>
                      <a href={socials.github} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                        {socials.github.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {socials.linkedin && (
                    <>
                      <span>|</span>
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                        linkedin.com/in/{personal.name.toLowerCase().replace(/\s+/g, '')}
                      </a>
                    </>
                  )}
                  {socials.website && (
                    <>
                      <span>|</span>
                      <a href={socials.website} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                        {socials.website.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {customLinks &&
                    customLinks.map((link) => (
                      <React.Fragment key={link.id}>
                        <span>|</span>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                          {link.label}
                        </a>
                      </React.Fragment>
                    ))}
                </div>
              </div>

              {/* Technical Stack First */}
              {showSkills && skills && skills.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <div className="bg-slate-100 p-2 rounded border border-slate-300">
                    <div className="font-bold uppercase tracking-wider text-[11px] text-slate-800 mb-1">
                      // Core Technical Stack & Capabilities
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      {skills.map((s) => (
                        <div key={s.id} className="flex">
                          <span className="font-bold text-slate-900 w-36 shrink-0">{s.category}:</span>
                          <span className="text-slate-700">{s.items.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              <div className={fontScaleClasses.sectionGap}>
                <div className="font-bold uppercase tracking-wider text-xs border-b border-slate-400 pb-1 mb-2 text-slate-900 font-sans">
                  Professional Experience
                </div>
                <div className={fontScaleClasses.itemGap}>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900 font-sans">{exp.role}</span>
                          <span className="text-slate-700"> @ {exp.company}</span>
                        </div>
                        <span className="text-[11px] text-slate-600">{exp.period}</span>
                      </div>
                      <p className={`text-slate-700 font-sans mt-0.5 ${fontScaleClasses.body}`}>{exp.summary}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className={`mt-1 space-y-0.5 text-slate-800 list-disc pl-4 font-sans ${fontScaleClasses.body}`}>
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Projects */}
              {showProjects && projects && projects.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <div className="font-bold uppercase tracking-wider text-xs border-b border-slate-400 pb-1 mb-2 text-slate-900 font-sans">
                    Key Systems & Open Source Projects
                  </div>
                  <div className="space-y-2">
                    {projects.map((p) => (
                      <div key={p.id} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{p.title}</span>
                          <span className="text-[10px] text-slate-500">{p.year}</span>
                        </div>
                        <p className={`text-slate-700 font-sans ${fontScaleClasses.body}`}>{p.description}</p>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Stack: {p.tags.join(', ')}
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noreferrer" className="ml-2 text-blue-700 underline">
                              [Live Demo]
                            </a>
                          )}
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="ml-2 text-blue-700 underline">
                              [Source Code]
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {showEducation && education && education.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <div className="font-bold uppercase tracking-wider text-xs border-b border-slate-400 pb-1 mb-1.5 text-slate-900 font-sans">
                    Education & Certifications
                  </div>
                  <div className="space-y-1 text-xs">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between">
                        <div>
                          <span className="font-bold">{edu.degree}</span>
                          <span className="text-slate-700"> — {edu.institution}</span>
                        </div>
                        <span className="text-slate-500">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 3: EDITORIAL ELEGANCE (Serif Titles, Warm Tone) */}
          {template === 'editorial' && (
            <div className="font-sans">
              <div className={`text-center pb-4 border-b border-slate-300 ${fontScaleClasses.sectionGap}`}>
                <h1 className={`font-serif-display tracking-tight text-slate-900 ${fontScaleClasses.name}`}>
                  {personal.name}
                </h1>
                <div className="italic text-slate-700 font-serif-display text-base mt-0.5">
                  {personal.roleTitle}
                </div>

                <div className={`mt-2 flex flex-wrap justify-center items-center gap-x-3 text-slate-600 ${fontScaleClasses.meta}`}>
                  {personal.location && <span>{personal.location}</span>}
                  {(contact.email || personal.email || socials.email) && (
                    <>
                      <span>·</span>
                      <a href={`mailto:${contact.email || personal.email || socials.email}`} className="hover:underline">
                        {contact.email || personal.email || socials.email}
                      </a>
                    </>
                  )}
                  {socials.website && (
                    <>
                      <span>·</span>
                      <a href={socials.website} target="_blank" rel="noreferrer" className="hover:underline">
                        {socials.website.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {socials.linkedin && (
                    <>
                      <span>·</span>
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                        LinkedIn
                      </a>
                    </>
                  )}
                  {customLinks &&
                    customLinks.map((l) => (
                      <React.Fragment key={l.id}>
                        <span>·</span>
                        <a href={l.url} target="_blank" rel="noreferrer" className="hover:underline font-semibold">
                          {l.label}
                        </a>
                      </React.Fragment>
                    ))}
                </div>
              </div>

              {/* Summary */}
              {showSummary && (personal.bioLong || personal.bioShort) && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-serif-display italic font-bold text-base text-slate-800 border-b border-slate-200 pb-0.5 mb-1">
                    Editorial Statement
                  </h2>
                  <p className={`text-slate-700 ${fontScaleClasses.body}`}>
                    {personal.bioLong || personal.bioShort}
                  </p>
                </div>
              )}

              {/* History */}
              <div className={fontScaleClasses.sectionGap}>
                <h2 className="font-serif-display italic font-bold text-base text-slate-800 border-b border-slate-200 pb-0.5 mb-2">
                  Chronological History
                </h2>
                <div className={fontScaleClasses.itemGap}>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-slate-600">, {exp.company}</span>
                        </div>
                        <span className="italic text-slate-500 text-xs font-serif-display">{exp.period}</span>
                      </div>
                      <p className={`text-slate-600 mt-0.5 ${fontScaleClasses.body}`}>{exp.summary}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className={`mt-1 space-y-0.5 text-slate-700 list-disc pl-4 ${fontScaleClasses.body}`}>
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Works */}
              {showProjects && projects && projects.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-serif-display italic font-bold text-base text-slate-800 border-b border-slate-200 pb-0.5 mb-2">
                    Selected Works
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {projects.map((p) => (
                      <div key={p.id} className="break-inside-avoid">
                        <span className="font-bold text-xs text-slate-900">{p.title}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {showSkills && skills && skills.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-serif-display italic font-bold text-base text-slate-800 border-b border-slate-200 pb-0.5 mb-1.5">
                    Disciplines & Masteries
                  </h2>
                  <div className="space-y-1 text-xs">
                    {skills.map((s) => (
                      <div key={s.id} className="flex">
                        <span className="font-bold text-slate-800 w-36 shrink-0">{s.category}:</span>
                        <span className="text-slate-600">{s.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 4: CLASSIC HARVARD (Ivy League Standard, Timeless Serif, 100% ATS) */}
          {template === 'classic' && (
            <div className="font-serif text-slate-900">
              {/* Header */}
              <div className={`text-center pb-2 border-b-2 border-slate-900 ${fontScaleClasses.sectionGap}`}>
                <h1 className={`font-bold tracking-normal uppercase text-slate-900 ${fontScaleClasses.name}`}>
                  {personal.name}
                </h1>
                <div className={`mt-1 flex flex-wrap justify-center items-center gap-x-2 text-slate-800 ${fontScaleClasses.meta}`}>
                  {personal.location && <span>{personal.location}</span>}
                  {(contact.email || personal.email || socials.email) && (
                    <>
                      <span>•</span>
                      <a href={`mailto:${contact.email || personal.email || socials.email}`} className="text-black underline">
                        {contact.email || personal.email || socials.email}
                      </a>
                    </>
                  )}
                  {socials.website && (
                    <>
                      <span>•</span>
                      <a href={socials.website} target="_blank" rel="noreferrer" className="text-black underline">
                        {socials.website.replace(/^https?:\/\//, '')}
                      </a>
                    </>
                  )}
                  {socials.linkedin && (
                    <>
                      <span>•</span>
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-black underline">
                        LinkedIn
                      </a>
                    </>
                  )}
                  {socials.github && (
                    <>
                      <span>•</span>
                      <a href={socials.github} target="_blank" rel="noreferrer" className="text-black underline">
                        GitHub
                      </a>
                    </>
                  )}
                  {customLinks &&
                    customLinks.map((l) => (
                      <React.Fragment key={l.id}>
                        <span>•</span>
                        <a href={l.url} target="_blank" rel="noreferrer" className="text-black underline">
                          {l.label}
                        </a>
                      </React.Fragment>
                    ))}
                </div>
              </div>

              {/* Education (Harvard puts education first or second) */}
              {showEducation && education && education.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-bold text-xs uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
                    Education
                  </h2>
                  <div className="space-y-1 text-xs">
                    {education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold">{edu.institution}</span>
                          <span className="italic"> — {edu.degree}</span>
                        </div>
                        <span className="font-semibold">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div className={fontScaleClasses.sectionGap}>
                <h2 className="font-bold text-xs uppercase tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                  Experience
                </h2>
                <div className={fontScaleClasses.itemGap}>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-bold">{exp.company}</span>
                          <span className="italic">, {exp.role}</span>
                        </div>
                        <span className="text-xs font-semibold">{exp.period}</span>
                      </div>
                      <p className={`text-slate-800 mt-0.5 ${fontScaleClasses.body}`}>{exp.summary}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className={`mt-1 space-y-0.5 list-disc pl-5 ${fontScaleClasses.body}`}>
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {showProjects && projects && projects.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-bold text-xs uppercase tracking-wider border-b border-black pb-0.5 mb-2 text-black">
                    Projects & Leadership
                  </h2>
                  <div className="space-y-1.5">
                    {projects.map((p) => (
                      <div key={p.id} className="break-inside-avoid">
                        <div className="flex justify-between">
                          <span className="font-bold text-xs">{p.title}</span>
                          <span className="text-[11px]">{p.year}</span>
                        </div>
                        <p className={`text-slate-800 ${fontScaleClasses.body}`}>{p.description}</p>
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-[11px] underline">
                            Link: {p.liveUrl}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {showSkills && skills && skills.length > 0 && (
                <div className={fontScaleClasses.sectionGap}>
                  <h2 className="font-bold text-xs uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 text-black">
                    Skills & Other
                  </h2>
                  <div className="space-y-1 text-xs">
                    {skills.map((s) => (
                      <div key={s.id} className="flex">
                        <span className="font-bold w-36 shrink-0">{s.category}:</span>
                        <span>{s.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
