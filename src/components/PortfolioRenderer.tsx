import React, { useState, useMemo } from 'react';
import { PortfolioData, ProjectItem } from '../types/portfolio';
import { ProjectModal } from './ProjectModal';
import {
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
  Mail,
  ArrowUpRight,
  Send,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
} from 'lucide-react';

interface PortfolioRendererProps {
  data: PortfolioData;
  isInteractive?: boolean;
}

export const PortfolioRenderer: React.FC<PortfolioRendererProps> = ({
  data,
  isInteractive = true,
}) => {
  const { personal, socials, stats, projects, experiences, skills, testimonials, contact, sections, theme } = data;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Contact form simulation state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Theme visual classes
  const isDark = theme.id === 'cyber' || theme.id === 'aurora';

  const themeStyles = useMemo(() => {
    switch (theme.id) {
      case 'editorial':
        return {
          wrapper: 'bg-[#faf8f5] text-[#1c1917]',
          card: 'bg-white border-[#e7e5e4] shadow-sm',
          cardHover: 'hover:border-[#d6d3d1]',
          border: 'border-[#e7e5e4]',
          headerBg: 'bg-[#faf8f5]/90 border-[#e7e5e4]',
          muted: 'text-[#78716c]',
          surface: 'bg-[#f5f2eb]',
        };
      case 'cyber':
        return {
          wrapper: 'bg-[#080c14] text-[#f1f5f9]',
          card: 'bg-[#0e1424] border-[#1e293b]',
          cardHover: 'hover:border-slate-500',
          border: 'border-[#1e293b]',
          headerBg: 'bg-[#080c14]/90 border-[#1e293b]',
          muted: 'text-[#94a3b8]',
          surface: 'bg-[#0b101d]',
        };
      case 'aurora':
        return {
          wrapper: 'bg-[#0b0f19] text-[#f8fafc]',
          card: 'bg-[#111827]/70 backdrop-blur-md border-[#1f293d]',
          cardHover: 'hover:border-[#374151]',
          border: 'border-[#1f293d]',
          headerBg: 'bg-[#0b0f19]/85 border-[#1f293d]',
          muted: 'text-[#94a3b8]',
          surface: 'bg-[#0e1422]',
        };
      case 'nordic':
        return {
          wrapper: 'bg-[#f8fafc] text-[#0f172a]',
          card: 'bg-white border-slate-200/80 shadow-sm',
          cardHover: 'hover:border-slate-300',
          border: 'border-slate-200',
          headerBg: 'bg-[#f8fafc]/90 border-slate-200',
          muted: 'text-slate-500',
          surface: 'bg-slate-100/70',
        };
      case 'swiss':
      default:
        return {
          wrapper: 'bg-white text-black',
          card: 'bg-white border-black/10',
          cardHover: 'hover:border-black/30',
          border: 'border-black/10',
          headerBg: 'bg-white/95 border-black/10',
          muted: 'text-neutral-500',
          surface: 'bg-neutral-50',
        };
    }
  }, [theme.id]);

  const accentHex = useMemo(() => {
    const map: Record<string, string> = {
      blue: '#2563eb',
      emerald: '#059669',
      amber: '#d97706',
      rose: '#e11d48',
      violet: '#7c3aed',
      mono: isDark ? '#ffffff' : '#0f172a',
    };
    return map[theme.accent] || '#2563eb';
  }, [theme.accent, isDark]);

  const headingFontClass = useMemo(() => {
    switch (theme.fontHeading) {
      case 'serif':
        return 'font-serif-display';
      case 'display':
        return 'font-display';
      case 'mono':
        return 'font-mono-code';
      case 'sans':
      default:
        return 'font-sans-body';
    }
  }, [theme.fontHeading]);

  const radiusClass = useMemo(() => {
    switch (theme.borderRadius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'lg':
        return 'rounded-2xl';
      case 'md':
      default:
        return 'rounded-lg';
    }
  }, [theme.borderRadius]);

  const densitySpacing = useMemo(() => {
    switch (theme.layoutDensity) {
      case 'compact':
        return { sectionY: 'py-12 sm:py-16', gap: 'gap-6' };
      case 'spacious':
        return { sectionY: 'py-24 sm:py-32', gap: 'gap-12' };
      case 'comfortable':
      default:
        return { sectionY: 'py-16 sm:py-24', gap: 'gap-8' };
    }
  }, [theme.layoutDensity]);

  // Unique categories for projects filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  const isEnabled = (secId: string) => {
    const sec = sections.find(s => s.id === secId);
    return sec ? sec.enabled : true;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setFormSubmitted(true);
    setTimeout(() => {
      // simulate receipt
    }, 1500);
  };

  return (
    <div className={`min-h-full w-full font-sans antialiased transition-colors duration-200 ${themeStyles.wrapper}`}>
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Clean text links) — Zone 3 (1 primary CTA) */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${themeStyles.headerBg}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#hero"
            className={`text-lg font-bold tracking-tight transition-opacity hover:opacity-80 ${headingFontClass}`}
          >
            {personal.name}
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {isEnabled('about') && (
              <a href="#about" className={`${themeStyles.muted} hover:text-current transition-colors`}>
                About
              </a>
            )}
            {isEnabled('projects') && (
              <a href="#projects" className={`${themeStyles.muted} hover:text-current transition-colors`}>
                Works
              </a>
            )}
            {isEnabled('experience') && (
              <a href="#experience" className={`${themeStyles.muted} hover:text-current transition-colors`}>
                Milestones
              </a>
            )}
            {isEnabled('skills') && (
              <a href="#skills" className={`${themeStyles.muted} hover:text-current transition-colors`}>
                Capabilities
              </a>
            )}
            {isEnabled('contact') && (
              <a href="#contact" className={`${themeStyles.muted} hover:text-current transition-colors`}>
                Contact
              </a>
            )}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              style={{ backgroundColor: accentHex }}
              className={`px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap ${radiusClass}`}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="max-w-6xl mx-auto px-6">
        {/* HERO SECTION */}
        {isEnabled('hero') && (
          <section id="hero" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline, Subtitle, Availability, Socials */}
              <div className="lg:col-span-7 space-y-6">
                {personal.statusAvailable && (
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{personal.statusText}</span>
                  </div>
                )}

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${headingFontClass}`}>
                  {personal.headline || personal.name}
                </h1>

                <p className={`text-lg sm:text-xl leading-relaxed max-w-xl ${themeStyles.muted}`}>
                  {personal.bioShort}
                </p>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="#projects"
                    style={{ backgroundColor: accentHex }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm ${radiusClass}`}
                  >
                    <span>Explore Selected Works</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  {personal.resumeUrl && (
                    <a
                      href={personal.resumeUrl}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border ${themeStyles.border} hover:bg-slate-500/10 transition-colors ${radiusClass}`}
                    >
                      <FileText className="w-4 h-4 opacity-70" />
                      <span>Resume / CV</span>
                    </a>
                  )}
                </div>

                {/* Metadata & Social Connections: clean unboxed text with typographic separators */}
                <div className="pt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {personal.location && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{personal.location}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}

                  {socials.github && (
                    <>
                      <a href={socials.github} target="_blank" rel="noreferrer" className="hover:text-current transition-colors flex items-center gap-1">
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                      <span aria-hidden="true">·</span>
                    </>
                  )}

                  {socials.linkedin && (
                    <>
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-current transition-colors flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                      <span aria-hidden="true">·</span>
                    </>
                  )}

                  {socials.twitter && (
                    <>
                      <a href={socials.twitter} target="_blank" rel="noreferrer" className="hover:text-current transition-colors flex items-center gap-1">
                        <Twitter className="w-3.5 h-3.5" />
                        <span>X / Twitter</span>
                      </a>
                      <span aria-hidden="true">·</span>
                    </>
                  )}

                  {socials.dribbble && (
                    <>
                      <a href={socials.dribbble} target="_blank" rel="noreferrer" className="hover:text-current transition-colors flex items-center gap-1">
                        <Dribbble className="w-3.5 h-3.5" />
                        <span>Dribbble</span>
                      </a>
                      <span aria-hidden="true">·</span>
                    </>
                  )}

                  {(personal.email || contact.email || socials.email) && (
                    <a
                      href={`mailto:${personal.email || contact.email || socials.email}`}
                      className="hover:text-current transition-colors flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{personal.email || contact.email || socials.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Hero Avatar / Portrait */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm aspect-square">
                  {personal.avatarUrl ? (
                    <img
                      src={personal.avatarUrl}
                      alt={personal.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover shadow-2xl border ${themeStyles.border} ${radiusClass}`}
                    />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center border ${themeStyles.border} ${themeStyles.surface} ${radiusClass}`}>
                      <span className={`text-5xl font-bold ${headingFontClass}`}>{personal.name.charAt(0)}</span>
                      <span className="text-xs text-slate-400 mt-2 font-medium">{personal.roleTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* KEY QUANTITATIVE METRICS / STATS */}
        {stats && stats.length > 0 && (
          <section className={`py-12 border-b ${themeStyles.border}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.id} className="space-y-1">
                  <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${headingFontClass}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold">{stat.label}</div>
                  {stat.context && (
                    <div className={`text-xs ${themeStyles.muted}`}>{stat.context}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABOUT & PHILOSOPHY SECTION */}
        {isEnabled('about') && (
          <section id="about" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  01. Background & Direction
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${headingFontClass}`}>
                  Philosophy & Focus
                </h2>
                <div className={`mt-3 text-sm font-medium ${themeStyles.muted}`}>
                  {personal.roleTitle}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="text-lg sm:text-xl font-medium leading-relaxed">
                  {personal.bioShort}
                </div>
                {personal.bioLong && (
                  <div className={`text-base leading-relaxed ${themeStyles.muted}`}>
                    {personal.bioLong}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SELECTED WORKS / PROJECTS */}
        {isEnabled('projects') && (
          <section id="projects" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  02. Curated Portfolio
                </div>
                <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${headingFontClass}`}>
                  Selected Works
                </h2>
                <p className={`mt-2 text-base ${themeStyles.muted}`}>
                  Featured systems, commercial products, and architectural studies.
                </p>
              </div>

              {/* Functional interactive filter tabs */}
              {categories.length > 2 && (
                <div className={`inline-flex items-center p-1 rounded-lg border ${themeStyles.border} ${themeStyles.surface} text-xs font-medium`}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                        activeCategory === cat
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                          : `${themeStyles.muted} hover:text-current`
                      }`}
                    >
                      {cat === 'all' ? 'All Works' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bento / Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  onClick={() => isInteractive && setSelectedProject(project)}
                  className={`group flex flex-col border transition-all duration-200 cursor-pointer overflow-hidden ${
                    themeStyles.card
                  } ${themeStyles.cardHover} ${radiusClass}`}
                >
                  {/* Visual container */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                        <span className="text-sm font-medium">{project.category}</span>
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Zero-pill clean text metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
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

                    <h3 className={`text-xl font-bold tracking-tight mb-2 group-hover:text-[var(--accent-hex)] transition-colors ${headingFontClass}`}>
                      {project.title}
                    </h3>

                    <p className={`text-sm leading-relaxed mb-6 flex-1 line-clamp-3 ${themeStyles.muted}`}>
                      {project.description}
                    </p>

                    {/* Unboxed tags */}
                    <div className="pt-3 border-t border-inherit flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {project.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx}>#{tag}</span>
                      ))}
                      {project.tags.length > 3 && (
                        <span>+{project.tags.length - 3}</span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs font-semibold pt-1">
                      <span className="inline-flex items-center gap-1 group-hover:underline" style={{ color: accentHex }}>
                        <span>Read Case Study</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                      {project.liveUrl && (
                        <span className={`text-[11px] font-normal ${themeStyles.muted}`}>
                          Live Demo Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WORK EXPERIENCE & CAREER TIMELINE */}
        {isEnabled('experience') && experiences && experiences.length > 0 && (
          <section id="experience" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  03. Professional History
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${headingFontClass}`}>
                  Career Milestones
                </h2>
                <p className={`mt-2 text-sm ${themeStyles.muted}`}>
                  Track record across tech scale-ups and creative practices.
                </p>
              </div>

              <div className="lg:col-span-8 divide-y divide-inherit">
                {experiences.map((exp) => (
                  <div key={exp.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h3 className="text-lg font-bold">
                          {exp.role}
                        </h3>
                        <div className="text-sm font-semibold flex items-center gap-1.5" style={{ color: accentHex }}>
                          <span>{exp.company}</span>
                          {exp.link && (
                            <a href={exp.link} target="_blank" rel="noreferrer" className="inline-block hover:opacity-80">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{exp.period}</span>
                        {exp.location && <span>· {exp.location}</span>}
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${themeStyles.muted}`}>
                      {exp.summary}
                    </p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className={`space-y-1.5 text-xs sm:text-sm pl-4 list-disc ${themeStyles.muted}`}>
                        {exp.highlights.map((item, hIdx) => (
                          <li key={hIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SKILLS & ARCHITECTURAL CAPABILITIES */}
        {isEnabled('skills') && skills && skills.length > 0 && (
          <section id="skills" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="mb-10">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                04. Capabilities & Stack
              </div>
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${headingFontClass}`}>
                Expertise & Toolkit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {skills.map((skillGroup) => (
                <div
                  key={skillGroup.id}
                  className={`p-6 border ${themeStyles.card} ${radiusClass}`}
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-inherit">
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-xs px-2.5 py-1 font-medium border ${
                          isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                        } ${radiusClass}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS & ENDORSEMENTS */}
        {isEnabled('testimonials') && testimonials && testimonials.length > 0 && (
          <section id="testimonials" className={`${densitySpacing.sectionY} border-b ${themeStyles.border}`}>
            <div className="mb-10">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                05. Recommendations
              </div>
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${headingFontClass}`}>
                What Leaders Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`p-8 border flex flex-col justify-between ${themeStyles.card} ${radiusClass}`}
                >
                  <blockquote className="text-base sm:text-lg italic leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-inherit">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: accentHex }}
                    >
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.author}</div>
                      <div className="text-xs text-slate-500">{t.role} · {t.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT & INQUIRIES SECTION */}
        {isEnabled('contact') && (
          <section id="contact" className={densitySpacing.sectionY}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  06. Direct Channel
                </div>
                <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${headingFontClass}`}>
                  {contact.heading}
                </h2>
                <p className={`text-base leading-relaxed ${themeStyles.muted}`}>
                  {contact.description}
                </p>

                <div className="pt-4 space-y-3">
                  <div className="text-sm">
                    <span className="text-slate-500 block text-xs">Direct Email:</span>
                    <a
                      href={`mailto:${contact.email}`}
                      style={{ color: accentHex }}
                      className="font-semibold hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>

                  {contact.calendlyUrl && (
                    <div className="text-sm">
                      <span className="text-slate-500 block text-xs">Calendar Availability:</span>
                      <a
                        href={contact.calendlyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <span>Schedule 30-min Intro Call</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 pt-2">
                    {contact.availabilityNote}
                  </div>
                </div>
              </div>

              {/* Interactive In-App Contact Message Form */}
              <div className="lg:col-span-7">
                <div className={`p-8 border ${themeStyles.card} ${radiusClass}`}>
                  {formSubmitted ? (
                    <div className="py-12 text-center space-y-3 animate-fadeIn">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                      <h3 className="text-xl font-bold">Message Dispatched</h3>
                      <p className={`text-sm max-w-sm mx-auto ${themeStyles.muted}`}>
                        Thank you for reaching out, {formName}. Your inquiry has been received and will be answered shortly.
                      </p>
                      <button
                        onClick={() => {
                          setFormSubmitted(false);
                          setFormName('');
                          setFormEmail('');
                          setFormMessage('');
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-current underline pt-2"
                      >
                        Send another note
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <h3 className="text-lg font-bold mb-4">Send a Direct Note</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Alex Smith"
                            className={`w-full px-3.5 py-2.5 text-sm rounded-md border ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="alex@company.com"
                            className={`w-full px-3.5 py-2.5 text-sm rounded-md border ${
                              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          Inquiry / Scope Description *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Tell me about your project, timeline, or team requirements..."
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{ backgroundColor: accentHex }}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity ${radiusClass}`}
                      >
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer: Quiet copyright and site note */}
      <footer className={`border-t ${themeStyles.border} py-12`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {personal.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#hero" className="hover:text-current transition-colors">Back to top ↑</a>
            <span aria-hidden="true">·</span>
            <span>Built with FolioCraft</span>
          </div>
        </div>
      </footer>

      {/* Lightbox / Project Case Study Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        accentHex={accentHex}
        isDark={isDark}
      />
    </div>
  );
};
