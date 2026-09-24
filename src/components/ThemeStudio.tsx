import React from 'react';
import { ThemeSettings, ThemePreset, AccentColor, FontHeading, BorderRadius, LayoutDensity } from '../types/portfolio';
import { Check, Sparkles, Sliders, Type, Square, Layout } from 'lucide-react';

interface ThemeStudioProps {
  theme: ThemeSettings;
  onChangeTheme: (updated: ThemeSettings) => void;
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ theme, onChangeTheme }) => {
  const presets: { id: ThemePreset; name: string; desc: string; bg: string; text: string; border: string }[] = [
    {
      id: 'editorial',
      name: 'Editorial Serif',
      desc: 'Warm ivory canvas, elegant high-contrast serif typography, and tactile publication feel.',
      bg: 'bg-[#faf8f5]',
      text: 'text-[#1c1917]',
      border: 'border-[#e7e5e4]',
    },
    {
      id: 'swiss',
      name: 'Swiss Studio',
      desc: 'High-contrast stark monochrome rationalism, geometric grid, and zero decorative fluff.',
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-black/20',
    },
    {
      id: 'cyber',
      name: 'Cyber Systems',
      desc: 'Deep obsidian dark mode for developers, software architects, and systems engineers.',
      bg: 'bg-[#080c14]',
      text: 'text-[#f1f5f9]',
      border: 'border-[#1e293b]',
    },
    {
      id: 'aurora',
      name: 'Aurora Glass',
      desc: 'Midnight backdrop with atmospheric glass panels, translucent depth, and sleek accents.',
      bg: 'bg-[#0b0f19]',
      text: 'text-[#f8fafc]',
      border: 'border-[#1f293d]',
    },
    {
      id: 'nordic',
      name: 'Nordic Clean',
      desc: 'Airy cool slate tone, spacious rhythm, and understated Scandinavian balance.',
      bg: 'bg-[#f8fafc]',
      text: 'text-[#0f172a]',
      border: 'border-slate-200',
    },
  ];

  const accents: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Cobalt', hex: '#2563eb' },
    { id: 'emerald', label: 'Emerald', hex: '#059669' },
    { id: 'amber', label: 'Amber', hex: '#d97706' },
    { id: 'rose', label: 'Cinnabar', hex: '#e11d48' },
    { id: 'violet', label: 'Violet', hex: '#7c3aed' },
    { id: 'mono', label: 'Monochrome', hex: '#000000' },
  ];

  const fontOptions: { id: FontHeading; label: string; preview: string; fontClass: string }[] = [
    { id: 'serif', label: 'Instrument Serif', preview: 'The Creative Portfolio', fontClass: 'font-serif-display text-lg' },
    { id: 'display', label: 'Syne Display', preview: 'The Creative Portfolio', fontClass: 'font-display font-bold text-base' },
    { id: 'sans', label: 'Plus Jakarta Sans', preview: 'The Creative Portfolio', fontClass: 'font-sans-body font-bold text-base' },
    { id: 'mono', label: 'JetBrains Mono', preview: 'The Creative Portfolio', fontClass: 'font-mono-code text-sm font-semibold' },
  ];

  const radiusOptions: { id: BorderRadius; label: string; px: string }[] = [
    { id: 'none', label: 'Sharp', px: '0px' },
    { id: 'sm', label: 'Clean', px: '4px' },
    { id: 'md', label: 'Smooth', px: '8px' },
    { id: 'lg', label: 'Soft', px: '16px' },
  ];

  const densityOptions: { id: LayoutDensity; label: string; desc: string }[] = [
    { id: 'compact', label: 'High Density', desc: 'Shorter paddings, tighter tabular flow' },
    { id: 'comfortable', label: 'Balanced', desc: 'Optimal reading cadence for all screens' },
    { id: 'spacious', label: 'Editorial Aire', desc: 'Expansive gallery spacing and large margins' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-10 text-slate-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visual Direction & Tokens</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Theme & Styling Studio
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customize your portfolio's aesthetic language in real-time. All changes synchronize instantly with live preview.
        </p>
      </div>

      {/* 1. Theme Presets */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Design Archetypes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => {
            const isSelected = theme.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChangeTheme({ ...theme, id: p.id })}
                className={`text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-900 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* Visual miniature mockup */}
                <div className={`w-full h-16 rounded-lg mb-3 p-2.5 flex flex-col justify-between border ${p.bg} ${p.text} ${p.border}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-tight">John Doe</span>
                    <span className="text-[9px] opacity-70">About · Works</span>
                  </div>
                  <div className="text-xs font-bold truncate">Staff Designer</div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Accent Color Palette */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Accent Color (10% High-Intent Focal Budget)
        </label>
        <div className="flex flex-wrap gap-3">
          {accents.map((accent) => {
            const isSelected = theme.accent === accent.id;
            return (
              <button
                key={accent.id}
                onClick={() => onChangeTheme({ ...theme, accent: accent.id })}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-slate-800 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: accent.hex }}
                />
                <span className="text-xs font-medium">{accent.label}</span>
                {isSelected && <Check className="w-3 h-3 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Display Typography */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" />
          <span>Headline Typography Pairing</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fontOptions.map((font) => {
            const isSelected = theme.fontHeading === font.id;
            return (
              <button
                key={font.id}
                onClick={() => onChangeTheme({ ...theme, fontHeading: font.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-slate-900 text-white ring-1 ring-blue-500/20'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{font.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <div className={`mt-1 truncate ${font.fontClass}`}>
                  {font.preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Border Radius Math */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Square className="w-3.5 h-3.5" />
          <span>Corner Radius Architecture</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {radiusOptions.map((r) => {
            const isSelected = theme.borderRadius === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onChangeTheme({ ...theme, borderRadius: r.id })}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-slate-900 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{r.label}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{r.px}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Layout Density Cadence */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" />
          <span>Spatial Rhythm & Padding</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {densityOptions.map((d) => {
            const isSelected = theme.layoutDensity === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onChangeTheme({ ...theme, layoutDensity: d.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-slate-900 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{d.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{d.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
