import React from 'react';
import { useAppStore } from '../store/appStore';
import { AlgorithmTab } from './tabs/AlgorithmTab';
import { StateTab } from './tabs/StateTab';
import { ConfigTab } from './tabs/ConfigTab';
import { AlertsTab } from './tabs/AlertsTab';
import type { WhiteboxTab } from '../types';

const tabs: { id: WhiteboxTab; label: string; icon: string }[] = [
  { id: 'algorithm', label: 'Algorithm', icon: '⚙' },
  { id: 'state', label: 'State', icon: '📊' },
  { id: 'config', label: 'Config', icon: '🔧' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
];

export const WhiteboxPanel: React.FC = () => {
  const { whiteboxTab, setWhiteboxTab, viewMode } = useAppStore();
  
  if (viewMode === 'operator') {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">Alerts</div>
        <div className="flex-1 overflow-auto p-4"><AlertsTab compact /></div>
      </div>
    );
  }
  
  return (
    <div className="panel h-full flex flex-col">
      <div className="flex border-b border-argus-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setWhiteboxTab(tab.id)}
            className={`tab-button flex items-center gap-2 ${whiteboxTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {whiteboxTab === 'algorithm' && <AlgorithmTab />}
        {whiteboxTab === 'state' && <StateTab />}
        {whiteboxTab === 'config' && <ConfigTab />}
        {whiteboxTab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  );
};

