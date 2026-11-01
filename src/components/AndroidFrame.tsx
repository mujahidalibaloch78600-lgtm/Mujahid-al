import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Tablet, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode: 'phone' | 'tablet' | 'full';
  onViewModeChange: (mode: 'phone' | 'tablet' | 'full') => void;
  notificationSlot?: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  viewMode,
  onViewModeChange,
  notificationSlot,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (viewMode === 'full') {
    return (
      <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
        {/* Compact Android Status Bar with Mode Switcher */}
        <div className="h-8 bg-[#075E54] text-white/90 text-xs px-4 flex items-center justify-between select-none z-30">
          <div className="flex items-center space-x-3">
            <span className="font-semibold tracking-wide text-xs">{currentTime}</span>
            <div className="flex items-center space-x-1 bg-black/20 p-0.5 rounded-md text-[10px]">
              <button
                onClick={() => onViewModeChange('phone')}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white"
              >
                Pixel 9 Pro
              </button>
              <button
                onClick={() => onViewModeChange('tablet')}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white"
              >
                Pixel Fold
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-medium tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white">
              RTD 5G
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <Signal className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-semibold">98%</span>
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Heads-up notification overlay */}
        {notificationSlot && (
          <div className="absolute top-10 left-4 right-4 z-50 pointer-events-auto">
            {notificationSlot}
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    );
  }

  const isTablet = viewMode === 'tablet';

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 min-h-[90vh]">
      {/* Viewport mode switcher header */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => onViewModeChange('phone')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'phone'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel 9 Pro</span>
          </button>
          <button
            onClick={() => onViewModeChange('tablet')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              isTablet
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Pixel Fold</span>
          </button>
          <button
            onClick={() => onViewModeChange('full')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium text-gray-600 hover:text-gray-900"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Jetpack Compose v1.7 • Material 3
        </span>
      </div>

      {/* Android Device Hardware Enclosure */}
      <div
        className={`relative transition-all duration-300 ease-in-out bg-[#1E1E1E] rounded-[48px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.1)_inset] border-4 border-[#2A2A2A] flex flex-col ${
          isTablet
            ? 'w-full max-w-[680px] h-[780px]'
            : 'w-full max-w-[390px] h-[740px]'
        }`}
      >
        {/* Device Screen Area */}
        <div className="relative w-full h-full bg-[#EFEAE2] rounded-[38px] overflow-hidden flex flex-col shadow-inner border border-black/10">
          {/* Android Status Bar */}
          <div className="h-9 bg-[#075E54] text-white px-5 flex items-center justify-between text-xs select-none z-30 shrink-0">
            <span className="font-semibold tracking-wide text-[12px]">{currentTime}</span>

            {/* Front Camera Cutout (Hole punch) */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#0F0F0F] ring-1 ring-white/10 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-950/80"></div>
            </div>

            {/* Status Icons */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-tight bg-white/20 px-1 rounded text-white">
                5G
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <Signal className="w-3.5 h-3.5" />
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-medium">98%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Android Heads-Up Push Notification Slot */}
          {notificationSlot && (
            <div className="absolute top-10 left-3 right-3 z-50 pointer-events-auto">
              {notificationSlot}
            </div>
          )}

          {/* App Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
            {children}
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="h-5 bg-white shrink-0 flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-gray-300 hover:bg-gray-400 rounded-full cursor-pointer transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
