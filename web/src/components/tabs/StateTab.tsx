import React from 'react';
import { useAppStore } from '../../store/appStore';

export const StateTab: React.FC = () => {
  const { activeModule, intrusionState, throwingState, vehicleState, collisionState, ppeState, videoTime } = useAppStore();
  
  const renderBuffer = (buffer: boolean[], label: string) => (
    <div className="mb-4">
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{label}</div>
      <div className="flex gap-1">
        {buffer.length === 0 ? <span className="text-sm text-slate-500 italic">Empty</span> :
          buffer.map((val, i) => (
            <div key={i} className={`buffer-cell ${val ? 'filled' : 'empty'}`}>{val ? '1' : '0'}</div>
          ))}
      </div>
    </div>
  );
  
  if (activeModule === 'intrusion') {
    const s = intrusionState;
    return (
      <div className="space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-argus-accent uppercase">Intrusion State</h3>
        <div className={`p-4 rounded-lg border ${s.currentState === 1 ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Current State</span>
            <span className={`state-indicator ${s.currentState === 1 ? 'danger' : 'active'}`}>
              {s.currentState === 1 ? 'INTRUSION' : 'CLEAR'}
            </span>
          </div>
        </div>
        {renderBuffer(s.buffer, 'Detection Buffer')}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-argus-surface rounded border border-argus-border">
            <div className="text-xs text-slate-500">Buffer Count (true)</div>
            <div className="text-xl font-bold mono text-argus-accent">{s.buffer.filter(Boolean).length} / {s.threshold}</div>
          </div>
          <div className="p-3 bg-argus-surface rounded border border-argus-border">
            <div className="text-xs text-slate-500">Last State Change</div>
            <div className="text-xl font-bold mono text-argus-accent">{s.lastStateChangeTime?.toFixed(2) ?? '—'}s</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeModule === 'throwing') {
    const tracks = Array.from(throwingState.tracks.entries());
    return (
      <div className="space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-argus-warning uppercase">Throwing State</h3>
        {tracks.length === 0 ? <div className="p-4 bg-argus-surface rounded border border-argus-border text-slate-500 text-sm">No active tracks</div> :
          tracks.map(([id, t]) => (
            <div key={id} className="p-4 bg-argus-surface rounded border border-argus-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Track #{id}</span>
                <span className={`state-indicator ${t.smoothedClass === 1 ? 'warning' : 'inactive'}`}>
                  {t.smoothedClass === 1 ? 'THROWING' : 'NORMAL'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-1">
                Consecutive: <span className="mono text-argus-warning">{t.consecutiveCount} / {throwingState.consecutiveThreshold}</span>
              </div>
              <div className="h-2 bg-argus-secondary rounded-full overflow-hidden">
                <div className="h-full bg-argus-warning transition-all" style={{ width: `${(t.consecutiveCount / throwingState.consecutiveThreshold) * 100}%` }} />
              </div>
            </div>
          ))}
      </div>
    );
  }
  
  if (activeModule === 'vehicle') {
    const tracks = Array.from(vehicleState.tracks.entries());
    return (
      <div className="space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-argus-info uppercase">Vehicle State</h3>
        {tracks.length === 0 ? <div className="p-4 bg-argus-surface rounded border border-argus-border text-slate-500 text-sm">No active tracks</div> :
          tracks.map(([id, t]) => {
            const isOver = t.computedSpeed > vehicleState.speedThreshold;
            return (
              <div key={id} className={`p-4 rounded border ${isOver ? 'bg-red-500/10 border-red-500/50' : 'bg-argus-surface border-argus-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Vehicle #{id}</span>
                  <span className={`state-indicator ${isOver ? 'danger' : 'active'}`}>{t.computedSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="text-xs text-slate-500">
                  Kalman vx: <span className="mono">{t.kalmanState.vx.toFixed(1)}</span> | vy: <span className="mono">{t.kalmanState.vy.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
      </div>
    );
  }
  
  if (activeModule === 'collision') {
    const pairs = Array.from(collisionState.pairs.entries());
    return (
      <div className="space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-argus-danger uppercase">Collision State</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Buffer Size</div>
            <div className="mono text-argus-danger">{collisionState.bufferSize}</div>
          </div>
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Cooldown</div>
            <div className="mono text-argus-danger">{collisionState.cooldownSeconds}s</div>
          </div>
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Active Pairs</div>
            <div className="mono text-argus-danger">{pairs.length}</div>
          </div>
        </div>
        {pairs.map(([key, p]) => (
          <div key={key} className="p-3 bg-argus-surface rounded border border-argus-border">
            <div className="text-sm mb-2">Pair: {key.replace('-', ' ↔ ')}</div>
            {renderBuffer(p.buffer, 'Proximity Buffer')}
          </div>
        ))}
      </div>
    );
  }
  
  if (activeModule === 'ppe') {
    const tracks = Array.from(ppeState.tracks.entries());
    return (
      <div className="space-y-4 animate-fadeIn">
        <h3 className="text-sm font-semibold text-purple-400 uppercase">PPE Compliance State</h3>
        {tracks.length === 0 ? <div className="p-4 bg-argus-surface rounded border border-argus-border text-slate-500 text-sm">No persons tracked</div> :
          tracks.map(([id, t]) => {
            const hasViolation = t.lastViolations.length > 0;
            return (
              <div key={id} className={`p-4 rounded border ${hasViolation ? 'bg-purple-500/10 border-purple-500/50' : 'bg-argus-surface border-argus-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Person #{id}</span>
                  <span className={`state-indicator ${hasViolation ? 'warning' : 'active'}`}>
                    {hasViolation ? 'NON-COMPLIANT' : 'COMPLIANT'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-1">
                  Violation Frames: <span className="mono text-purple-400">{t.violationFrames} / {ppeState.persistenceThreshold}</span>
                </div>
                <div className="h-2 bg-argus-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${(t.violationFrames / ppeState.persistenceThreshold) * 100}%` }} />
                </div>
                {hasViolation && (
                  <div className="flex gap-2 mt-2">
                    {t.lastViolations.map(v => <span key={v} className="px-2 py-0.5 text-xs bg-red-500/30 text-red-400 rounded">{v}</span>)}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  }
  
  return null;
};

