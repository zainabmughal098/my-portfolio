export type ThemePreset = 'swiss' | 'cyber' | 'editorial' | 'aurora' | 'nordic';

export type AccentColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'mono';

export type FontHeading = 'sans' | 'serif' | 'display' | 'mono';

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg';

export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

export type SectionKey = 'hero' | 'about' | 'projects' | 'experience' | 'skills' | 'testimonials' | 'contact';

export interface SectionConfig {
  id: SectionKey;
  title: string;
  enabled: boolean;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  context?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  client?: string;
  year: string;
  description: string;
  fullCaseStudy?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  imageUrl: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  link?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  dribbble?: string;
  substack?: string;
  website?: string;
  email?: string;
}

export interface PersonalInfo {
  name: string;
  roleTitle: string;
  headline: string;
  location: string;
  email?: string;
  statusText: string;
  statusAvailable: boolean;
  bioShort: string;
  bioLong: string;
  avatarUrl: string;
  resumeUrl?: string;
}

export interface ContactInfo {
  heading: string;
  description: string;
  availabilityNote: string;
  email: string;
  calendlyUrl?: string;
}

export interface ThemeSettings {
  id: ThemePreset;
  accent: AccentColor;
  fontHeading: FontHeading;
  borderRadius: BorderRadius;
  layoutDensity: LayoutDensity;
}

export interface PortfolioData {
  id: string;
  name: string;
  personal: PersonalInfo;
  socials: SocialLinks;
  stats: StatItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  skills: SkillCategory[];
  testimonials: TestimonialItem[];
  contact: ContactInfo;
  sections: SectionConfig[];
  theme: ThemeSettings;
}
