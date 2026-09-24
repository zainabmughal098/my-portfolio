import React from 'react';
import { DeviceMode } from './Navbar';

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ deviceMode, children }) => {
  if (deviceMode === 'responsive') {
    return <div className="w-full h-full overflow-y-auto">{children}</div>;
  }

  const getWidthStyle = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] my-6 rounded-[36px] shadow-2xl border-[8px] border-slate-800 bg-slate-950';
      case 'tablet':
        return 'w-[768px] my-6 rounded-[24px] shadow-2xl border-[10px] border-slate-800 bg-slate-950';
      case 'desktop':
      default:
        return 'w-[1440px] max-w-full my-4 rounded-xl shadow-2xl border border-slate-800 bg-slate-950';
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-start overflow-y-auto bg-slate-950/80 p-4">
      <div className={`transition-all duration-300 overflow-hidden flex flex-col ${getWidthStyle()}`}>
        {/* Device status/camera notch for mobile & tablet */}
        {deviceMode === 'mobile' && (
          <div className="h-6 bg-slate-800 flex items-center justify-center shrink-0">
            <div className="w-16 h-3.5 bg-slate-950 rounded-full" />
          </div>
        )}

        {/* Browser address bar simulation for desktop/tablet */}
        {deviceMode === 'desktop' && (
          <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 text-xs text-slate-400 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-slate-950 px-3 py-0.5 rounded text-[11px] text-slate-400 text-center font-mono border border-slate-800 truncate">
              https://portfolio.me
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
