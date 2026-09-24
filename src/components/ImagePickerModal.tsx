import React, { useState } from 'react';
import { X, Upload, Check, Image as ImageIcon, Link2 } from 'lucide-react';
import avatarDesigner from '../assets/images/designer_avatar_1790269370230.jpg';
import showcaseFintech from '../assets/images/showcase_fintech_1790269388058.jpg';
import showcaseBranding from '../assets/images/showcase_branding_1790269404610.jpg';
import showcaseArchitecture from '../assets/images/showcase_architecture_1790269420330.jpg';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  title?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Select or Upload Image',
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const curatedPresets = [
    { name: 'Designer Portrait Headshot', url: avatarDesigner },
    { name: 'Fintech & Analytics Interface', url: showcaseFintech },
    { name: 'Editorial Branding Stationery', url: showcaseBranding },
    { name: 'Minimalist Architecture Pavilion', url: showcaseArchitecture },
  ];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onSelectImage(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drag & Drop File Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <div className="text-xs font-semibold text-white">
              Drag and drop an image file here
            </div>
            <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP, SVG</p>

            <label className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer transition-colors">
              Browse Computer
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Curated High-Res Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Or Pick from Curated Editorial Presets
            </label>
            <div className="grid grid-cols-2 gap-3">
              {curatedPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectImage(preset.url);
                    onClose();
                  }}
                  className="group flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500 transition-all text-left"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-10 h-10 rounded object-cover border border-slate-800"
                  />
                  <div className="truncate text-xs font-medium text-slate-300 group-hover:text-white">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              <span>Or Direct Image URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (customUrl.trim()) {
                    onSelectImage(customUrl.trim());
                    onClose();
                  }
                }}
                disabled={!customUrl.trim()}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
