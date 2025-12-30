import React from 'react';
import { useAppStore } from '../../store/appStore';

export const ConfigTab: React.FC = () => {
  const { activeModule, activeCamera, mockData, videoAvailable } = useAppStore();
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-sm font-semibold text-argus-accent uppercase">Camera Configuration</h3>
      
      <div className="p-4 bg-argus-surface rounded border border-argus-border">
        <div className="grid grid-cols-2 gap-4">
          <div><div className="text-xs text-slate-500 uppercase">Camera ID</div><div className="mono text-argus-accent">{activeCamera}</div></div>
          <div><div className="text-xs text-slate-500 uppercase">Active Module</div><div className="mono text-argus-accent capitalize">{activeModule}</div></div>
          <div><div className="text-xs text-slate-500 uppercase">Mode</div><div className={`mono ${videoAvailable ? 'text-green-400' : 'text-purple-400'}`}>{videoAvailable ? '📹 Video' : '🎮 Simulation'}</div></div>
          <div><div className="text-xs text-slate-500 uppercase">FPS</div><div className="mono text-argus-accent">{mockData?.fps || 25}</div></div>
        </div>
      </div>
      
      {mockData?.roi && (
        <div className="p-4 bg-argus-surface rounded border border-argus-border">
          <div className="text-sm font-medium text-slate-300 mb-2">ROI Polygon</div>
          <div className="mono text-xs text-slate-400 space-y-1">
            {mockData.roi.map((p, i) => <div key={i}>Point {i}: ({p.x.toFixed(0)}, {p.y.toFixed(0)})</div>)}
          </div>
        </div>
      )}
      
      {mockData?.thresholds && Object.keys(mockData.thresholds).length > 0 && (
        <div className="p-4 bg-argus-surface rounded border border-argus-border">
          <div className="text-sm font-medium text-slate-300 mb-2">Thresholds</div>
          <div className="space-y-2">
            {Object.entries(mockData.thresholds).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</span>
                <span className="mono text-argus-accent">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

