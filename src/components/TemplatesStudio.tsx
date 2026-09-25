import React, { useState } from 'react';
import { FIELD_TEMPLATES, FieldTemplate } from '../data/templates';
import {
  PortfolioData,
  ThemePreset,
  AccentColor,
  FontHeading,
} from '../types/portfolio';
import {
  LayoutTemplate,
  Sparkles,
  Check,
  ShieldCheck,
  Code2,
  Palette,
  Briefcase,
  GraduationCap,
  Feather,
  Layers,
  ArrowRight,
  Type,
  Sliders,
} from 'lucide-react';

interface TemplatesStudioProps {
  data: PortfolioData;
  currentTemplateId: string;
  onApplyTemplate: (template: FieldTemplate) => void;
  onUpdateTheme: (updatedTheme: PortfolioData['theme']) => void;
  onOpenResume: () => void;
}

export const TemplatesStudio: React.FC<TemplatesStudioProps> = ({
  data,
  currentTemplateId,
  onApplyTemplate,
  onUpdateTheme,
  onOpenResume,
}) => {
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const activeTemplate =
    FIELD_TEMPLATES.find((t) => t.id === currentTemplateId) || FIELD_TEMPLATES[0];

  const handleSelectTemplate = (template: FieldTemplate) => {
    onApplyTemplate(template);
    setFeedbackNotice(`Applied "${template.name}" successfully!`);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 3000);
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

  const accents: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Cobalt Blue', hex: '#2563eb' },
    { id: 'emerald', label: 'Emerald Green', hex: '#059669' },
    { id: 'amber', label: 'Warm Amber', hex: '#d97706' },
    { id: 'rose', label: 'Rose Red', hex: '#e11d48' },
    { id: 'violet', label: 'Royal Violet', hex: '#7c3aed' },
    { id: 'mono', label: 'Monochrome', hex: '#0f172a' },
  ];

  const fontOptions: { id: FontHeading; label: string; preview: string; fontClass: string }[] = [
    { id: 'mono', label: 'JetBrains Mono (Technical)', preview: 'console.log(alexMorgan)', fontClass: 'font-mono text-sm' },
    { id: 'sans', label: 'Plus Jakarta Sans (Modern Clean)', preview: 'Product & Systems Design', fontClass: 'font-sans font-bold text-base' },
    { id: 'serif', label: 'Instrument Serif (Ivy / Editorial)', preview: 'Distinguished Engineering', fontClass: 'font-serif text-lg italic' },
    { id: 'display', label: 'Syne Display (Expressive)', preview: 'Creative Direction & Vision', fontClass: 'font-bold text-base tracking-wide' },
  ];

  const themeMoods: { id: ThemePreset; name: string; desc: string; bgBadge: string }[] = [
    { id: 'cyber', name: 'Obsidian Dark', desc: 'Deep technical dark mode for developers & engineers', bgBadge: 'bg-slate-900 border-slate-700 text-white' },
    { id: 'swiss', name: 'Swiss Crisp White', desc: 'High-contrast stark minimal white canvas', bgBadge: 'bg-white border-slate-300 text-slate-900' },
    { id: 'editorial', name: 'Warm Editorial Paper', desc: 'Warm ivory canvas with publication feel', bgBadge: 'bg-[#faf8f5] border-amber-200 text-stone-900' },
    { id: 'nordic', name: 'Nordic Clean Slate', desc: 'Balanced cool slate tone and modern layout', bgBadge: 'bg-slate-100 border-slate-300 text-slate-900' },
    { id: 'aurora', name: 'Aurora Midnight Glass', desc: 'Translucent panels and atmospheric glow', bgBadge: 'bg-[#0b0f19] border-blue-900/50 text-blue-100' },
  ];

  const userName = data.personal.name || 'Your Name';
  const userRole = data.personal.roleTitle || 'Professional Role Title';

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 pb-24">
      {/* Title & Safety Notice */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <LayoutTemplate className="w-4 h-4" />
              <span>Templates & Design Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Choose Your Template & Styling
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Switching templates instantly re-styles both your <strong>Web Portfolio</strong> and <strong>Printable Resume</strong>.
            </p>
          </div>

          <button
            onClick={onOpenResume}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all shadow-xs"
          >
            <span>Preview in Resume Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clear Data Protection Reassurance */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>100% Safe to Switch:</strong> Your entered name, bio, experience, projects, and contact info are <strong>never lost or overwritten</strong> when switching templates.
            </span>
          </div>
          {feedbackNotice && (
            <span className="font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0 animate-in fade-in">
              {feedbackNotice}
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: TEMPLATE GALLERY (Visual Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
              1. Choose Template ({FIELD_TEMPLATES.length} Field-Tested Options)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Click any card to apply</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIELD_TEMPLATES.map((tmpl) => {
            const isCurrent = currentTemplateId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`group rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'border-blue-500 bg-slate-900 shadow-xl ring-2 ring-blue-500/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" />
                    <span>Active Template</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Miniature Visual Mockup Wireframe */}
                  <div
                    className="w-full h-24 rounded-xl border border-black/20 p-2.5 flex flex-col justify-between shadow-inner transition-transform group-hover:scale-[1.01]"
                    style={{
                      backgroundColor: tmpl.mockup.bgColor,
                      color: tmpl.mockup.textColor,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[9px] opacity-80">
                      <div className="font-bold flex items-center gap-1 truncate max-w-[120px]">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: tmpl.mockup.accentColor }}
                        />
                        <span className="truncate">{userName}</span>
                      </div>
                      <span className="text-[8px] opacity-70">Portfolio & Resume</span>
                    </div>

                    <div className="py-1">
                      <div className="text-[11px] font-bold truncate leading-tight">
                        {userName}
                      </div>
                      <div className="text-[9px] opacity-75 truncate">{userRole}</div>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
                        style={{ backgroundColor: tmpl.mockup.accentColor }}
                      >
                        Featured Works
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/10 opacity-70">
                        Experience
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/10 opacity-70">
                        Skills
                      </span>
                    </div>
                  </div>

                  {/* Header info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-slate-800 text-slate-300">
                        {getFieldIcon(tmpl.field)}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                        {tmpl.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <ul className="space-y-1 text-[11px] text-slate-400 pt-1">
                    {tmpl.highlights.slice(0, 2).map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <div className="pt-4 mt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(tmpl);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800 hover:bg-blue-600 text-white hover:shadow-md'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Currently Applied</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply "{tmpl.name}"</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: OPTIONAL FINE-TUNING (Accent Colors, Typography, and Mood) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>2. Optional Fine-Tuning (Colors, Typography & Mood)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize your active template's color accent, headline font, and background palette.
            </p>
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Accent Color:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {accents.map((acc) => {
              const isSelected = data.theme.accent === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onUpdateTheme({ ...data.theme, accent: acc.id })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-slate-800 text-white ring-1 ring-blue-500/40 shadow-xs'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: acc.hex }}
                  />
                  <span>{acc.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography Headline Pairing */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>Headline Font Family:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {fontOptions.map((font) => {
              const isSelected = data.theme.fontHeading === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => onUpdateTheme({ ...data.theme, fontHeading: font.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-slate-950 text-white ring-1 ring-blue-500/40 shadow-xs'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-white">{font.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                  </div>
                  <div className={`text-xs text-slate-400 truncate ${font.fontClass}`}>
                    {font.preview}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Background Mood */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Background Atmosphere:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {themeMoods.map((mood) => {
              const isSelected = data.theme.id === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => onUpdateTheme({ ...data.theme, id: mood.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-slate-950 text-white ring-1 ring-blue-500/40 shadow-xs'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{mood.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {mood.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
