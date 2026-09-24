import { PortfolioData } from '../types/portfolio';

export function generateStandaloneHtml(data: PortfolioData): string {
  const { personal, socials, stats, projects, experiences, skills, testimonials, contact, sections, theme } = data;

  const isDark = theme.id === 'cyber' || theme.id === 'aurora';
  const bgColor = theme.id === 'editorial' ? '#faf8f5' : theme.id === 'cyber' ? '#090d16' : theme.id === 'aurora' ? '#0b0f19' : theme.id === 'nordic' ? '#f8fafc' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Accent color hex
  const accentHexMap: Record<string, string> = {
    blue: '#2563eb',
    emerald: '#059669',
    amber: '#d97706',
    rose: '#e11d48',
    violet: '#7c3aed',
    mono: isDark ? '#ffffff' : '#000000',
  };
  const accent = accentHexMap[theme.accent] || '#2563eb';

  // Font family string
  let headingFont = "'Plus Jakarta Sans', sans-serif";
  if (theme.fontHeading === 'serif') headingFont = "'Instrument Serif', Georgia, serif";
  if (theme.fontHeading === 'display') headingFont = "'Syne', sans-serif";
  if (theme.fontHeading === 'mono') headingFont = "'JetBrains Mono', monospace";

  const radiusVal = theme.borderRadius === 'none' ? '0px' : theme.borderRadius === 'sm' ? '4px' : theme.borderRadius === 'lg' ? '16px' : '8px';

  // Section visibility check helper
  const isEnabled = (secId: string) => {
    const s = sections.find(sec => sec.id === secId);
    return s ? s.enabled : true;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(personal.name)} — ${escapeHtml(personal.roleTitle)}</title>
  <meta name="description" content="${escapeHtml(personal.headline)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: ${bgColor};
      color: ${textColor};
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 24px;
    }
    a { color: inherit; text-decoration: none; }
    
    /* Top Bar Contract */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: ${isDark ? 'rgba(9, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${borderColor};
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
    }
    .brand-title {
      font-family: ${headingFont};
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    nav {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    nav a {
      font-size: 0.875rem;
      color: ${mutedColor};
      transition: color 0.15s;
    }
    nav a:hover { color: ${textColor}; }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: ${accent};
      color: #ffffff;
      padding: 9px 18px;
      border-radius: ${radiusVal};
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
      white-space: nowrap;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: ${textColor};
      padding: 8px 16px;
      border-radius: ${radiusVal};
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid ${borderColor};
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-outline:hover { background: ${cardBg}; }

    /* Typography */
    h1, h2, h3, h4 {
      font-family: ${headingFont};
      letter-spacing: -0.02em;
      line-height: 1.15;
    }
    .section-title {
      font-size: 2rem;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .section-subtitle {
      color: ${mutedColor};
      font-size: 1.05rem;
      max-width: 600px;
      margin-bottom: 48px;
    }

    /* Hero */
    .hero-section {
      padding: 96px 0 64px 0;
      border-bottom: 1px solid ${borderColor};
    }
    .hero-split {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 64px;
      align-items: center;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: ${mutedColor};
      margin-bottom: 24px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
    }
    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.08;
      margin-bottom: 24px;
    }
    .hero-tagline {
      font-size: 1.25rem;
      color: ${mutedColor};
      line-height: 1.5;
      margin-bottom: 32px;
      max-width: 580px;
    }
    .hero-avatar {
      width: 100%;
      aspect-ratio: 1/1;
      border-radius: ${radiusVal};
      object-fit: cover;
      border: 1px solid ${borderColor};
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);
    }
    .social-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 32px;
    }
    .social-link {
      font-size: 0.875rem;
      color: ${mutedColor};
      transition: color 0.15s;
    }
    .social-link:hover { color: ${accent}; }

    /* Stats bar */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      padding: 48px 0;
      border-bottom: 1px solid ${borderColor};
    }
    .stat-card {
      display: flex;
      flex-direction: column;
    }
    .stat-val {
      font-size: 2.25rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: ${textColor};
    }
    .stat-lbl {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${textColor};
      margin-top: 4px;
    }
    .stat-ctx {
      font-size: 0.75rem;
      color: ${mutedColor};
      margin-top: 2px;
    }

    /* Section padding */
    section {
      padding: 80px 0;
      border-bottom: 1px solid ${borderColor};
    }

    /* Projects */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 32px;
    }
    .project-card {
      background: ${cardBg};
      border: 1px solid ${borderColor};
      border-radius: ${radiusVal};
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
      cursor: pointer;
    }
    .project-card:hover {
      transform: translateY(-4px);
      border-color: ${accent};
    }
    .project-img {
      width: 100%;
      aspect-ratio: 16/10;
      object-fit: cover;
      background: ${isDark ? '#1a2234' : '#e2e8f0'};
    }
    .project-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .project-meta {
      font-size: 0.75rem;
      color: ${mutedColor};
      margin-bottom: 8px;
    }
    .project-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .project-desc {
      font-size: 0.875rem;
      color: ${mutedColor};
      line-height: 1.5;
      margin-bottom: 16px;
      flex: 1;
    }
    .project-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.75rem;
      color: ${mutedColor};
    }

    /* Experience */
    .exp-list {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .exp-item {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid ${borderColor};
    }
    .exp-item:last-child { border-bottom: none; }
    .exp-period {
      font-size: 0.85rem;
      color: ${mutedColor};
    }
    .exp-company {
      font-weight: 600;
      color: ${textColor};
      font-size: 1.1rem;
      margin-bottom: 4px;
    }
    .exp-role {
      font-size: 0.95rem;
      color: ${accent};
      font-weight: 500;
      margin-bottom: 12px;
    }
    .exp-summary {
      font-size: 0.9rem;
      color: ${mutedColor};
      margin-bottom: 12px;
    }
    .exp-bullets {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
      color: ${mutedColor};
    }
    .exp-bullets li::before {
      content: "—";
      margin-right: 8px;
      color: ${accent};
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 32px;
    }
    .skill-cat-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      border-bottom: 1px solid ${borderColor};
      padding-bottom: 8px;
    }
    .skill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-tag {
      font-size: 0.8rem;
      padding: 6px 12px;
      background: ${cardBg};
      border: 1px solid ${borderColor};
      border-radius: ${radiusVal};
      color: ${textColor};
    }

    /* Testimonials */
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
    }
    .test-card {
      background: ${cardBg};
      border: 1px solid ${borderColor};
      border-radius: ${radiusVal};
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .test-quote {
      font-size: 1rem;
      font-style: italic;
      color: ${textColor};
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .test-author {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .test-role {
      font-size: 0.75rem;
      color: ${mutedColor};
    }

    /* Contact */
    .contact-box {
      background: ${cardBg};
      border: 1px solid ${borderColor};
      border-radius: ${radiusVal};
      padding: 48px;
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
    }

    /* Footer */
    footer {
      padding: 48px 0;
      text-align: center;
      font-size: 0.85rem;
      color: ${mutedColor};
    }

    @media (max-width: 840px) {
      .hero-split { grid-template-columns: 1fr; gap: 36px; }
      .exp-item { grid-template-columns: 1fr; gap: 12px; }
      nav { display: none; }
    }
  </style>
</head>
<body>

  <!-- Top Bar Contract -->
  <header>
    <div class="container">
      <div class="header-inner">
        <a href="#" class="brand-title">${escapeHtml(personal.name)}</a>
        <nav>
          ${isEnabled('about') ? '<a href="#about">About</a>' : ''}
          ${isEnabled('projects') ? '<a href="#projects">Works</a>' : ''}
          ${isEnabled('experience') ? '<a href="#experience">History</a>' : ''}
          ${isEnabled('skills') ? '<a href="#skills">Stack</a>' : ''}
          ${isEnabled('contact') ? '<a href="#contact">Contact</a>' : ''}
        </nav>
        <div>
          <a href="#contact" class="btn-primary">Get in touch</a>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  ${isEnabled('hero') ? `
  <section class="hero-section">
    <div class="container">
      <div class="hero-split">
        <div>
          ${personal.statusAvailable ? `
          <div class="status-badge">
            <span class="status-dot"></span>
            <span>${escapeHtml(personal.statusText)}</span>
          </div>` : ''}
          <h1 class="hero-title">${escapeHtml(personal.name)}</h1>
          <p class="hero-tagline">${escapeHtml(personal.headline)}</p>
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
            <a href="#projects" class="btn-primary">Explore Works</a>
            ${personal.resumeUrl ? `<a href="${escapeHtml(personal.resumeUrl)}" class="btn-outline">View Resume</a>` : ''}
          </div>
          <div class="social-row">
            ${socials.github ? `<a href="${escapeHtml(socials.github)}" target="_blank" rel="noreferrer" class="social-link">GitHub</a>` : ''}
            ${socials.linkedin ? `<a href="${escapeHtml(socials.linkedin)}" target="_blank" rel="noreferrer" class="social-link">LinkedIn</a>` : ''}
            ${socials.twitter ? `<a href="${escapeHtml(socials.twitter)}" target="_blank" rel="noreferrer" class="social-link">Twitter</a>` : ''}
            ${socials.dribbble ? `<a href="${escapeHtml(socials.dribbble)}" target="_blank" rel="noreferrer" class="social-link">Dribbble</a>` : ''}
            ${personal.location ? `<span style="color: ${mutedColor}; font-size: 0.875rem;">· ${escapeHtml(personal.location)}</span>` : ''}
          </div>
        </div>
        ${personal.avatarUrl ? `
        <div>
          <img src="${escapeHtml(personal.avatarUrl)}" alt="${escapeHtml(personal.name)}" class="hero-avatar" />
        </div>` : ''}
      </div>
    </div>
  </section>` : ''}

  <!-- Stats Grid -->
  ${stats && stats.length > 0 ? `
  <div class="container">
    <div class="stats-grid">
      ${stats.map(s => `
        <div class="stat-card">
          <div class="stat-val">${escapeHtml(s.value)}</div>
          <div class="stat-lbl">${escapeHtml(s.label)}</div>
          ${s.context ? `<div class="stat-ctx">${escapeHtml(s.context)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <!-- About Section -->
  ${isEnabled('about') ? `
  <section id="about">
    <div class="container">
      <h2 class="section-title">Background & Philosophy</h2>
      <p class="section-subtitle">${escapeHtml(personal.roleTitle)}</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px;">
        <div style="font-size: 1.15rem; line-height: 1.7; color: ${textColor};">
          ${escapeHtml(personal.bioShort)}
        </div>
        <div style="font-size: 0.95rem; line-height: 1.7; color: ${mutedColor};">
          ${escapeHtml(personal.bioLong)}
        </div>
      </div>
    </div>
  </section>` : ''}

  <!-- Projects Section -->
  ${isEnabled('projects') ? `
  <section id="projects">
    <div class="container">
      <h2 class="section-title">Selected Works</h2>
      <p class="section-subtitle">A curated collection of systems, applications, and design solutions.</p>
      <div class="projects-grid">
        ${projects.map(p => `
          <div class="project-card">
            ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" class="project-img" />` : ''}
            <div class="project-body">
              <div class="project-meta">
                <span>${escapeHtml(p.category)}</span>
                <span> · </span>
                <span>${escapeHtml(p.year)}</span>
                ${p.client ? `<span> · ${escapeHtml(p.client)}</span>` : ''}
              </div>
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-desc">${escapeHtml(p.description)}</p>
              <div class="project-tags">
                ${p.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join(' ')}
              </div>
              ${p.liveUrl || p.githubUrl ? `
              <div style="margin-top: 16px; display: flex; gap: 12px; font-size: 0.85rem;">
                ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noreferrer" style="color: ${accent}; font-weight: 600;">Live Demo &rarr;</a>` : ''}
                ${p.githubUrl ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noreferrer" style="color: ${mutedColor};">Source &rarr;</a>` : ''}
              </div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Experience Section -->
  ${isEnabled('experience') ? `
  <section id="experience">
    <div class="container">
      <h2 class="section-title">Career Milestones</h2>
      <p class="section-subtitle">Leadership, technical contributions, and past roles.</p>
      <div class="exp-list">
        ${experiences.map(e => `
          <div class="exp-item">
            <div>
              <div class="exp-period">${escapeHtml(e.period)}</div>
              <div style="font-size: 0.8rem; color: ${mutedColor}; margin-top: 4px;">${escapeHtml(e.location)}</div>
            </div>
            <div>
              <div class="exp-company">${escapeHtml(e.company)}</div>
              <div class="exp-role">${escapeHtml(e.role)}</div>
              <p class="exp-summary">${escapeHtml(e.summary)}</p>
              ${e.highlights && e.highlights.length > 0 ? `
              <ul class="exp-bullets">
                ${e.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Skills Section -->
  ${isEnabled('skills') ? `
  <section id="skills">
    <div class="container">
      <h2 class="section-title">Skills & Capabilities</h2>
      <p class="section-subtitle">Core technical stack, architecture principles, and domain expertise.</p>
      <div class="skills-grid">
        ${skills.map(s => `
          <div>
            <div class="skill-cat-title">${escapeHtml(s.category)}</div>
            <div class="skill-list">
              ${s.items.map(i => `<span class="skill-tag">${escapeHtml(i)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Testimonials Section -->
  ${isEnabled('testimonials') && testimonials && testimonials.length > 0 ? `
  <section id="testimonials">
    <div class="container">
      <h2 class="section-title">Endorsements</h2>
      <p class="section-subtitle">What peers, founders, and engineering leaders say.</p>
      <div class="test-grid">
        ${testimonials.map(t => `
          <div class="test-card">
            <p class="test-quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
            <div>
              <div class="test-author">${escapeHtml(t.author)}</div>
              <div class="test-role">${escapeHtml(t.role)}, ${escapeHtml(t.company)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact Section -->
  ${isEnabled('contact') ? `
  <section id="contact">
    <div class="container">
      <div class="contact-box">
        <h2 style="font-size: 2rem; margin-bottom: 12px;">${escapeHtml(contact.heading)}</h2>
        <p style="color: ${mutedColor}; margin-bottom: 28px;">${escapeHtml(contact.description)}</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="mailto:${escapeHtml(contact.email)}" class="btn-primary">Email Me: ${escapeHtml(contact.email)}</a>
          ${contact.calendlyUrl ? `<a href="${escapeHtml(contact.calendlyUrl)}" target="_blank" rel="noreferrer" class="btn-outline">Book Office Hours</a>` : ''}
        </div>
        <p style="font-size: 0.8rem; color: ${mutedColor}; margin-top: 24px;">${escapeHtml(contact.availabilityNote)}</p>
      </div>
    </div>
  </section>` : ''}

  <!-- Footer -->
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(personal.name)}. All rights reserved. Generated with FolioCraft.</p>
    </div>
  </footer>

</body>
</html>`;
}

function escapeHtml(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
