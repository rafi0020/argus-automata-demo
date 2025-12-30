import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { ModuleType, FrameData } from '../types';

const moduleColors: Record<ModuleType, { bg: string; person: string; vehicle: string; roi: string }> = {
  intrusion: { bg: '#0f1729', person: '#00d4aa', vehicle: '#3b82f6', roi: 'rgba(0, 212, 170, 0.12)' },
  throwing: { bg: '#0f1729', person: '#ff6b35', vehicle: '#3b82f6', roi: 'rgba(255, 107, 53, 0.12)' },
  vehicle: { bg: '#0f1729', person: '#00d4aa', vehicle: '#3b82f6', roi: 'rgba(59, 130, 246, 0.12)' },
  collision: { bg: '#0f1729', person: '#00d4aa', vehicle: '#ff3366', roi: 'rgba(255, 51, 102, 0.12)' },
  ppe: { bg: '#0f1729', person: '#a855f7', vehicle: '#3b82f6', roi: 'rgba(168, 85, 247, 0.12)' },
};

export const CanvasSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  
  const {
    activeModule, mockData, isPlaying, setIsPlaying,
    videoTime, setVideoTime, videoDuration, setVideoDuration,
    setCurrentFrame, overlaySettings,
  } = useAppStore();
  
  const WIDTH = 640, HEIGHT = 480;
  
  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  const findFrame = useCallback((time: number): FrameData | null => {
    if (!mockData?.frames.length) return null;
    let closest = mockData.frames[0];
    for (const f of mockData.frames) {
      if (Math.abs(f.t - time) < Math.abs(closest.t - time)) closest = f;
    }
    return closest;
  }, [mockData]);
  
  // Set duration when mockData changes
  useEffect(() => {
    if (mockData?.frames.length) {
      const maxT = Math.max(...mockData.frames.map(f => f.t));
      setVideoDuration(maxT + 0.5);
    }
  }, [mockData, setVideoDuration]);
  
  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !mockData) return;
    
    const colors = moduleColors[activeModule];
    const frame = findFrame(time);
    setCurrentFrame(frame);
    
    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
    for (let y = 0; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    
    // ROI
    if (overlaySettings.showROI && mockData.roi && mockData.roi.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(mockData.roi[0].x, mockData.roi[0].y);
      mockData.roi.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = colors.roi;
      ctx.fill();
      ctx.strokeStyle = colors.person;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.person;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('ROI ZONE', mockData.roi[0].x + 8, mockData.roi[0].y + 18);
    }
    
    // Detections
    if (frame && overlaySettings.showBboxes) {
      for (const det of frame.detections) {
        const [x1, y1, x2, y2] = det.bbox;
        const w = x2 - x1, h = y2 - y1;
        const isPerson = det.cls === 'person' || det.cls === 'throwing' || det.cls === 'normal';
        const isVehicle = ['car', 'truck', 'bus', 'motorcycle', 'forklift'].includes(det.cls);
        let color = isPerson ? colors.person : isVehicle ? colors.vehicle : '#888';
        if (det.cls === 'throwing') color = '#ff6b35';
        if (det.missing && det.missing.length > 0) color = '#ff3366';
        
        // Box fill
        ctx.fillStyle = color + '30';
        ctx.fillRect(x1, y1, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, w, h);
        
        // Icon
        ctx.fillStyle = color;
        const cx = (x1 + x2) / 2;
        if (isPerson) {
          ctx.beginPath();
          ctx.arc(cx, y1 + h * 0.12, Math.min(w, h) * 0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - w * 0.15, y1 + h * 0.2, w * 0.3, h * 0.45);
        } else if (isVehicle) {
          ctx.fillRect(x1 + w * 0.1, y1 + h * 0.25, w * 0.8, h * 0.45);
          ctx.beginPath();
          ctx.arc(x1 + w * 0.28, y1 + h * 0.78, w * 0.1, 0, Math.PI * 2);
          ctx.arc(x1 + w * 0.72, y1 + h * 0.78, w * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Labels
        if (overlaySettings.showTrackIds) {
          const label = `ID:${det.track_id}`;
          ctx.font = 'bold 10px monospace';
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = color;
          ctx.fillRect(x1, y1 - 14, tw + 6, 14);
          ctx.fillStyle = '#0a1628';
          ctx.fillText(label, x1 + 3, y1 - 3);
        }
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const clsLabel = det.cls.toUpperCase();
        ctx.font = '9px monospace';
        ctx.fillRect(x1, y2, ctx.measureText(clsLabel).width + 6, 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(clsLabel, x1 + 3, y2 + 9);
      }
    }
    
    // Time display
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(8, HEIGHT - 28, 100, 22);
    ctx.fillStyle = '#00d4aa';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`T: ${time.toFixed(2)}s`, 14, HEIGHT - 11);
    
    // Mode indicator
    ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SIMULATION', WIDTH - 80, 18);
  }, [mockData, activeModule, overlaySettings, findFrame, setCurrentFrame]);
  
  // Animation loop - use ref to avoid stale closure
  const animate = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const duration = useAppStore.getState().videoDuration;
    
    if (elapsed >= duration) {
      // Reset at end
      setIsPlaying(false);
      setVideoTime(0);
      startTimeRef.current = null;
      draw(0);
      return;
    }
    
    setVideoTime(elapsed);
    draw(elapsed);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [draw, setIsPlaying, setVideoTime]);
  
  // Start/stop animation when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = null; // Reset start time
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, animate]);
  
  // Initial draw
  useEffect(() => {
    draw(0);
  }, [mockData, draw]);
  
  // Redraw when paused and videoTime changes externally
  useEffect(() => {
    if (!isPlaying) {
      draw(videoTime);
    }
  }, [videoTime, isPlaying, draw]);
  
  const togglePlay = () => {
    if (!isPlaying) {
      startTimeRef.current = null;
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(pct * videoDuration, videoDuration));
    setVideoTime(newTime);
    startTimeRef.current = null; // Reset so next play starts from seek position
    if (!isPlaying) {
      draw(newTime);
    }
  };
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="panel h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="max-w-full max-h-full" />
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center group">
          <div className={`w-16 h-16 rounded-full bg-argus-accent/80 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            {isPlaying ? (
              <svg className="w-8 h-8 text-argus-primary" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-argus-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      </div>
      <div className="p-3 border-t border-argus-border">
        <div 
          className="h-2 bg-argus-secondary rounded-full mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-argus-accent rounded-full transition-all" 
            style={{ width: `${videoDuration > 0 ? (videoTime / videoDuration) * 100 : 0}%` }} 
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="p-2 bg-argus-accent text-argus-primary rounded-lg font-bold text-lg w-10 h-10 flex items-center justify-center">
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <span className="mono text-sm text-argus-accent">{formatTime(videoTime)} / {formatTime(videoDuration)}</span>
          <span className="text-xs text-purple-400 ml-auto">🎮 Canvas Simulation</span>
        </div>
      </div>
    </div>
  );
};
