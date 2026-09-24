import React, { useState } from 'react';
import { PortfolioData } from '../types/portfolio';
import {
  Printer,
  Copy,
  Check,
  Download,
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

interface ResumeViewProps {
  data: PortfolioData;
  onBack: () => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ data, onBack }) => {
  const { personal, socials, experiences, education, skills, projects, contact } = data;
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines: string[] = [];
    lines.push(`${personal.name}`);
    lines.push(`${personal.roleTitle} | ${personal.location}`);
    lines.push(`Email: ${contact.email || personal.email || socials.email || ''}`);
    if (socials.github) lines.push(`GitHub: ${socials.github}`);
    if (socials.linkedin) lines.push(`LinkedIn: ${socials.linkedin}`);
    if (socials.website) lines.push(`Website: ${socials.website}`);
    lines.push('');
    lines.push('SUMMARY');
    lines.push(personal.bioShort);
    if (personal.bioLong) lines.push(personal.bioLong);
    lines.push('');
    lines.push('WORK EXPERIENCE');
    experiences.forEach((e) => {
      lines.push(`${e.role} — ${e.company} (${e.period}, ${e.location})`);
      lines.push(e.summary);
      if (e.highlights) {
        e.highlights.forEach((h) => lines.push(`  • ${h}`));
      }
      lines.push('');
    });
    if (education && education.length > 0) {
      lines.push('EDUCATION');
      education.forEach((edu) => {
        lines.push(`${edu.degree} — ${edu.institution} (${edu.period})`);
        if (edu.honors) lines.push(`  • ${edu.honors}`);
      });
      lines.push('');
    }
    lines.push('SKILLS');
    skills.forEach((s) => {
      lines.push(`${s.category}: ${s.items.join(', ')}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full bg-slate-900 py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print w-full max-w-[850px] mb-6 flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio Builder</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Plain Text</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ATS Text</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Resume Sheet (Standard A4 / Letter) */}
      <div className="w-full max-w-[850px] bg-white text-slate-900 p-10 sm:p-14 shadow-2xl rounded-sm border border-slate-200 print:border-none print:shadow-none print:p-0 font-sans">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {personal.name}
          </h1>
          <p className="text-lg font-semibold text-blue-700 mt-1">
            {personal.roleTitle}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
            {personal.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{personal.location}</span>
              </span>
            )}
            {(contact.email || personal.email || socials.email) && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.email || personal.email || socials.email}</span>
              </span>
            )}
            {socials.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{socials.website.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
            {socials.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                <span>LinkedIn</span>
              </span>
            )}
            {socials.github && (
              <span className="flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>GitHub</span>
              </span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
            Professional Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {personal.bioLong || personal.bioShort}
          </p>
        </div>

        {/* Work Experience */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">
            Work Experience
          </h2>

          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{exp.role}</span>
                    <span className="text-xs text-slate-500 font-medium"> — {exp.company}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 font-mono">
                    {exp.period}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1">{exp.summary}</p>

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc pl-4">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Selected Projects */}
        {projects && projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Featured Technical & Design Projects
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.title}</span>
                    <span className="text-[11px] text-slate-500">{p.year}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{p.description}</p>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    {p.tags.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Domains */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
            Skills & Core Competencies
          </h2>

          <div className="space-y-2 text-xs">
            {skills.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="font-bold text-slate-800 w-44 shrink-0">{s.category}:</span>
                <span className="text-slate-600">{s.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Education (if available) */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs">
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
    </div>
  );
};
