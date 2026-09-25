import React, { useState } from 'react';
import { FIELD_TEMPLATES, FieldTemplate } from '../data/templates';
import { PortfolioData } from '../types/portfolio';
import {
  X,
  Check,
  Sparkles,
  Layout,
  Code2,
  Palette,
  Briefcase,
  GraduationCap,
  Feather,
  Layers,
  ArrowRight,
  Monitor,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId?: string;
  onApplyTemplate: (template: FieldTemplate) => void;
  userData: PortfolioData;
  onOpenResume?: () => void;
}

type FieldFilter = 'all' | 'engineering' | 'design' | 'business' | 'academic' | 'editorial' | 'universal';

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  currentTemplateId,
  onApplyTemplate,
  userData,
  onOpenResume,
}) => {
  const [selectedField, setSelectedField] = useState<FieldFilter>('all');
  const [previewTemplate, setPreviewTemplate] = useState<FieldTemplate>(() => {
    return FIELD_TEMPLATES.find((t) => t.id === currentTemplateId) || FIELD_TEMPLATES[0];
  });
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = FIELD_TEMPLATES.filter((t) => {
    if (selectedField === 'all') return true;
    return t.field === selectedField;
  });

  const handleApply = (template: FieldTemplate) => {
    onApplyTemplate(template);
    setAppliedNotice(`Applied "${template.name}" template successfully!`);
    setTimeout(() => {
      setAppliedNotice(null);
    }, 2500);
  };

  const getFieldIcon = (field: FieldTemplate['field']) => {
    switch (field) {
      case 'engineering':
        return <Code2 className="w-3.5 h-3.5" />;
      case 'design':
        return <Palette className="w-3.5 h-3.5" />;
      case 'business':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'academic':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'editorial':
        return <Feather className="w-3.5 h-3.5" />;
      case 'universal':
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const userName = userData.personal.name || 'Alex Morgan';
  const userRole = userData.personal.roleTitle || 'Senior Software Engineer & Systems Architect';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Template Gallery</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Multiple Field Options
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click any template bullet to see how it looks with your profile data
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

        {/* Field Category Filter Chips */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Fields' },
            { id: 'engineering', label: 'Tech & Engineering' },
            { id: 'design', label: 'Design & UX' },
            { id: 'business', label: 'Business & Management' },
            { id: 'academic', label: 'Academic & Law' },
            { id: 'editorial', label: 'Creative & Editorial' },
            { id: 'universal', label: 'Universal Minimal' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedField(cat.id as FieldFilter)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedField === cat.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Applied Notification */}
        {appliedNotice && (
          <div className="mx-4 sm:mx-5 mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{appliedNotice}</span>
          </div>
        )}

        {/* Body: Two-column Explorer (Left: Bullet List of Templates | Right: Live Visual Preview) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-0">
          {/* Left Column: Bullet List of Template Options */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-2.5 overflow-y-auto max-h-[60vh] lg:max-h-none">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Choose a Template ({filteredTemplates.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Click to preview</span>
            </div>

            <div className="space-y-2">
              {filteredTemplates.map((template) => {
                const isSelected = previewTemplate.id === template.id;
                const isCurrentlyActive = currentTemplateId === template.id;

                return (
                  <div
                    key={template.id}
                    onClick={() => setPreviewTemplate(template)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-950/50 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Bullet marker */}
                    <div className="pt-0.5 shrink-0">
                      <span
                        className="w-3 h-3 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: isSelected ? template.mockup.accentColor : '#475569',
                          boxShadow: isSelected ? `0 0 8px ${template.mockup.accentColor}` : 'none',
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {template.name}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-300 shrink-0">
                          {template.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {template.targetRoles}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] flex items-center gap-1 text-slate-400">
                          {getFieldIcon(template.field)}
                          <span>{template.fieldLabel}</span>
                        </span>
                        {isCurrentlyActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: "How Template Would Look" (Visual Preview & Details) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-950/40 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: previewTemplate.mockup.accentColor }}
                    />
                    <h3 className="text-base font-bold text-white">{previewTemplate.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      {previewTemplate.fieldLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{previewTemplate.description}</p>
                </div>
              </div>

              {/* LIVE VISUAL PREVIEW MOCKUP: "How Template Would Look" */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>How This Template Looks</span>
                  <span className="text-[10px] text-slate-500">Live Blueprint with Your Info</span>
                </div>

                <div
                  className="rounded-xl border border-slate-700/80 p-4 transition-all shadow-inner overflow-hidden"
                  style={{
                    backgroundColor: previewTemplate.mockup.bgColor,
                    color: previewTemplate.mockup.textColor,
                  }}
                >
                  {/* Simulated Top Navigation Bar */}
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2.5 mb-3 text-[10px] opacity-80">
                    <div className="font-bold flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: previewTemplate.mockup.accentColor }}
                      />
                      <span>{userName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Projects</span>
                      <span>Experience</span>
                      <span>Skills</span>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: previewTemplate.mockup.accentColor }}
                      >
                        Contact
                      </span>
                    </div>
                  </div>

                  {/* Simulated Hero Section based on template archetype */}
                  <div className="space-y-3 py-1">
                    {previewTemplate.mockup.headerLayout === 'terminal' && (
                      <div className="font-mono text-xs space-y-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <div className="text-[10px] text-blue-400">$ whoami</div>
                        <div className="font-bold text-sm text-white">{userName}</div>
                        <div className="text-xs text-slate-300">{userRole}</div>
                        <div className="flex flex-wrap gap-1 pt-1 text-[9px]">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#react</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#typescript</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#cloud</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#distributed</span>
                        </div>
                      </div>
                    )}

                    {previewTemplate.mockup.headerLayout === 'centered' && (
                      <div className="text-center space-y-1 py-1">
                        <h4 className="text-lg font-bold tracking-tight font-serif text-slate-900 dark:text-white">
                          {userName}
                        </h4>
                        <p className="text-xs italic text-slate-600 dark:text-slate-300 font-serif">
                          {userRole}
                        </p>
                        <div className="w-12 h-0.5 mx-auto my-2" style={{ backgroundColor: previewTemplate.mockup.accentColor }} />
                      </div>
                    )}

                    {(previewTemplate.mockup.headerLayout === 'left-aligned' || previewTemplate.mockup.headerLayout === 'split') && (
                      <div className="space-y-1">
                        <div
                          className="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: previewTemplate.mockup.accentColor }}
                        >
                          Available for Hire
                        </div>
                        <h4 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                          {userName}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {userRole}
                        </p>
                      </div>
                    )}

                    {/* Simulated Cards/Sections Wireframe */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div
                        className="p-2.5 rounded-lg border border-black/10 dark:border-white/10 shadow-xs"
                        style={{ backgroundColor: previewTemplate.mockup.cardBg }}
                      >
                        <div className="font-bold flex items-center justify-between text-slate-800 dark:text-slate-200">
                          <span>Featured Projects</span>
                          <span style={{ color: previewTemplate.mockup.accentColor }}>&rarr;</span>
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                          Interactive case studies with live demo & repo links
                        </p>
                      </div>

                      <div
                        className="p-2.5 rounded-lg border border-black/10 dark:border-white/10 shadow-xs"
                        style={{ backgroundColor: previewTemplate.mockup.cardBg }}
                      >
                        <div className="font-bold flex items-center justify-between text-slate-800 dark:text-slate-200">
                          <span>Experience & Stack</span>
                          <span style={{ color: previewTemplate.mockup.accentColor }}>&rarr;</span>
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                          Chronological achievements & verified skills chips
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Feature Highlights */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-300">Key Template Strengths:</span>
                <ul className="space-y-1 text-slate-400">
                  {previewTemplate.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => handleApply(previewTemplate)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply "{previewTemplate.name}" to My Portfolio & Resume</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Safe to apply: Your text & data are completely preserved.</span>
                {onOpenResume && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenResume();
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Resume Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
