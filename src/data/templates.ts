import { ThemePreset, AccentColor, FontHeading, BorderRadius, LayoutDensity, ResumeTemplateId } from '../types/portfolio';

export interface FieldTemplate {
  id: string;
  name: string;
  badge: string;
  field: 'engineering' | 'design' | 'business' | 'academic' | 'editorial' | 'universal';
  fieldLabel: string;
  targetRoles: string;
  description: string;
  bestFor: string;
  themePreset: ThemePreset;
  accent: AccentColor;
  fontHeading: FontHeading;
  borderRadius: BorderRadius;
  layoutDensity: LayoutDensity;
  resumeTemplate: ResumeTemplateId;
  highlights: string[];
  mockup: {
    headerLayout: 'left-aligned' | 'centered' | 'split' | 'terminal';
    accentColor: string;
    bgColor: string;
    cardBg: string;
    textColor: string;
    fontFamily: string;
    layoutType: 'grid-cards' | 'dense-stack' | 'editorial-flow' | 'classic-rules';
  };
}

export const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: 'tech-architect',
    name: 'Tech & Systems Architect',
    badge: 'Software & DevOps',
    field: 'engineering',
    fieldLabel: 'Engineering & Tech',
    targetRoles: 'Software Engineers, Full-Stack, Backend, Cloud & DevOps',
    description: 'High-density technical layout with core stack chips, system architecture metrics, and live GitHub/Demo links.',
    bestFor: 'Developers who want their technical stack, repos, and architecture impact front-and-center.',
    themePreset: 'cyber',
    accent: 'blue',
    fontHeading: 'mono',
    borderRadius: 'sm',
    layoutDensity: 'compact',
    resumeTemplate: 'tech',
    highlights: [
      'Monospace technical typography (JetBrains Mono)',
      'Categorized skills & tools matrix first',
      'Direct GitHub repository & live demo links',
      'Clean terminal-inspired aesthetic',
    ],
    mockup: {
      headerLayout: 'terminal',
      accentColor: '#3b82f6',
      bgColor: '#080c14',
      cardBg: '#0e1424',
      textColor: '#f1f5f9',
      fontFamily: 'font-mono',
      layoutType: 'dense-stack',
    },
  },
  {
    id: 'product-designer',
    name: 'Product & UX/UI Designer',
    badge: 'Design & UX',
    field: 'design',
    fieldLabel: 'Product & Design',
    targetRoles: 'Product Designers, UX/UI Leads, Design System Engineers',
    description: 'Visual case study portfolio with interactive prototype links, typography balance, and design process highlights.',
    bestFor: 'Designers who need to showcase visual case studies, problem-solving, and aesthetics.',
    themePreset: 'nordic',
    accent: 'emerald',
    fontHeading: 'sans',
    borderRadius: 'md',
    layoutDensity: 'comfortable',
    resumeTemplate: 'modern',
    highlights: [
      'Visual project showcase cards with aspect ratio framing',
      'Design tools & frontend capabilities chips',
      'Interactive project modal with problem/solution narrative',
      'Clean Nordic minimalist typography',
    ],
    mockup: {
      headerLayout: 'left-aligned',
      accentColor: '#10b981',
      bgColor: '#f8fafc',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'font-sans',
      layoutType: 'grid-cards',
    },
  },
  {
    id: 'executive-leader',
    name: 'Executive & Corporate Leader',
    badge: 'Leadership & Ops',
    field: 'business',
    fieldLabel: 'Business & Management',
    targetRoles: 'Engineering Managers, Directors, Product Leads, Founders, Consultants',
    description: 'High-impact executive layout focusing on measurable organizational growth, team leadership, and strategic milestones.',
    bestFor: 'Managers and senior leaders who need to showcase business metrics, team size, and career trajectory.',
    themePreset: 'swiss',
    accent: 'blue',
    fontHeading: 'sans',
    borderRadius: 'sm',
    layoutDensity: 'compact',
    resumeTemplate: 'modern',
    highlights: [
      'High-impact Key Numbers & metrics band',
      'Structured career milestone chronology',
      'Executive summary statement formatting',
      'Recruiter-vetted enterprise presentation',
    ],
    mockup: {
      headerLayout: 'split',
      accentColor: '#1d4ed8',
      bgColor: '#ffffff',
      cardBg: '#f8fafc',
      textColor: '#0f172a',
      fontFamily: 'font-sans',
      layoutType: 'dense-stack',
    },
  },
  {
    id: 'harvard-academic',
    name: 'Classic Harvard Scholar',
    badge: 'Academic & Legal',
    field: 'academic',
    fieldLabel: 'Academic & Research',
    targetRoles: 'Researchers, Data Scientists, Scholars, Legal & Enterprise',
    description: 'Prestigious, timeless Ivy League standard with serif headings, formal chronology, and education/publication prominence.',
    bestFor: 'Academic researchers, educators, legal counsel, and traditional corporate applicants.',
    themePreset: 'swiss',
    accent: 'mono',
    fontHeading: 'serif',
    borderRadius: 'none',
    layoutDensity: 'compact',
    resumeTemplate: 'classic',
    highlights: [
      'Timeless Harvard academic serif typography',
      'Formal horizontal divider rules (100% ATS score)',
      'Education and credentials highlighted prominently',
      'Distraction-free high-converting structure',
    ],
    mockup: {
      headerLayout: 'centered',
      accentColor: '#0f172a',
      bgColor: '#ffffff',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'font-serif',
      layoutType: 'classic-rules',
    },
  },
  {
    id: 'editorial-studio',
    name: 'Editorial & Creative Studio',
    badge: 'Art & Editorial',
    field: 'editorial',
    fieldLabel: 'Editorial & Creative',
    targetRoles: 'Art Directors, Writers, Creative Directors, Media Specialists',
    description: 'Magazine-inspired editorial aesthetic with expressive serif titles, narrative bio storytelling, and curated gallery works.',
    bestFor: 'Creatives, copywriters, and art directors who value editorial voice and sophisticated typography.',
    themePreset: 'editorial',
    accent: 'amber',
    fontHeading: 'serif',
    borderRadius: 'sm',
    layoutDensity: 'spacious',
    resumeTemplate: 'editorial',
    highlights: [
      'Expressive Instrument Serif headlines with warm tones',
      'Curated Selected Works layout',
      'Story-driven narrative bio statement',
      'Sophisticated paper-toned editorial palette',
    ],
    mockup: {
      headerLayout: 'centered',
      accentColor: '#d97706',
      bgColor: '#faf8f5',
      cardBg: '#ffffff',
      textColor: '#1c1917',
      fontFamily: 'font-serif',
      layoutType: 'editorial-flow',
    },
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    badge: 'Universal Clean',
    field: 'universal',
    fieldLabel: 'Universal & All Fields',
    targetRoles: 'Any profession: Marketing, Sales, Operations, Engineering, Product',
    description: 'Ultra-clean, balanced, modern layout that works seamlessly for any discipline or industry with maximum readability.',
    bestFor: 'Anyone wanting a crisp, contemporary portfolio and resume that is guaranteed to impress in any sector.',
    themePreset: 'aurora',
    accent: 'violet',
    fontHeading: 'sans',
    borderRadius: 'md',
    layoutDensity: 'comfortable',
    resumeTemplate: 'modern',
    highlights: [
      'Contemporary Plus Jakarta Sans typography',
      'Subtle modern gradient and border accents',
      'Universal 1-column / 2-column adaptive layout',
      '100% compatible across all devices and print sizes',
    ],
    mockup: {
      headerLayout: 'left-aligned',
      accentColor: '#8b5cf6',
      bgColor: '#0b0f19',
      cardBg: '#111827',
      textColor: '#f8fafc',
      fontFamily: 'font-sans',
      layoutType: 'grid-cards',
    },
  },
];
