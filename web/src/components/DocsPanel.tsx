import React, { useState } from 'react';

type DocSection = 'overview' | 'technical' | 'data-format' | 'deployment';

interface DocContent {
  title: string;
  content: React.ReactNode;
}

const docs: Record<DocSection, DocContent> = {
  overview: {
    title: 'Overview',
    content: (
      <div className="space-y-4">
        <p>
          <strong>Argus Automata</strong> is an intelligent video surveillance platform that detects 
          safety violations and security threats in industrial environments using AI-powered computer vision.
        </p>
        
        <h3 className="text-lg font-bold text-argus-accent mt-6">Detection Modules</h3>
        <div className="grid gap-3 mt-3">
          <div className="bg-argus-secondary/50 p-3 rounded-lg border border-argus-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚷</span>
              <span className="font-bold text-cyan-400">Perimeter Intrusion</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Monitors restricted zones and triggers alerts when unauthorized persons enter.
              Uses ROI polygon, persistence buffer, and track-based state machine.
            </p>
          </div>
          
          <div className="bg-argus-secondary/50 p-3 rounded-lg border border-argus-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗑️</span>
              <span className="font-bold text-orange-400">Throwing Detection</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Identifies waste disposal violations using pose/action classification.
              Uses class smoothing window and consecutive frame threshold.
            </p>
          </div>
          
          <div className="bg-argus-secondary/50 p-3 rounded-lg border border-argus-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚗</span>
              <span className="font-bold text-blue-400">Vehicle Overspeed</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Monitors vehicle speeds using homography-based real-world distance calculation.
              Uses Kalman filter for speed smoothing.
            </p>
          </div>
          
          <div className="bg-argus-secondary/50 p-3 rounded-lg border border-argus-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-bold text-red-400">Collision Risk</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Predicts potential human-vehicle collisions based on proximity.
              Uses pair buffers and distance-based risk calculation.
            </p>
          </div>
          
          <div className="bg-argus-secondary/50 p-3 rounded-lg border border-argus-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦺</span>
              <span className="font-bold text-purple-400">PPE Compliance</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Verifies workers are wearing required safety equipment (helmet, vest, gloves).
              Uses per-track violation persistence.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-argus-accent mt-6">View Modes</h3>
        <table className="w-full mt-3 text-sm">
          <thead>
            <tr className="border-b border-argus-border">
              <th className="text-left py-2 text-slate-400">Mode</th>
              <th className="text-left py-2 text-slate-400">Description</th>
              <th className="text-left py-2 text-slate-400">Audience</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-argus-border/50">
              <td className="py-2 font-mono text-cyan-400">Explain</td>
              <td className="py-2">Algorithm details, state internals, config</td>
              <td className="py-2 text-slate-400">Developers</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-cyan-400">Operator</td>
              <td className="py-2">Simplified view with alerts and status</td>
              <td className="py-2 text-slate-400">Security operators</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  
  technical: {
    title: 'Technical Architecture',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-argus-accent">System Architecture</h3>
        <pre className="bg-black/50 p-4 rounded-lg text-xs overflow-x-auto border border-argus-border">
{`┌─────────────────────────────────────────────────────────────┐
│                    Web Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Video/Canvas│  │  Whitebox   │  │     Timeline        │  │
│  │   Player    │  │   Panel     │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   Zustand Store                        │  │
│  │  (activeModule, mockData, videoTime, moduleStates)     │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Detection Processor Hook                  │  │
│  │  (processes frames → updates state → triggers alerts)  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   Parity Layer                         │  │
│  │  (geometry, buffers, kalman, state machines)           │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              IndexedDB (alerts.db)                     │  │
│  │  + Sender Simulator (marks processed, purges old)      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘`}
        </pre>

        <h3 className="text-lg font-bold text-argus-accent mt-6">Core Components</h3>
        
        <div className="space-y-3">
          <div className="bg-argus-secondary/30 p-3 rounded border border-argus-border">
            <h4 className="font-bold text-cyan-400">State Management (Zustand)</h4>
            <pre className="text-xs mt-2 text-slate-300">
{`interface AppState {
  activeModule: ModuleType;      // Current detection module
  viewMode: ViewMode;            // 'explain' | 'operator'
  mockData: MockDetectionData;   // Loaded JSON detection data
  videoTime: number;             // Current playback time
  isPlaying: boolean;            // Playback state
  currentFrame: FrameData;       // Current frame detections
  
  // Per-module state
  intrusionState, throwingState, vehicleState...
}`}
            </pre>
          </div>
          
          <div className="bg-argus-secondary/30 p-3 rounded border border-argus-border">
            <h4 className="font-bold text-cyan-400">Parity Layer Functions</h4>
            <ul className="text-sm mt-2 space-y-1 text-slate-300">
              <li>• <code className="text-orange-400">isPointInPolygon()</code> - Ray casting for ROI check</li>
              <li>• <code className="text-orange-400">PersistenceBuffer</code> - Circular buffer for frame persistence</li>
              <li>• <code className="text-orange-400">CooldownTracker</code> - Time-based cooldown management</li>
              <li>• <code className="text-orange-400">SimpleKalman</code> - 1D Kalman filter for smoothing</li>
            </ul>
          </div>
        </div>

        <h3 className="text-lg font-bold text-argus-accent mt-6">Detection Algorithms</h3>
        
        <div className="bg-argus-secondary/30 p-3 rounded border border-argus-border">
          <h4 className="font-bold text-cyan-400">Perimeter Intrusion State Machine</h4>
          <pre className="text-xs mt-2 text-green-400">
{`OUTSIDE ──[enters ROI]──> ENTERING ──[buffer threshold]──> INSIDE
   ↑                                                          │
   └──────────────────[exits ROI]─────────────────────────────┘`}
          </pre>
          <p className="text-sm text-slate-400 mt-2">
            1. Get person's bottom_center point<br/>
            2. Check if point is inside ROI polygon<br/>
            3. Push result to persistence buffer<br/>
            4. If buffer count ≥ threshold → INSIDE state<br/>
            5. Trigger alert on OUTSIDE→INSIDE transition
          </p>
        </div>
      </div>
    ),
  },
  
  'data-format': {
    title: 'Data Format',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-argus-accent">JSON Schema</h3>
        
        <div className="bg-argus-secondary/30 p-3 rounded border border-argus-border">
          <h4 className="font-bold text-cyan-400">MockDetectionData</h4>
          <pre className="text-xs mt-2 text-slate-300 overflow-x-auto">
{`{
  "camera_id": "cam_entrance_01",
  "module": "intrusion",
  "fps": 25,
  "roi": [
    {"x": 120, "y": 100},
    {"x": 520, "y": 100},
    {"x": 520, "y": 380},
    {"x": 120, "y": 380}
  ],
  "thresholds": {
    "buffer_size": 5,
    "threshold": 3,
    "cooldown_seconds": 30
  },
  "frames": [
    {
      "t": 0.0,
      "detections": [
        {
          "track_id": 1,
          "cls": "person",
          "conf": 0.95,
          "bbox": [100, 200, 150, 350],
          "bottom_center": [125, 350]
        }
      ]
    }
  ]
}`}
          </pre>
        </div>

        <h3 className="text-lg font-bold text-argus-accent mt-6">Detection Fields by Module</h3>
        
        <table className="w-full text-sm border border-argus-border rounded">
          <thead className="bg-argus-secondary/50">
            <tr>
              <th className="text-left p-2 border-b border-argus-border">Module</th>
              <th className="text-left p-2 border-b border-argus-border">Required Fields</th>
              <th className="text-left p-2 border-b border-argus-border">Class Labels</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="border-b border-argus-border/50">
              <td className="p-2 text-cyan-400">Intrusion</td>
              <td className="p-2 font-mono text-xs">bottom_center</td>
              <td className="p-2">person</td>
            </tr>
            <tr className="border-b border-argus-border/50">
              <td className="p-2 text-orange-400">Throwing</td>
              <td className="p-2 font-mono text-xs">bbox</td>
              <td className="p-2">normal, throwing</td>
            </tr>
            <tr className="border-b border-argus-border/50">
              <td className="p-2 text-blue-400">Vehicle</td>
              <td className="p-2 font-mono text-xs">centroid, speed_kmh</td>
              <td className="p-2">car, truck, forklift</td>
            </tr>
            <tr className="border-b border-argus-border/50">
              <td className="p-2 text-red-400">Collision</td>
              <td className="p-2 font-mono text-xs">bottom_center, centroid</td>
              <td className="p-2">person + vehicle</td>
            </tr>
            <tr>
              <td className="p-2 text-purple-400">PPE</td>
              <td className="p-2 font-mono text-xs">missing[]</td>
              <td className="p-2">person</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  
  deployment: {
    title: 'Deployment',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-argus-accent">GitHub Pages Deployment</h3>
        
        <div className="bg-argus-secondary/30 p-4 rounded border border-argus-border">
          <h4 className="font-bold text-cyan-400 mb-3">Quick Start</h4>
          <pre className="text-xs text-green-400 bg-black/50 p-3 rounded">
{`# Clone and install
git clone https://github.com/YOUR_USERNAME/argus-automata-demo.git
cd argus-automata-demo/web
npm install

# Run locally
npm run dev

# Build for production
npm run build`}
          </pre>
        </div>

        <div className="bg-argus-secondary/30 p-4 rounded border border-argus-border mt-4">
          <h4 className="font-bold text-cyan-400 mb-3">Deploy Steps</h4>
          <ol className="text-sm space-y-2 text-slate-300">
            <li><span className="text-argus-accent font-bold">1.</span> Create GitHub repo named <code className="text-orange-400">argus-automata-demo</code></li>
            <li><span className="text-argus-accent font-bold">2.</span> Push code to <code className="text-orange-400">main</code> branch</li>
            <li><span className="text-argus-accent font-bold">3.</span> Go to Settings → Pages → Source: <code className="text-orange-400">GitHub Actions</code></li>
            <li><span className="text-argus-accent font-bold">4.</span> Workflow auto-deploys on push</li>
            <li><span className="text-argus-accent font-bold">5.</span> Live at: <code className="text-green-400">https://USERNAME.github.io/argus-automata-demo/</code></li>
          </ol>
        </div>

        <h3 className="text-lg font-bold text-argus-accent mt-6">Tech Stack</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {['React 18', 'TypeScript', 'Vite', 'Zustand', 'Dexie', 'Tailwind CSS', 'Canvas API'].map(tech => (
            <span key={tech} className="px-3 py-1 bg-argus-accent/20 text-argus-accent rounded-full text-sm">
              {tech}
            </span>
          ))}
        </div>
      </div>
    ),
  },
};

export const DocsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');

  const sections: { id: DocSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'data-format', label: 'Data Format', icon: '📄' },
    { id: 'deployment', label: 'Deployment', icon: '🚀' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-argus-primary border border-argus-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-argus-border">
          <h2 className="text-xl font-bold text-argus-accent flex items-center gap-2">
            <span>📚</span> Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-argus-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-argus-border p-2 flex-shrink-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
                  activeSection === section.id
                    ? 'bg-argus-accent text-argus-primary font-bold'
                    : 'hover:bg-argus-secondary text-slate-300'
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {docs[activeSection].title}
            </h2>
            <div className="text-slate-300">
              {docs[activeSection].content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-argus-border text-center text-xs text-slate-500">
          Argus Automata Demo • MIT License • Built for Unilever KGF Project
        </div>
      </div>
    </div>
  );
};
