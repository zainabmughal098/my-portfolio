import React from 'react';
import { ProjectItem } from '../types/portfolio';
import { X, ExternalLink, Github, Calendar, Building, Tag } from 'lucide-react';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  accentHex: string;
  isDark: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  accentHex,
  isDark,
}) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-3xl my-8 rounded-xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-inherit">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            {project.client && (
              <>
                <span aria-hidden="true">·</span>
                <span>{project.client}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero image if exists */}
        {project.imageUrl && (
          <div className="w-full max-h-[380px] overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src={project.imageUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {project.title}
            </h2>
            <p className={`mt-2 text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {project.subtitle}
            </p>
          </div>

          {/* Metadata chips / info */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Timeline</div>
              <div className="mt-1 text-sm font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{project.year}</span>
              </div>
            </div>
            {project.client && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Client / Org</div>
                <div className="mt-1 text-sm font-medium flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{project.client}</span>
                </div>
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Discipline</div>
              <div className="mt-1 text-sm font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>{project.category}</span>
              </div>
            </div>
          </div>

          {/* Overview & Case study description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Project Overview
            </h3>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {project.description}
            </p>
            {project.fullCaseStudy && (
              <div className="mt-4 pt-4 border-t border-inherit">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Architecture & Execution
                </h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {project.fullCaseStudy}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2.5">
                Technologies & Tools
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-md ${
                      isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action links */}
          <div className="flex items-center gap-3 pt-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: accentHex }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <span>Visit Live Experience</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
