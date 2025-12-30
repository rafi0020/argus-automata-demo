import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/appStore';
import { getAlerts, clearAllAlerts, exportAlertsAsJSON, getAlertStats } from '../../store/alertStore';
import type { Alert, ModuleType } from '../../types';

const moduleColors: Record<ModuleType, string> = {
  intrusion: 'bg-emerald-500/20 text-emerald-400',
  throwing: 'bg-orange-500/20 text-orange-400',
  vehicle: 'bg-blue-500/20 text-blue-400',
  collision: 'bg-red-500/20 text-red-400',
  ppe: 'bg-purple-500/20 text-purple-400',
};

export const AlertsTab: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { senderState } = useAppStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<{ total: number; unprocessed: number; processed: number } | null>(null);
  
  const load = useCallback(async () => {
    setAlerts(await getAlerts(50));
    setStats(await getAlertStats());
  }, []);
  
  useEffect(() => { load(); const i = setInterval(load, 1000); return () => clearInterval(i); }, [load]);
  
  const handleClear = async () => { if (confirm('Clear all alerts?')) { await clearAllAlerts(); load(); } };
  const handleExport = async () => {
    const json = await exportAlertsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `alerts_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };
  
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();
  
  if (compact) {
    return (
      <div className="space-y-2">
        {alerts.slice(0, 10).map((a) => (
          <div key={a.id} className={`alert-row ${a.processed === 0 ? 'unprocessed' : 'processed'}`}>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 text-xs rounded ${moduleColors[a.module]}`}>{a.module.toUpperCase()}</span>
              <span className="text-xs text-slate-500">{formatTime(a.detected_time)}</span>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No alerts</div>}
      </div>
    );
  }
  
  return (
    <div className="space-y-4 animate-fadeIn">
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Total</div><div className="text-lg font-bold mono text-argus-accent">{stats.total}</div>
          </div>
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Pending</div><div className="text-lg font-bold mono text-argus-warning">{stats.unprocessed}</div>
          </div>
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Sent</div><div className="text-lg font-bold mono text-argus-accent">{stats.processed}</div>
          </div>
          <div className="p-2 bg-argus-surface rounded border border-argus-border text-center">
            <div className="text-xs text-slate-500">Sender</div>
            <div className={`text-sm font-bold ${senderState.isRunning ? 'text-green-400' : 'text-slate-500'}`}>{senderState.isRunning ? 'ACTIVE' : 'STOPPED'}</div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <button onClick={handleExport} className="px-3 py-1 text-xs bg-argus-surface text-slate-400 hover:text-white rounded">Export</button>
        <button onClick={handleClear} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded">Clear</button>
      </div>
      
      <div className="border border-argus-border rounded overflow-hidden max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-argus-secondary sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-slate-500 uppercase">ID</th>
              <th className="px-3 py-2 text-left text-xs text-slate-500 uppercase">Module</th>
              <th className="px-3 py-2 text-left text-xs text-slate-500 uppercase">State</th>
              <th className="px-3 py-2 text-left text-xs text-slate-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className={`border-t border-argus-border/50 ${a.processed === 0 ? 'bg-argus-warning/5' : ''}`}>
                <td className="px-3 py-2 mono text-slate-400">{a.id}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded ${moduleColors[a.module]}`}>{a.module}</span></td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded ${a.state === 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{a.state === 1 ? 'START' : 'END'}</span></td>
                <td className="px-3 py-2 mono text-slate-400">{formatTime(a.detected_time)}</td>
              </tr>
            ))}
            {alerts.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No alerts</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

