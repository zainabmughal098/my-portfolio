import React, { useState } from 'react';
import {
  X,
  Github,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Globe,
  HelpCircle,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/zainabmughal098/my-portfolio.git');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const sanitizedUrl = repoUrl.trim() || 'https://github.com/YOUR_USERNAME/my-portfolio.git';

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commandSteps = [
    {
      title: '1. Create a New Repository on GitHub',
      desc: 'Go to GitHub and create a new public or private repository (without initializing README or .gitignore).',
      url: 'https://github.com/new',
      cmd: '',
    },
    {
      title: '2. Connect Your Local Git to Your GitHub Remote',
      desc: 'Run this command in your project terminal to link this repository to your GitHub:',
      cmd: `git remote add origin ${sanitizedUrl}`,
    },
    {
      title: '3. Push Your Initial Code to GitHub',
      desc: 'Push the entire portfolio codebase and all assets to your main branch:',
      cmd: `git branch -M main\ngit push -u origin main`,
    },
    {
      title: '4. Ongoing Workflow (Keep Pushing Updates)',
      desc: 'Whenever you make edits or customize your portfolio, push your updates in one line:',
      cmd: `git add .\ngit commit -m "Update portfolio content and styling"\ngit push`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Link & Push to GitHub
              </h2>
              <p className="text-xs text-slate-400">
                Continuous version control and automatic hosting for your portfolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Quick interactive repository input */}
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Enter Your GitHub Repository URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. https://github.com/username/my-portfolio.git"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500"
              />
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>New Repo</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              The terminal commands below dynamically update with your repository URL.
            </p>
          </div>

          {/* Step-by-step commands */}
          <div className="space-y-4">
            {commandSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-200">
                    {step.title}
                  </h3>
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Open GitHub.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-400">{step.desc}</p>

                {step.cmd && (
                  <div className="relative mt-2">
                    <pre className="p-3 bg-black/60 rounded-md text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80">
                      {step.cmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(step.cmd, idx)}
                      className="absolute top-2 right-2 px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-[11px] rounded text-slate-300 flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* GitHub Pages 1-Click Free Hosting Guide */}
          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
              <Globe className="w-4 h-4" />
              <span>Free Instant Hosting via GitHub Pages or Vercel</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Once pushed to GitHub, your portfolio can be published for free with SSL on custom domains:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
              <li>
                <strong>GitHub Pages:</strong> Go to your GitHub repo &rarr; <span className="text-slate-200">Settings</span> &rarr; <span className="text-slate-200">Pages</span> &rarr; select branch <code className="text-emerald-400 font-mono">main</code> &rarr; click <span className="text-slate-200">Save</span>.
              </li>
              <li>
                <strong>Vercel / Netlify:</strong> Connect your GitHub repo in 1 click for automatic continuous deployment on every git push!
              </li>
            </ul>
          </div>

          {/* Git status verified badge */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Git repository initialized on branch 'main'</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
