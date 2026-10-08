# FolioCraft — Portfolio & ATS Resume Builder

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-Node.js-22c55e?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-336791?style=flat-square&logo=postgresql)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_WebGL-000000?style=flat-square&logo=three.js)](https://threejs.org/)

**FolioCraft** is a full-stack web application designed to solve a common problem for developers and designers: maintaining both an online portfolio and a job-application-ready resume. Instead of duplicating work across multiple tools, FolioCraft uses a single unified input to instantly generate an interactive web portfolio, responsive multi-device previews, and a recruiter-ready ATS PDF resume.

Built and designed by **Zainab Salman**.

---

## 🌟 Key Features

### 📄 ATS Resume Studio & Vector PDF Export
- **4 Professional Templates:**
  - **Modern Minimalist:** Clean layout with subtle divider borders and balanced vertical rhythm.
  - **Tech Architect:** High-density two-column layout optimized for software engineers and technical leads.
  - **Harvard Classic:** Traditional serif typography trusted for corporate, academic, and executive roles.
  - **Executive Modern:** Polished header hierarchy with prominent impact metrics.
- **Strict 1-Page & 2-Page Fitting:** Dynamic container height calculation with visual boundary warnings preventing awkward page overflows.
- **High-DPI PDF Generation:** Vector-quality export powered by `html2canvas-pro` and `jspdf` with full support for modern CSS color formats (`oklch`).
- **Plain-Text ATS Copy:** One-click copy formatted plain-text for easy pasting into applicant tracking systems (Workday, Greenhouse, Lever).

### 🖥️ Real-Time Responsive Portfolio Simulator
- **Live Split-Screen Editor:** Real-time updates as you type your experience, projects, skills, and bio.
- **Multi-Device Frame Testing:** Switch seamlessly between:
  - **Desktop Viewport** (`1440px`)
  - **iPad / Tablet Frame** (`768px`)
  - **Mobile Phone Frame** (`375px`)
- **Mobile-First Experience:** Includes a thumb-friendly bottom navigation bar and responsive drawers for smaller screens.

### 🌐 3D Interactive Onboarding (Three.js)
- **WebGL Background Scene:** Custom Three.js canvas featuring dynamic starfield particles, orbiting geometric clusters, and ambient lighting.
- **Guided Product Tour:** Step-by-step introduction to FolioCraft's unified input, theme switcher, ATS formatting, and export workflows.

### 🗄️ Multi-Resume Cloud Storage & Auto-Sync
- **PostgreSQL Database:** Powered by Drizzle ORM and Express to save, update, rename, and manage multiple resumes per account.
- **Debounced Auto-Save:** Automatically syncs changes in the background so your work is never lost.
- **Public Share Links:** Share a direct preview link (`/api/public/resume/:id`) with recruiters or clients without requiring them to log in.

### 🔐 Authentication & Instant Guest Access
- **Supabase Authentication:** Secure email and password login and account creation.
- **Instant Guest Mode:** Start building and designing immediately without signing up—all data works locally with zero friction.

### 🚀 Standalone HTML & Social Sharing
- **Single-File HTML Export:** Download your entire portfolio as a self-contained `.html` file that runs completely offline with embedded CSS.
- **Social SEO Preview:** Live simulator previewing how your portfolio link card looks on Twitter/X, LinkedIn, and WhatsApp.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide React icons
- **3D Graphics:** Three.js (WebGL)
- **PDF Engine:** jsPDF, html2canvas-pro
- **Backend:** Node.js, Express 4.x
- **Database:** PostgreSQL, Drizzle ORM
- **Authentication:** Supabase Auth
- **Bundler & Dev Server:** Vite

---

## 📂 Project Structure

- **src/components**
  - `AppWalkthrough.tsx` : Step-by-step 3D product tour
  - `ThreeCanvas.tsx` : Three.js WebGL scene & particle orbits
  - `AuthModal.tsx` : Supabase sign-in, signup & guest dialog
  - `EditorPanel.tsx` : Unified input (Profile, Work, Skills, Projects)
  - `ResumeView.tsx` : 4 ATS templates, spacing & PDF export
  - `PortfolioRenderer.tsx` : Live web portfolio presentation engine
  - `DeviceFrame.tsx` : Responsive desktop/tablet/mobile simulator
  - `MobileBottomNav.tsx` : Mobile thumb navigation bar
  - `Navbar.tsx` : Top navigation bar & action menu
  - `MyResumesModal.tsx` : Multi-resume switcher & cloud manager
  - `SharePreviewModal.tsx` : Public shareable link generator
  - `ExportModal.tsx` : Standalone HTML bundle exporter
  - `SocialSharePreview.tsx` : OpenGraph & Twitter social card tester

- **src/context**
  - `AuthContext.tsx` : Supabase auth state & cloud sync engine

- **src/data**
  - `presets.ts` : Clean blank canvas & industry archetype presets
  - `templates.ts` : Field templates & sample data structures

- **src/db**
  - `schema.ts` : PostgreSQL Drizzle database schema
  - `drizzle.config.ts` : Database configuration

- **src/types**
  - `portfolio.ts` : TypeScript data models

- **src/utils**
  - `exportHtml.ts` : Bundles self-contained offline HTML

- **Root & Configuration**
  - `App.tsx` : Main application controller & routing
  - `main.tsx` : Client entry point
  - `index.css` : Global styles & Tailwind CSS
  - `server.ts` : Express backend server
  - `vite.config.ts` : Vite build configuration
  - `package.json` : Dependencies & build scripts

---

## 👩‍💻 Developed By

**Zainab Salman**  
- **Role:** Full-Stack Developer  
- **Email:** zainabsalman992@gmail.com  
