import React, { useState } from 'react';
import {
  PortfolioData,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  StatItem,
  TestimonialItem,
  SectionKey,
} from '../types/portfolio';
import {
  User,
  Briefcase,
  Layers,
  Wrench,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Mail,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Upload,
  FileText,
  HelpCircle,
  Sparkles,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { ImagePickerModal } from './ImagePickerModal';

interface EditorPanelProps {
  data: PortfolioData;
  onChange: (updated: PortfolioData) => void;
  onOpenResume?: () => void;
  onOpenTemplates?: () => void;
  onStartBlank?: () => void;
  onLoadDemo?: () => void;
}

type EditorTab =
  | 'profile'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'contact'
  | 'stats'
  | 'testimonials'
  | 'sections';

export const EditorPanel: React.FC<EditorPanelProps> = ({
  data,
  onChange,
  onOpenResume,
  onOpenTemplates,
  onStartBlank,
  onLoadDemo,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('profile');
  const [pickerTarget, setPickerTarget] = useState<{ type: 'avatar' } | { type: 'project'; id: string } | null>(null);

  // Helpers for updating personal
  const updatePersonal = (field: string, val: any) => {
    onChange({
      ...data,
      personal: { ...data.personal, [field]: val },
    });
  };

  const updateSocials = (field: string, val: string) => {
    onChange({
      ...data,
      socials: { ...data.socials, [field]: val },
    });
  };

  const updateContact = (field: string, val: string) => {
    onChange({
      ...data,
      contact: { ...data.contact, [field]: val },
    });
  };

  // Education management
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'University / Institute',
      degree: 'B.S. / M.S. in Computer Science or Design',
      period: '2018 — 2022',
      location: 'City, Country',
    };
    onChange({
      ...data,
      education: [...(data.education || []), newEdu],
    });
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: string) => {
    onChange({
      ...data,
      education: (data.education || []).map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: (data.education || []).filter((e) => e.id !== id),
    });
  };

  // Projects management
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'New Project Title',
      subtitle: 'Brief 1-sentence descriptor',
      category: 'Product Design',
      year: `${new Date().getFullYear()}`,
      description: 'Comprehensive overview of problems solved, methodology, and outcome metrics.',
      tags: ['Design', 'TypeScript', 'Frontend'],
      featured: false,
      imageUrl: '',
    };
    onChange({
      ...data,
      projects: [newProj, ...data.projects],
    });
  };

  const updateProject = (id: string, field: keyof ProjectItem, val: any) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= data.projects.length) return;
    const items = [...data.projects];
    const temp = items[index];
    items[index] = items[newIdx];
    items[newIdx] = temp;
    onChange({ ...data, projects: items });
  };

  // Experience management
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'Acme Corp',
      role: 'Senior Engineer / Designer',
      period: '2024 — Present',
      location: 'Remote',
      summary: 'Directed strategic initiatives and core platform architecture.',
      highlights: ['Shipped major platform redesign', 'Mentored junior developers'],
    };
    onChange({
      ...data,
      experiences: [newExp, ...data.experiences],
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, val: any) => {
    onChange({
      ...data,
      experiences: data.experiences.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((e) => e.id !== id),
    });
  };

  // Skills management
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `sk-${Date.now()}`,
      category: 'New Specialty',
      items: ['Skill One', 'Skill Two'],
    };
    onChange({
      ...data,
      skills: [...data.skills, newCat],
    });
  };

  const updateSkillCategory = (id: string, category: string) => {
    onChange({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, category } : s)),
    });
  };

  const updateSkillItems = (id: string, itemsStr: string) => {
    const items = itemsStr.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, items } : s)),
    });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s.id !== id),
    });
  };

  // Stats management
  const updateStat = (id: string, field: keyof StatItem, val: string) => {
    onChange({
      ...data,
      stats: data.stats.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

  const addStat = () => {
    const newStat: StatItem = {
      id: `stat-${Date.now()}`,
      label: 'Metric Label',
      value: '100+',
      context: 'Context notes',
    };
    onChange({
      ...data,
      stats: [...data.stats, newStat],
    });
  };

  const removeStat = (id: string) => {
    onChange({
      ...data,
      stats: data.stats.filter((s) => s.id !== id),
    });
  };

  // Section toggle
  const toggleSection = (id: SectionKey) => {
    onChange({
      ...data,
      sections: data.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      ),
    });
  };

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: '1. Basic Info & Bio', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'experience', label: `2. Work Experience (${data.experiences.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'education', label: `3. Education (${(data.education || []).length})`, icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'skills', label: '4. Skills & Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'projects', label: `5. Projects (${data.projects.length})`, icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'contact', label: '6. Contact & Socials', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'stats', label: `Stats (${data.stats.length})`, icon: <BarChart3 className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'testimonials', label: `Testimonials (${data.testimonials.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'sections', label: 'Sections', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 border-r border-slate-800 select-none overflow-hidden">
      {/* Sub-navigation bar inside editor */}
      <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Starter Bar: Clean Canvas vs Load Sample */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">Portfolio Data:</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Build your own or test with sample</span>
        </div>
        <div className="flex items-center gap-2">
          {onStartBlank && (
            <button
              type="button"
              onClick={onStartBlank}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-blue-500/50 transition-colors flex items-center gap-1 text-[11px] font-semibold shadow-xs"
              title="Reset everything to a clean, blank canvas with your real details"
            >
              <span>✨ Start Clean (Blank)</span>
            </button>
          )}
          {onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Load example profile for design inspiration"
            >
              <span>💡 Load Sample Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Personal & Identity</h3>
              <p className="text-xs text-slate-400">Basic brand mark, title, availability, and biographical narratives.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.personal.name}
                  onChange={(e) => updatePersonal('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role Title *</label>
                <input
                  type="text"
                  value={data.personal.roleTitle}
                  onChange={(e) => updatePersonal('roleTitle', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hero Display Headline</label>
              <textarea
                rows={2}
                value={data.personal.headline}
                onChange={(e) => updatePersonal('headline', e.target.value)}
                placeholder="Large typographic hero statement..."
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={data.personal.location}
                  onChange={(e) => updatePersonal('location', e.target.value)}
                  placeholder="San Francisco, CA & Remote"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Availability Status</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="avail-toggle"
                    checked={data.personal.statusAvailable}
                    onChange={(e) => updatePersonal('statusAvailable', e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <input
                    type="text"
                    value={data.personal.statusText}
                    onChange={(e) => updatePersonal('statusText', e.target.value)}
                    placeholder="Available for Q4 contracts"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Short Bio (Hero & Previews)</label>
              <textarea
                rows={2}
                value={data.personal.bioShort}
                onChange={(e) => updatePersonal('bioShort', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Extended Narrative (About Section)</label>
              <textarea
                rows={4}
                value={data.personal.bioLong}
                onChange={(e) => updatePersonal('bioLong', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Avatar / Portrait Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.personal.avatarUrl}
                  onChange={(e) => updatePersonal('avatarUrl', e.target.value)}
                  placeholder="https://... or click Choose / Upload"
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setPickerTarget({ type: 'avatar' })}
                  className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose / Upload</span>
                </button>
                {data.personal.avatarUrl && (
                  <img
                    src={data.personal.avatarUrl}
                    alt="Preview"
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Selected Works & Projects</h3>
                <p className="text-xs text-slate-400">Add, reorder, and enrich your project case studies.</p>
              </div>
              <button
                onClick={addProject}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                      <span className="text-sm font-bold text-white">{proj.title}</span>
                      {proj.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveProject(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveProject(idx, 'down')}
                        disabled={idx === data.projects.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeProject(proj.id)}
                        className="p-1 text-red-400 hover:text-red-300 ml-2"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Subtitle / Impact</label>
                      <input
                        type="text"
                        value={proj.subtitle}
                        onChange={(e) => updateProject(proj.id, 'subtitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                      <input
                        type="text"
                        value={proj.category}
                        onChange={(e) => updateProject(proj.id, 'category', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Year</label>
                      <input
                        type="text"
                        value={proj.year}
                        onChange={(e) => updateProject(proj.id, 'year', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Client (Optional)</label>
                      <input
                        type="text"
                        value={proj.client || ''}
                        onChange={(e) => updateProject(proj.id, 'client', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Summary Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Deep Case Study Narrative</label>
                    <textarea
                      rows={3}
                      value={proj.fullCaseStudy || ''}
                      onChange={(e) => updateProject(proj.id, 'fullCaseStudy', e.target.value)}
                      placeholder="Detailed architectural challenges, outcomes, and metrics..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Project Visual Asset</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={proj.imageUrl}
                          onChange={(e) => updateProject(proj.id, 'imageUrl', e.target.value)}
                          placeholder="Image URL or upload"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setPickerTarget({ type: 'project', id: proj.id })}
                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0 border border-slate-700 transition-colors"
                          title="Pick preset or upload custom image"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Choose</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={proj.tags.join(', ')}
                        onChange={(e) =>
                          updateProject(
                            proj.id,
                            'tags',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={proj.liveUrl || ''}
                        onChange={(e) => updateProject(proj.id, 'liveUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">GitHub / Source URL</label>
                      <input
                        type="text"
                        value={proj.githubUrl || ''}
                        onChange={(e) => updateProject(proj.id, 'githubUrl', e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`feat-${proj.id}`}
                      checked={proj.featured}
                      onChange={(e) => updateProject(proj.id, 'featured', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-950 border-slate-700"
                    />
                    <label htmlFor={`feat-${proj.id}`} className="text-xs text-slate-300">
                      Mark as Featured (Hero spotlight)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Career History & Milestones</h3>
                <p className="text-xs text-slate-400">Display chronological roles, achievements, and impact.</p>
              </div>
              <button
                onClick={addExperience}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="text-sm font-bold text-white">
                      {exp.role} <span className="text-slate-500 font-normal">at</span> {exp.company}
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Timeline / Period</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Summary</label>
                    <textarea
                      rows={2}
                      value={exp.summary}
                      onChange={(e) => updateExperience(exp.id, 'summary', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bullet Achievements (one per line)</label>
                    <textarea
                      rows={3}
                      value={exp.highlights.join('\n')}
                      onChange={(e) =>
                        updateExperience(
                          exp.id,
                          'highlights',
                          e.target.value.split('\n').filter((l) => l.trim().length > 0)
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Education & Credentials</h3>
                <p className="text-xs text-slate-400">Degrees, academic history, and professional certifications.</p>
              </div>
              <button
                onClick={addEducation}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {(data.education || []).map((edu) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="text-sm font-bold text-white">{edu.degree}</div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Degree / Course</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Timeline</label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                        placeholder="2018 — 2022"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Location / Honors</label>
                      <input
                        type="text"
                        value={edu.location || ''}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        placeholder="Cambridge, MA (Summa Cum Laude)"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Skills & Architectural Capabilities</h3>
                <p className="text-xs text-slate-400">Group skills by domain (e.g. Core Languages, Design Systems).</p>
              </div>
              <button
                onClick={addSkillCategory}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.skills.map((skillGroup) => (
                <div key={skillGroup.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={skillGroup.category}
                      onChange={(e) => updateSkillCategory(skillGroup.id, e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-950 border border-slate-700 rounded text-white max-w-xs"
                    />
                    <button
                      onClick={() => removeSkillCategory(skillGroup.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={skillGroup.items.join(', ')}
                      onChange={(e) => updateSkillItems(skillGroup.id, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Key Numbers & Stats (Metrics)</h3>
                <p className="text-xs text-slate-400">Quick numeric highlight badges that showcase your accomplishments at a glance.</p>
              </div>
              <button
                onClick={addStat}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Number</span>
              </button>
            </div>

            {/* Beginner-friendly explanation */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>What are "Metrics" or Key Numbers?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                In resumes and portfolios, <strong>Metrics</strong> simply mean impressive numbers that prove your real-world experience in 2 seconds to recruiters or clients.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold font-mono text-sm">3+</div>
                  <div className="text-white font-semibold mt-0.5">Years Experience</div>
                  <div className="text-slate-400 text-[10px]">In Web Development</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-blue-400 font-bold font-mono text-sm">15+</div>
                  <div className="text-white font-semibold mt-0.5">Projects Delivered</div>
                  <div className="text-slate-400 text-[10px]">For clients & personal apps</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-purple-400 font-bold font-mono text-sm">100%</div>
                  <div className="text-white font-semibold mt-0.5">On-Time Delivery</div>
                  <div className="text-slate-400 text-[10px]">Dedicated project workflow</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">
                💡 Don't want this section on your portfolio or resume? You can delete these cards with the red trash button, or toggle this section off under the <strong>Show / Hide Sections</strong> tab.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.stats.map((stat) => (
                <div key={stat.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Highlight Number Card</span>
                    <button
                      onClick={() => removeStat(stat.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                      title="Delete this number"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Big Number or Value (e.g. <span className="text-blue-300 font-mono">3+</span>, <span className="text-blue-300 font-mono">10+</span>, <span className="text-blue-300 font-mono">100%</span>)
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      placeholder="e.g. 3+"
                      onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label (What the number represents)</label>
                    <input
                      type="text"
                      value={stat.label}
                      placeholder="e.g. Years Experience"
                      onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Small Note / Context (Optional)</label>
                    <input
                      type="text"
                      value={stat.context || ''}
                      placeholder="e.g. Across web apps & client projects"
                      onChange={(e) => updateStat(stat.id, 'context', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Peer Endorsements</h3>
              <p className="text-xs text-slate-400">Attributable testimonials from engineering leaders and clients.</p>
            </div>

            <div className="space-y-4">
              {data.testimonials.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Quote</label>
                    <textarea
                      rows={3}
                      value={t.quote}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          testimonials: data.testimonials.map((item) =>
                            item.id === t.id ? { ...item, quote: e.target.value } : item
                          ),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={t.author}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            testimonials: data.testimonials.map((item) =>
                              item.id === t.id ? { ...item, author: e.target.value } : item
                            ),
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Role</label>
                      <input
                        type="text"
                        value={t.role}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            testimonials: data.testimonials.map((item) =>
                              item.id === t.id ? { ...item, role: e.target.value } : item
                            ),
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={t.company}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            testimonials: data.testimonials.map((item) =>
                              item.id === t.id ? { ...item, company: e.target.value } : item
                            ),
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT & SOCIALS TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Contact & Social Networks</h3>
              <p className="text-xs text-slate-400">Direct communication channels, booking links, and profiles.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Direct Inbound Email *</label>
                <input
                  type="email"
                  value={data.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Calendly / Booking Link</label>
                <input
                  type="text"
                  value={data.contact.calendlyUrl || ''}
                  onChange={(e) => updateContact('calendlyUrl', e.target.value)}
                  placeholder="https://calendly.com/your-name/intro"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Profile</label>
                  <input
                    type="text"
                    value={data.socials.github || ''}
                    onChange={(e) => updateSocials('github', e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={data.socials.linkedin || ''}
                    onChange={(e) => updateSocials('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">X / Twitter Profile</label>
                  <input
                    type="text"
                    value={data.socials.twitter || ''}
                    onChange={(e) => updateSocials('twitter', e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Dribbble / Portfolio URL</label>
                  <input
                    type="text"
                    value={data.socials.dribbble || ''}
                    onChange={(e) => updateSocials('dribbble', e.target.value)}
                    placeholder="https://dribbble.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">YouTube / Video Channel</label>
                  <input
                    type="text"
                    value={data.socials.youtube || ''}
                    onChange={(e) => updateSocials('youtube', e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={data.socials.instagram || ''}
                    onChange={(e) => updateSocials('instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Figma Profile / Community</label>
                  <input
                    type="text"
                    value={data.socials.figma || ''}
                    onChange={(e) => updateSocials('figma', e.target.value)}
                    placeholder="https://figma.com/@..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Medium / Blog Publication</label>
                  <input
                    type="text"
                    value={data.socials.medium || ''}
                    onChange={(e) => updateSocials('medium', e.target.value)}
                    placeholder="https://medium.com/@..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
              </div>

              {/* Custom Links section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Portfolio & Resume Links</h4>
                    <p className="text-[11px] text-slate-400">Add any additional links (e.g. LeetCode, Behance, Google Scholar, Kaggle).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newL = { id: `link-${Date.now()}`, label: 'New Link', url: 'https://' };
                      onChange({ ...data, customLinks: [...(data.customLinks || []), newL] });
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(data.customLinks || []).map((cl) => (
                    <div key={cl.id} className="flex items-center gap-2 bg-slate-900 p-2 rounded-md border border-slate-800">
                      <input
                        type="text"
                        value={cl.label}
                        onChange={(e) => {
                          onChange({
                            ...data,
                            customLinks: (data.customLinks || []).map((l) =>
                              l.id === cl.id ? { ...l, label: e.target.value } : l
                            ),
                          });
                        }}
                        placeholder="Label (e.g. LeetCode)"
                        className="w-32 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                      <input
                        type="text"
                        value={cl.url}
                        onChange={(e) => {
                          onChange({
                            ...data,
                            customLinks: (data.customLinks || []).map((l) =>
                              l.id === cl.id ? { ...l, url: e.target.value } : l
                            ),
                          });
                        }}
                        placeholder="https://..."
                        className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            customLinks: (data.customLinks || []).filter((l) => l.id !== cl.id),
                          });
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTIONS TOGGLE TAB */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Section Visibility & Presence</h3>
              <p className="text-xs text-slate-400">Toggle sections on or off to tailor your portfolio layout.</p>
            </div>

            <div className="space-y-2">
              {data.sections.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{sec.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">id: #{sec.id}</div>
                  </div>

                  <button
                    onClick={() => toggleSection(sec.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      sec.enabled
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.enabled ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP PROGRESSION FOOTER BAR (Ensures smooth flow: Details -> Templates -> Page & Spacing) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-[10px]">
            1
          </span>
          <div className="leading-tight">
            <span className="font-bold text-white block text-[11px]">Step 1: Resume Info</span>
            <span className="text-[10px] text-slate-400">Details entered & saved</span>
          </div>
        </div>

        {onOpenTemplates && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer text-xs"
          >
            <span>Next: Choose Template (Step 2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Image Picker / Uploader Modal */}
      <ImagePickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget?.type === 'avatar' ? 'Select or Upload Avatar Image' : 'Select or Upload Project Image'}
        onSelectImage={(url) => {
          if (pickerTarget?.type === 'avatar') {
            updatePersonal('avatarUrl', url);
          } else if (pickerTarget?.type === 'project') {
            updateProject(pickerTarget.id, 'imageUrl', url);
          }
        }}
      />
    </div>
  );
};
