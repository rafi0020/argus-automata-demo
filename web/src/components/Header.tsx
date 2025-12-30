import React from 'react';
import { useAppStore } from '../store/appStore';
import type { ModuleType } from '../types';

const modules: { id: ModuleType; label: string; icon: string }[] = [
  { id: 'intrusion', label: 'Intrusion', icon: '🚷' },
  { id: 'throwing', label: 'Throwing', icon: '🗑️' },
  { id: 'vehicle', label: 'Vehicle Speed', icon: '🚗' },
  { id: 'collision', label: 'Collision Risk', icon: '⚠️' },
  { id: 'ppe', label: 'PPE Compliance', icon: '🦺' },
];

interface HeaderProps {
  onDocsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDocsClick }) => {
  const { viewMode, setViewMode, activeModule, setActiveModule, resetModuleStates, videoAvailable } = useAppStore();
  
  const handleModuleChange = (module: ModuleType) => {
    setActiveModule(module);
    resetModuleStates();
  };
  
  return (
    <header className="bg-argus-secondary/80 backdrop-filter backdrop-blur-sm border-b border-argus-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-argus-accent to-blue-500 flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Argus Automata</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Unilever KGF • {videoAvailable ? 'Video Mode' : 'Simulation Mode'}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex items-center gap-1">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModuleChange(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeModule === m.id ? 'bg-argus-accent text-argus-primary' : 'text-slate-400 hover:text-white hover:bg-argus-surface'
              }`}
            >
              <span className="mr-2">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-argus-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode('explain')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'explain' ? 'bg-argus-accent text-argus-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Explain
            </button>
            <button
              onClick={() => setViewMode('operator')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'operator' ? 'bg-argus-accent text-argus-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              👁️ Operator
            </button>
          </div>
          
          <button
            onClick={onDocsClick}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 transition-colors"
          >
            📚 Docs
          </button>
        </div>
      </div>
    </header>
  );
};

