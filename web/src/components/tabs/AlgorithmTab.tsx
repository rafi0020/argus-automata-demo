import React from 'react';
import { useAppStore } from '../../store/appStore';

export const AlgorithmTab: React.FC = () => {
  const { activeModule, mockData } = useAppStore();
  const t = mockData?.thresholds || {};
  
  const content: Record<string, { title: string; color: string; steps: string[]; params: [string, any][] }> = {
    intrusion: {
      title: '🚷 Perimeter Intrusion Detection',
      color: 'text-argus-accent',
      steps: [
        'Define ROI polygon for restricted zone',
        'For each person, compute bottom_center point',
        'Test if bottom_center ∈ ROI using ray casting',
        `Add result to persistence buffer (size: ${t.buffer_size || 5})`,
        `If count(true) ≥ ${t.threshold || 3}, transition to State 1`,
        'Emit "start" alert on 0→1, "end" alert on 1→0',
      ],
      params: [['Buffer Size', t.buffer_size || 5], ['Threshold', t.threshold || 3]],
    },
    throwing: {
      title: '🗑️ Throwing Detection',
      color: 'text-argus-warning',
      steps: [
        'Track persons with unique IDs',
        'Classify each detection as "throwing" or "normal"',
        `Apply class smoothing: mean of last ${t.smoothing_window || 3} frames, then round`,
        'Count consecutive frames with smoothed class = throwing',
        `If consecutive count reaches ${t.consecutive_threshold || 10}, trigger alert`,
      ],
      params: [['Smoothing Window', t.smoothing_window || 3], ['Consecutive Threshold', t.consecutive_threshold || 10]],
    },
    vehicle: {
      title: '🚗 Vehicle Overspeed Detection',
      color: 'text-argus-info',
      steps: [
        'Track vehicles (car, truck, bus, motorcycle)',
        'Extract centroid from each detection',
        'Apply Kalman filter to smooth centroid trajectory',
        'Compute velocity from Kalman state',
        `Convert to real-world speed using calibration factor (${t.meters_per_pixel || 0.05} m/px)`,
        `If speed > ${t.speed_threshold || 30} km/h, trigger alert with cooldown`,
      ],
      params: [['Speed Threshold', `${t.speed_threshold || 30} km/h`], ['m/pixel', t.meters_per_pixel || 0.05], ['Cooldown', `${t.alert_cooldown || 30}s`]],
    },
    collision: {
      title: '⚠️ Collision Risk Detection',
      color: 'text-argus-danger',
      steps: [
        'Track all humans and vehicles',
        'For each human-vehicle pair, compute distance',
        `If distance < ${t.collision_distance || 100}px, add to pair buffer`,
        `When buffer fills (${t.collision_buffer || 5} frames), trigger alert`,
        `Apply cooldown (${t.collision_cooldown || 30}s) per pair`,
      ],
      params: [['Distance Threshold', `${t.collision_distance || 100}px`], ['Buffer Size', t.collision_buffer || 5], ['Cooldown', `${t.collision_cooldown || 30}s`]],
    },
    ppe: {
      title: '🦺 PPE Compliance Detection',
      color: 'text-purple-400',
      steps: [
        'Track persons within ROI',
        'Detect required PPE: helmet, vest, gloves, shoes',
        'Identify missing items for each track',
        `Increment violation counter for consecutive frames`,
        `If counter reaches ${t.ppe_persistence || 15}, trigger alert`,
        `Apply per-track cooldown (${t.ppe_cooldown || 60}s)`,
      ],
      params: [['Persistence Threshold', `${t.ppe_persistence || 15} frames`], ['Cooldown', `${t.ppe_cooldown || 60}s`]],
    },
  };
  
  const c = content[activeModule];
  
  return (
    <div className="space-y-4 animate-fadeIn">
      <h3 className={`text-lg font-semibold ${c.color}`}>{c.title}</h3>
      <div className="p-4 bg-argus-secondary/50 rounded-lg border border-argus-border">
        <h4 className="font-medium text-sm text-slate-300 mb-2">Logic Flow</h4>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-400">
          {c.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {c.params.map(([label, value]) => (
          <div key={label} className="p-3 bg-argus-surface rounded border border-argus-border">
            <div className="text-xs text-slate-500 uppercase">{label}</div>
            <div className={`text-xl font-bold mono ${c.color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

