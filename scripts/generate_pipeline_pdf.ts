import { jsPDF } from 'jspdf';
import * as fs from 'fs';

function generatePipelinePdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      addFooter();
      doc.addPage();
      y = 20;
      addHeader();
    }
  };

  const addHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text('FOLIOCRAFT — PROJECT PIPELINE & TECHNICAL SPECIFICATION', margin, 12);
    doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(220, 226, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const addFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.setDrawColor(220, 226, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`FolioCraft v2.0 • Complete Engineering Pipeline`, margin, pageHeight - 8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // COVER / TITLE BLOCK
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FOLIOCRAFT — PROJECT PIPELINE & FEATURE SPEC', margin + 8, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Comprehensive Technical Architecture, Feature Audit & Deployment Roadmap', margin + 8, y + 22);

  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('PROJECT STATUS: PRODUCTION-READY • TARGET: WEB / MOBILE / ATS RESUME', margin + 8, y + 30);

  y += 46;

  // SECTION HELPER
  const printSectionHeader = (title: string, tag: string) => {
    checkPageBreak(16);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1.2);
    doc.line(margin, y, margin, y + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin + 4, y + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235);
    doc.text(tag, pageWidth - margin - 3, y + 5.2, { align: 'right' });

    y += 11;
  };

  const printParagraph = (text: string, fontSize = 9, textColor = [51, 65, 85]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 4.5 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  };

  const printBullet = (label: string, desc: string) => {
    checkPageBreak(9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`•  ${label}:`, margin + 2, y);

    const labelWidth = doc.getTextWidth(`•  ${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const remainingWidth = contentWidth - labelWidth - 3;
    const descLines = doc.splitTextToSize(desc, remainingWidth);

    doc.text(descLines[0], margin + 2 + labelWidth, y);
    y += 4.5;

    for (let i = 1; i < descLines.length; i++) {
      checkPageBreak(5);
      doc.text(descLines[i], margin + 6, y);
      y += 4.5;
    }
    y += 1;
  };

  // 1. EXECUTIVE OVERVIEW
  printSectionHeader('1. Executive Overview & Scope', 'MODULE 01');
  printParagraph(
    'FolioCraft is an all-in-one developer & creative portfolio engine paired with an automated ATS resume generation studio. Built with modern TypeScript and React 19, the platform solves the disconnect between having a visually captivating online portfolio and generating a compliant, recruiter-friendly single-page PDF resume.'
  );
  printBullet('Target Audience', 'Software engineers, UI/UX designers, engineering managers, students, and freelancers.');
  printBullet('Primary Value Proposition', 'Single source of truth: enter your career information once, and immediately get both a high-fidelity interactive web portfolio AND a pixel-accurate ATS-compliant PDF resume.');
  printBullet('Zero Lock-in', 'Full exportability via standalone self-contained HTML (zero CDN/server dependencies), raw JSON schema, and vector PDF.');

  y += 3;

  // 2. ARCHITECTURAL PIPELINE
  printSectionHeader('2. Technical Pipeline & Data Architecture', 'MODULE 02');
  printParagraph(
    'The application is structured into a unidirectional data flow architecture designed for performance, resilience, and offline capability:'
  );

  printBullet(
    '1. Centralized State Engine (App.tsx)',
    'Manages the root PortfolioData state with automatic LocalStorage synchronization (key: foliocraft_portfolio_v2), ensuring continuous persistence during editing sessions without data loss.'
  );
  printBullet(
    '2. Reactive Dual-Pipeline Renderers',
    'State updates feed in real-time into two independent rendering engines: (a) PortfolioRenderer for responsive web displays and (b) ResumeView for physical print/paper layouts.'
  );
  printBullet(
    '3. CSS Color Module Level 4 Normalization',
    'Integrated with html2canvas-pro to support modern Tailwind v4 oklch colors natively, preventing canvas rendering crash exceptions during PDF capture.'
  );
  printBullet(
    '4. Multi-Page Fitting Algorithm',
    'Calculates millimeter-precise document height against standard A4/US Letter dimensions (1050px standard page break height) with dynamic scale factors (0.80x to 1.05x).'
  );

  y += 3;

  // 3. COMPLETE FEATURE INVENTORY
  printSectionHeader('3. Detailed Feature Inventory & Specifications', 'MODULE 03');

  printBullet(
    'Feature A: Clean Canvas vs Archetype Presets',
    'Defaults to an unpolluted blank template (✨ Blank Canvas) so production deployments are ready for immediate use. Users can also load 4 curated archetypes: Product Designer, Fullstack Engineer, Art Director, and OSS Contributor.'
  );

  printBullet(
    'Feature B: Live Split-Screen & Device Simulator',
    'Provides instant side-by-side editing on desktops (>=1024px) with switchable device simulation for Desktop (1440px), iPad/Tablet (768px), and Smartphone (375px) with simulated browser chromes and status notches.'
  );

  printBullet(
    'Feature C: Mobile Bottom Navigation Bar (Phones/Tablets)',
    'A dedicated thumb-friendly 5-action bottom bar (Edit, Preview, Resume, Themes, More) designed for touch screens, with an animated drawer for secondary tools.'
  );

  printBullet(
    'Feature D: ATS Resume Studio with 4 Visual Templates',
    'Interactive template gallery offering Modern Minimalist, Tech Architect (2-column density), Harvard Classic (Ivy League serif standard), and Executive Modern. Includes page-boundary guides, ATS plain-text copy, and 1-click PDF download.'
  );

  printBullet(
    'Feature E: Key Numbers / Metrics Demystified',
    'Transformed corporate metric jargon into intuitive highlight numbers (e.g. 3+ Years Experience, 15+ Projects) with integrated onboarding guidance and toggleable visibility.'
  );

  printBullet(
    'Feature F: Standalone Single-File HTML Export',
    'Generates a fully self-contained index.html with inlined CSS, SVGs, and responsive behaviors, hostable anywhere without Node.js or build steps.'
  );

  printBullet(
    'Feature G: Social SEO & OpenGraph Meta Studio',
    'Simulates real-time social share preview cards for Twitter/X and LinkedIn with meta tag generation and verification.'
  );

  printBullet(
    'Feature H: Unified 1-Click Export & Backup Hub',
    'Consolidated all download and export operations into a single non-redundant modal providing standalone HTML bundle, direct ATS resume PDF access, JSON backup/restore, and documentation without visual clutter.'
  );

  y += 3;

  // 4. TECH STACK SPECIFICATION
  printSectionHeader('4. Technology Stack & Dependency Matrix', 'MODULE 04');

  const printTableRow = (col1: string, col2: string, col3: string, isHead = false) => {
    checkPageBreak(7);
    if (isHead) {
      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
    }
    doc.text(col1, margin + 2, y + 4.2);
    doc.text(col2, margin + 50, y + 4.2);
    doc.text(col3, margin + 110, y + 4.2);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);
    y += 6.5;
  };

  printTableRow('LAYER / TOOL', 'TECHNOLOGY', 'ROLE & FUNCTION', true);
  printTableRow('Core Framework', 'React 19 + TypeScript', 'Reactive state, component architecture, type safety');
  printTableRow('Build Engine', 'Vite 6', 'Fast HMR, optimized production asset bundling');
  printTableRow('Design System', 'Tailwind CSS v4', 'Utility-first modern styling with CSS nesting & OKLCH');
  printTableRow('Iconography', 'Lucide React', 'Consistent, tree-shakable SVG icon suite');
  printTableRow('PDF Core Engine', 'html2canvas-pro + jsPDF', 'DOM-to-canvas rendering with modern CSS color support');
  printTableRow('Animation', 'Motion (Framer)', 'Smooth layout transitions & micro-interactions');

  y += 4;

  // 5. DEPLOYMENT & RELEASE ROADMAP
  printSectionHeader('5. Engineering Milestones & Git Release Log', 'MODULE 05');

  printBullet('v1.0 (Core Engine)', 'Portfolio data models, Editor panel, Theme engine, and local storage cache.');
  printBullet('v1.2 (ATS Resume)', 'Multi-template resume architecture with target 1-page/2-page scaling algorithm.');
  printBullet('v1.5 (PDF Hardening)', 'Upgraded rendering pipeline to html2canvas-pro to eliminate color space crashes.');
  printBullet('v1.8 (Clean Slate & UX)', 'Default clean blank template, simplified metrics explanations, and 1-click canvas reset.');
  printBullet('v2.0 (Universal Responsive)', 'Full phone & desktop responsiveness, thumb-nav mobile dock, and professional docs.');

  y += 6;
  checkPageBreak(25);

  // SUMMARY STAMP / SIGN OFF
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('VERIFICATION & DEPLOYMENT READINESS', margin + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'All features in this specification have been validated through end-to-end linting, unit compilation, and responsive display checks. The repository is ready for live public deployment on Vercel, Netlify, or custom hosting.',
    margin + 6,
    y + 11,
    { maxWidth: contentWidth - 12 }
  );

  // Add headers and footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeader();
    addFooter();
  }

  const outputPath = 'FolioCraft_Project_Pipeline_and_Feature_Spec.pdf';
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
  console.log(`Successfully generated ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

generatePipelinePdf();
