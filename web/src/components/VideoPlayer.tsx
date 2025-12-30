import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { VideoOverlay } from './VideoOverlay';
import type { FrameData } from '../types';

interface VideoPlayerProps {
  videoSrc: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    mockData, isPlaying, setIsPlaying,
    videoTime, setVideoTime, setVideoDuration,
    setCurrentFrame, overlaySettings, setOverlaySettings, viewMode,
  } = useAppStore();
  
  // Find frame for time
  const findFrame = useCallback((time: number): FrameData | null => {
    if (!mockData?.frames.length) return null;
    let closest = mockData.frames[0];
    for (const f of mockData.frames) {
      if (Math.abs(f.t - time) < Math.abs(closest.t - time)) closest = f;
    }
    return closest;
  }, [mockData]);
  
  // Update loop
  const updateLoop = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setVideoTime(time);
      setCurrentFrame(findFrame(time));
    }
    if (isPlaying) animationRef.current = requestAnimationFrame(updateLoop);
  }, [isPlaying, setVideoTime, setCurrentFrame, findFrame]);
  
  // Play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;
    if (isPlaying) {
      video.play().catch(console.error);
      animationRef.current = requestAnimationFrame(updateLoop);
    } else {
      video.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, isLoaded, updateLoop]);
  
  // Resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsLoaded(true);
    }
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
    setVideoTime(0);
  };
  
  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoTime(time);
      setCurrentFrame(findFrame(time));
    }
  };
  
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}.${Math.floor((s % 1) * 100).toString().padStart(2, '0')}`;
  const videoDuration = videoRef.current?.duration || 0;
  
  return (
    <div className="panel h-full flex flex-col">
      <div ref={containerRef} className="flex-1 relative bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="w-full h-full object-contain"
          playsInline
          muted
        />
        {isLoaded && (
          <VideoOverlay videoRef={videoRef} width={dimensions.width} height={dimensions.height} />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-argus-primary/80">
            <div className="text-argus-accent animate-pulse">Loading video...</div>
          </div>
        )}
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
        {/* Video mode indicator */}
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded font-mono">
          📹 VIDEO
        </div>
      </div>
      <div className="p-3 border-t border-argus-border">
        <div 
          className="h-2 bg-argus-secondary rounded-full mb-3 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * videoDuration);
          }}
        >
          <div className="h-full bg-argus-accent rounded-full transition-all" style={{ width: `${(videoTime / videoDuration) * 100 || 0}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="p-2 bg-argus-accent text-argus-primary rounded-lg font-bold">
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <span className="mono text-sm text-argus-accent">{formatTime(videoTime)} / {formatTime(videoDuration)}</span>
          </div>
          {viewMode === 'explain' && (
            <div className="flex items-center gap-3">
              {['ROI', 'Boxes', 'IDs', 'Speed'].map((label, i) => {
                const keys: (keyof typeof overlaySettings)[] = ['showROI', 'showBboxes', 'showTrackIds', 'showSpeed'];
                return (
                  <label key={label} className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={overlaySettings[keys[i]]} onChange={(e) => setOverlaySettings({ [keys[i]]: e.target.checked })} className="accent-argus-accent" />
                    {label}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

