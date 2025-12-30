import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { ModuleType } from '../types';

const moduleColors: Record<ModuleType, { primary: string; secondary: string }> = {
  intrusion: { primary: '#00d4aa', secondary: 'rgba(0, 212, 170, 0.2)' },
  throwing: { primary: '#ff6b35', secondary: 'rgba(255, 107, 53, 0.2)' },
  vehicle: { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.2)' },
  collision: { primary: '#ff3366', secondary: 'rgba(255, 51, 102, 0.2)' },
  ppe: { primary: '#a855f7', secondary: 'rgba(168, 85, 247, 0.2)' },
};

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  width: number;
  height: number;
}

export const VideoOverlay: React.FC<Props> = ({ videoRef, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeModule, overlaySettings, mockData, currentFrame, intrusionState } = useAppStore();
  
  const getScale = useCallback(() => {
    if (!videoRef.current) return { sx: 1, sy: 1 };
    return { sx: width / (videoRef.current.videoWidth || width), sy: height / (videoRef.current.videoHeight || height) };
  }, [videoRef, width, height]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    const { sx, sy } = getScale();
    const colors = moduleColors[activeModule];
    
    // ROI
    if (overlaySettings.showROI && mockData?.roi && mockData.roi.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(mockData.roi[0].x * sx, mockData.roi[0].y * sy);
      mockData.roi.slice(1).forEach(p => ctx.lineTo(p.x * sx, p.y * sy));
      ctx.closePath();
      ctx.fillStyle = colors.secondary;
      ctx.fill();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Detections
    if (currentFrame && overlaySettings.showBboxes) {
      for (const det of currentFrame.detections) {
        const [x1, y1, x2, y2] = det.bbox;
        const bx = x1 * sx, by = y1 * sy, bw = (x2 - x1) * sx, bh = (y2 - y1) * sy;
        
        let color = colors.primary;
        if (det.cls === 'throwing') color = '#ff6b35';
        if (det.missing && det.missing.length > 0) color = '#ff3366';
        if (['car', 'truck', 'bus', 'motorcycle'].includes(det.cls)) color = '#3b82f6';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        
        if (overlaySettings.showTrackIds) {
          const label = `ID:${det.track_id}`;
          ctx.font = 'bold 11px monospace';
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = color;
          ctx.fillRect(bx, by - 16, tw + 6, 16);
          ctx.fillStyle = '#0a1628';
          ctx.fillText(label, bx + 3, by - 4);
        }
        
        const clsLabel = det.cls.toUpperCase();
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bx, by + bh, ctx.measureText(clsLabel).width + 6, 12);
        ctx.fillStyle = '#fff';
        ctx.fillText(clsLabel, bx + 3, by + bh + 9);
      }
    }
    
    // Intrusion state indicator
    if (activeModule === 'intrusion') {
      const label = intrusionState.currentState === 1 ? '⚠ INTRUSION' : '✓ CLEAR';
      const color = intrusionState.currentState === 1 ? '#ff3366' : '#00d4aa';
      ctx.font = 'bold 14px monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(width - tw - 24, 8, tw + 16, 26);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(width - tw - 24, 8, tw + 16, 26);
      ctx.fillStyle = color;
      ctx.fillText(label, width - tw - 16, 26);
    }
  }, [width, height, mockData, currentFrame, activeModule, overlaySettings, intrusionState, getScale]);
  
  useEffect(() => { draw(); }, [draw]);
  
  return <canvas ref={canvasRef} width={width} height={height} className="absolute top-0 left-0 pointer-events-none" />;
};

