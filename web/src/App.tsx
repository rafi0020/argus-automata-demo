import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { CanvasSimulator } from './components/CanvasSimulator';
import { WhiteboxPanel } from './components/WhiteboxPanel';
import { Timeline } from './components/Timeline';
import { DocsPanel } from './components/DocsPanel';
import { useAppStore } from './store/appStore';
import { useDetectionProcessor } from './hooks/useDetectionProcessor';
import { useSenderSimulator } from './hooks/useSenderSimulator';
import type { MockDetectionData, ModuleType } from './types';

// Get base URL for assets
const BASE = import.meta.env.BASE_URL || '/';

// Video paths per module
const videoUrls: Record<ModuleType, string> = {
  intrusion: `${BASE}assets/videos/intrusion_demo.mp4`,
  throwing: `${BASE}assets/videos/throwing_demo.mp4`,
  vehicle: `${BASE}assets/videos/vehicle_demo.mp4`,
  collision: `${BASE}assets/videos/collision_demo.mp4`,
  ppe: `${BASE}assets/videos/ppe_demo.mp4`,
};

// Data paths per module
const dataUrls: Record<ModuleType, string> = {
  intrusion: `${BASE}assets/data/intrusion_demo.json`,
  throwing: `${BASE}assets/data/throwing_demo.json`,
  vehicle: `${BASE}assets/data/vehicle_demo.json`,
  collision: `${BASE}assets/data/collision_demo.json`,
  ppe: `${BASE}assets/data/ppe_demo.json`,
};

function App() {
  const {
    activeModule, viewMode, setMockData, setVideoTime, resetModuleStates,
    setIsPlaying, setVideoDuration, videoAvailable, setVideoAvailable,
  } = useAppStore();
  
  const [videoSrc, setVideoSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  
  // Initialize processors
  useDetectionProcessor();
  useSenderSimulator(5, 10);
  
  // Check if video file exists
  const checkVideoExists = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || '';
      return response.ok && contentType.includes('video');
    } catch {
      return false;
    }
  }, []);
  
  // Load demo data when module changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsPlaying(false);
      setVideoTime(0);
      
      // Check if video exists
      const vidUrl = videoUrls[activeModule];
      const videoExists = await checkVideoExists(vidUrl);
      setVideoAvailable(videoExists);
      setVideoSrc(vidUrl);
      
      // Load mock detection data
      let data: MockDetectionData;
      try {
        const response = await fetch(dataUrls[activeModule]);
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('No data file');
        }
      } catch {
        // Use generated demo data
        data = generateDemoData(activeModule);
      }
      
      // Reset module states with thresholds from loaded data
      resetModuleStates(data.thresholds as Record<string, number>);
      setMockData(data);
      
      if (!videoExists && data.frames.length) {
        setVideoDuration(Math.max(...data.frames.map(f => f.t)) + 0.5);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeModule, checkVideoExists, setMockData, setVideoTime, resetModuleStates, setIsPlaying, setVideoDuration, setVideoAvailable]);
  
  // Seek handler
  const handleSeek = useCallback((time: number) => {
    setVideoTime(time);
  }, [setVideoTime]);
  
  return (
    <div className="h-screen flex flex-col bg-argus-primary">
      <Header onDocsClick={() => setShowDocs(true)} />
      
      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
      
      <main className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex gap-4">
          <div className={`flex flex-col gap-4 ${viewMode === 'explain' ? 'w-2/3' : 'w-3/4'}`}>
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="panel h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-argus-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading demo...</p>
                  </div>
                </div>
              ) : videoAvailable ? (
                <VideoPlayer videoSrc={videoSrc} />
              ) : (
                <CanvasSimulator />
              )}
            </div>
            <Timeline onSeek={handleSeek} />
          </div>
          
          <div className={viewMode === 'explain' ? 'w-1/3' : 'w-1/4'}>
            <WhiteboxPanel />
          </div>
        </div>
      </main>
      
      <footer className="px-6 py-2 border-t border-argus-border bg-argus-secondary/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Argus Automata Demo v1.0 • {videoAvailable ? '📹 Video Mode' : '🎮 Simulation Mode'}</span>
          <span>Built for Unilever KGF Project</span>
        </div>
      </footer>
    </div>
  );
}

// Generate demo data if no JSON file
function generateDemoData(module: ModuleType): MockDetectionData {
  const fps = 25, duration = 10;
  const frameCount = fps * duration;
  
  const data: MockDetectionData = {
    camera_id: 'demo_cam', module, fps, frames: [],
    roi: [{ x: 100, y: 80 }, { x: 540, y: 80 }, { x: 540, y: 400 }, { x: 100, y: 400 }],
    thresholds: {},
  };
  
  switch (module) {
    case 'intrusion':
      data.thresholds = { buffer_size: 5, threshold: 3 };
      for (let i = 0; i < frameCount; i++) {
        const t = i / fps;
        const x = 50 + (t / duration) * 540;
        const y = 240 + Math.sin(t * 2) * 30;
        data.frames.push({
          t,
          detections: [{ track_id: 1, cls: 'person', conf: 0.95, bbox: [x - 25, y - 70, x + 25, y], bottom_center: [x, y] }],
        });
      }
      break;
      
    case 'throwing':
      data.thresholds = { smoothing_window: 3, consecutive_threshold: 5, cooldown_seconds: 30 };
      for (let i = 0; i < frameCount; i++) {
        const t = i / fps;
        const isThrowing = t > 2 && t < 7;
        data.frames.push({
          t,
          detections: [{ track_id: 1, cls: isThrowing ? 'throwing' : 'normal', conf: 0.9, bbox: [280, 120, 360, 360] }],
        });
      }
      break;
      
    case 'vehicle':
      data.thresholds = { speed_threshold_kmh: 30, meters_per_pixel: 0.05, alert_cooldown: 30 };
      data.homography_matrices = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]];
      for (let i = 0; i < frameCount; i++) {
        const t = i / fps;
        const x = 50 + (t / duration) * 540;
        data.frames.push({
          t,
          detections: [{ track_id: 1, cls: 'car', conf: 0.92, bbox: [x - 40, 270, x + 40, 330], centroid: [x, 300], plane_hint: 0 }],
        });
      }
      break;
      
    case 'collision':
      data.thresholds = { collision_distance_px: 120, collision_buffer_frames: 3, collision_cooldown_seconds: 20 };
      for (let i = 0; i < frameCount; i++) {
        const t = i / fps;
        const humanX = 250;
        const vehicleX = 450 - (t > 2 && t < 6 ? (t - 2) * 40 : 0);
        data.frames.push({
          t,
          detections: [
            { track_id: 1, cls: 'person', conf: 0.95, bbox: [humanX - 25, 220, humanX + 25, 380], bottom_center: [humanX, 380] },
            { track_id: 2, cls: 'forklift', conf: 0.92, bbox: [vehicleX - 45, 280, vehicleX + 45, 340], centroid: [vehicleX, 310] },
          ],
        });
      }
      break;
      
    case 'ppe':
      data.thresholds = { ppe_persistence_frames: 5, ppe_cooldown_seconds: 20 };
      for (let i = 0; i < frameCount; i++) {
        const t = i / fps;
        const hasViolation = t > 1 && t < 8;
        data.frames.push({
          t,
          detections: [{ track_id: 1, cls: 'person', conf: 0.95, bbox: [270, 80, 370, 380], missing: hasViolation ? ['helmet', 'vest'] : [] }],
        });
      }
      break;
  }
  
  return data;
}

export default App;

