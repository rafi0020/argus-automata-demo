import React from 'react';
import { useAppStore } from '../store/appStore';
import type { ModuleType } from '../types';

const moduleColors: Record<ModuleType, string> = {
  intrusion: '#00d4aa', throwing: '#ff6b35', vehicle: '#3b82f6', collision: '#ff3366', ppe: '#a855f7',
};

export const Timeline: React.FC<{ onSeek: (time: number) => void }> = ({ onSeek }) => {
  const { videoTime, videoDuration, timelineEvents } = useAppStore();
  const progress = videoDuration > 0 ? (videoTime / videoDuration) * 100 : 0;
  
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  
  return (
    <div className="panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide">Timeline</div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-argus-accent mono">{formatTime(videoTime)} / {formatTime(videoDuration)}</span>
          <div className="flex gap-2">
            {Object.entries(moduleColors).map(([m, c]) => (
              <div key={m} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-slate-500 capitalize text-[10px]">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div 
        className="relative h-12 bg-argus-secondary rounded cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          onSeek(pct * videoDuration);
        }}
      >
        <div className="absolute inset-0 flex items-center px-2">
          <div className="w-full h-1 bg-argus-border rounded-full relative">
            <div className="absolute left-0 top-0 h-full bg-argus-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-argus-accent rounded-full shadow-lg transition-all" style={{ left: `calc(${progress}% - 6px)` }} />
          </div>
        </div>
        
        {timelineEvents.map((ev) => {
          const pos = videoDuration > 0 ? (ev.time / videoDuration) * 100 : 0;
          return (
            <div
              key={ev.id}
              className="timeline-marker"
              style={{ left: `${pos}%`, top: '50%', backgroundColor: moduleColors[ev.module] }}
              onClick={(e) => { e.stopPropagation(); onSeek(ev.time); }}
              title={`${ev.description} at ${formatTime(ev.time)}`}
            />
          );
        })}
      </div>
      
      {timelineEvents.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {timelineEvents.slice(-8).map((ev) => (
            <button
              key={ev.id}
              onClick={() => onSeek(ev.time)}
              className="flex-shrink-0 px-3 py-1.5 rounded text-xs hover:bg-argus-accent/20"
              style={{ backgroundColor: `${moduleColors[ev.module]}15`, borderLeft: `3px solid ${moduleColors[ev.module]}` }}
            >
              <div className="font-medium" style={{ color: moduleColors[ev.module] }}>{ev.type === 'alert_start' ? '▶ START' : '■ END'}</div>
              <div className="text-slate-500">{formatTime(ev.time)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

