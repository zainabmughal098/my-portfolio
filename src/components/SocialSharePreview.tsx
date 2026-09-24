import React, { useState } from 'react';
import { PortfolioData } from '../types/portfolio';
import { Share2, Copy, Check, ExternalLink, Globe, Twitter, Linkedin } from 'lucide-react';

interface SocialSharePreviewProps {
  data: PortfolioData;
}

export const SocialSharePreview: React.FC<SocialSharePreviewProps> = ({ data }) => {
  const { personal, projects, theme } = data;
  const [platform, setPlatform] = useState<'twitter' | 'linkedin'>('twitter');
  const [copied, setCopied] = useState(false);

  const heroImage = personal.avatarUrl || (projects[0] && projects[0].imageUrl) || '';

  const metaHtml = `<!-- Essential OpenGraph Social Meta Tags -->
<title>${personal.name} — ${personal.roleTitle}</title>
<meta name="description" content="${personal.headline}" />
<meta property="og:title" content="${personal.name} — ${personal.roleTitle}" />
<meta property="og:description" content="${personal.headline}" />
<meta property="og:image" content="${heroImage}" />
<meta property="og:type" content="profile" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${personal.name} — ${personal.roleTitle}" />
<meta name="twitter:description" content="${personal.headline}" />
<meta name="twitter:image" content="${heroImage}" />`;

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(metaHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 text-slate-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
          <Share2 className="w-3.5 h-3.5" />
          <span>SEO & Social Cards</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Social Share & OpenGraph Preview
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Preview how your portfolio looks when shared on Twitter, LinkedIn, Slack, and messaging apps.
        </p>
      </div>

      {/* Platform Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPlatform('twitter')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            platform === 'twitter' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>X / Twitter Card</span>
        </button>
        <button
          onClick={() => setPlatform('linkedin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            platform === 'linkedin' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn Card</span>
        </button>
      </div>

      {/* Social Card Simulator */}
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
        {platform === 'twitter' && (
          <div className="w-full max-w-lg bg-black text-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {heroImage ? (
              <div className="w-full h-52 overflow-hidden bg-slate-900 relative">
                <img
                  src={heroImage}
                  alt={personal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-44 bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center font-bold text-xl">
                {personal.name}
              </div>
            )}
            <div className="p-3.5 bg-[#16181c]">
              <div className="text-[11px] text-slate-400 truncate">
                portfolio.me
              </div>
              <div className="text-sm font-bold truncate mt-0.5">
                {personal.name} — {personal.roleTitle}
              </div>
              <div className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                {personal.headline}
              </div>
            </div>
          </div>
        )}

        {platform === 'linkedin' && (
          <div className="w-full max-w-lg bg-[#1b1f23] text-white rounded-lg border border-slate-700 overflow-hidden shadow-2xl">
            {heroImage ? (
              <div className="w-full h-56 overflow-hidden bg-slate-900">
                <img
                  src={heroImage}
                  alt={personal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-44 bg-slate-800 flex items-center justify-center font-bold text-xl">
                {personal.name}
              </div>
            )}
            <div className="p-3 bg-[#24292e]">
              <div className="text-sm font-bold truncate">
                {personal.name} — {personal.roleTitle}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                portfolio.me · 1 min read
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copy Meta Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Generated HTML Meta Tags
          </label>
          <button
            onClick={handleCopyMeta}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Tags</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Meta Tags</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
          {metaHtml}
        </pre>
      </div>
    </div>
  );
};
