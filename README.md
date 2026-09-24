# FolioCraft — Professional Portfolio & Resume Builder

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

**FolioCraft** is an all-in-one developer and designer portfolio platform and ATS resume builder. Create, customize, and publish your personal portfolio and download publication-ready resumes with zero backend setup.

---

## ✨ Features

### 🖥️ 1. Real-Time Split-Screen Studio
- **Live Preview:** See changes reflect instantly as you type.
- **Multi-Device Simulator:** Test your site across Desktop (`1440px`), Tablet (`768px`), and Mobile (`375px`) viewports.
- **Full Responsiveness:** Optimized for desktop computers, laptops, iPads, tablets, and smartphones (iOS & Android) with a dedicated thumb-friendly mobile bottom navigation bar.

### 📄 2. ATS Resume Studio & Direct PDF Export
- **4 Professional Templates:**
  - *Modern Minimalist* — Clean, contemporary layout with subtle accent borders.
  - *Tech Architect* — Compact, high-density two-column layout ideal for engineering leads.
  - *Harvard Classic* — Traditional serif typography, trusted for corporate, academic, and executive roles.
  - *Executive Modern* — Elegant typography with balanced vertical rhythm.
- **Smart 1-Page / 2-Page Fitting:** Dynamic scaling algorithm ensures your content fits standard A4/US Letter sheets without awkward overflowing pages.
- **Live Page-Break Boundary Guides:** Visual markers show exactly where pages break before you print or download.
- **Vector & High-DPI PDF Generation:** Powered by `html2canvas-pro` and `jspdf` with full CSS Color Module Level 4 (`oklch`) support.
- **Plain-Text ATS Export:** 1-click copy formatted plain-text for easy pasting into automated job application forms.

### 🎨 3. Design Archetypes & Customization
- **Clean Canvas by Default:** Starts with a clean, blank template so shared links never display confusing mock data.
- **Inspirational Presets:** Switch anytime to curated archetypes (*Product Designer*, *Full-Stack Engineer*, *Art Director*, *Open Source Contributor*).
- **Theme Engine:** Customize typography (Sans, Serif, Display, Mono), accent colors, border radiuses, and density.
- **Section Controls:** Freely toggle or reorder Hero, About, Projects, Experience, Education, Skills, Key Numbers (Metrics), Testimonials, and Contact.

### 🚀 4. Deployment & Export Tools
- **One-Click Standalone HTML:** Download your entire portfolio as a self-contained, offline-ready `.html` file with embedded styles.
- **GitHub Sync Modal:** Direct instructions and workflow to push to GitHub repositories and deploy on Vercel, Netlify, or GitHub Pages.
- **Social SEO & OpenGraph:** Live preview of how your portfolio card appears when shared on Twitter/X, LinkedIn, and WhatsApp.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF Engine:** [html2canvas-pro](https://github.com/niklasvh/html2canvas) & [jsPDF](https://github.com/parallax/jsPDF)
- **Tooling:** [Vite](https://vitejs.dev/)

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/foliocraft.git
   cd foliocraft
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready assets will be created in the `dist/` directory.

---

## 📂 Project Structure

```text
├── src/
│   ├── components/            # UI Components & Modules
│   │   ├── EditorPanel.tsx    # Content editor (Profile, Projects, Experience, Stats)
│   │   ├── ResumeView.tsx     # Resume builder with ATS templates & PDF engine
│   │   ├── PortfolioRenderer.tsx # Interactive portfolio presentation component
│   │   ├── DeviceFrame.tsx    # Responsive viewport frame (Desktop / Tablet / Mobile)
│   │   ├── MobileBottomNav.tsx # Dedicated navigation for mobile and tablet screens
│   │   ├── Navbar.tsx         # Desktop top navigation and actions hub
│   │   ├── ThemeStudio.tsx    # Theme, font, and color configuration
│   │   ├── ExportModal.tsx    # JSON and Standalone HTML export dialog
│   │   └── SocialSharePreview.tsx # OpenGraph & Twitter social card preview
│   ├── data/
│   │   └── presets.ts         # Blank starter canvas & archetype demo presets
│   ├── types/
│   │   └── portfolio.ts       # TypeScript schemas and data structures
│   ├── utils/
│   │   └── exportHtml.ts      # Standalone single-file HTML generator
│   ├── App.tsx                # Main app state controller & view router
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles & Tailwind CSS v4 directives
├── public/                    # Static assets & icons
├── metadata.json              # App configuration & permissions
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy FolioCraft to production"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **"Deploy"** — your live link will be ready in under a minute!

---
