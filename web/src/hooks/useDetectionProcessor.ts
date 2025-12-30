import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { insertAlert } from '../store/alertStore';
import { pointInPolygon, distance } from '../parity/geometry';
import { updateIntrusionBuffer, updateThrowingState, updateCollisionPair, updatePPETrack } from '../parity/buffers';
import { PositionKalman } from '../parity/kalman';
import type { FrameData, Point, Alert, VehicleTrackState } from '../types';

// Track Kalman filters for each vehicle
const vehicleKalmans = new Map<number, PositionKalman>();

export function useDetectionProcessor() {
  const {
    activeModule, activeCamera, mockData, currentFrame, videoTime,
    intrusionState, setIntrusionState,
    throwingState, setThrowingState,
    vehicleState, setVehicleState,
    collisionState, setCollisionState,
    ppeState, setPPEState,
    addTimelineEvent,
  } = useAppStore();
  
  const lastProcessedTime = useRef(-1);
  
  const createAlert = useCallback(async (state: number, extra: Partial<Alert> = {}) => {
    const now = new Date().toISOString();
    const alertId = await insertAlert({
      camera_id: activeCamera, module: activeModule, state,
      detected_time: now, processed: 0, created_at: now, ...extra,
    } as Omit<Alert, 'id'>);
    
    addTimelineEvent({
      id: `${activeModule}-${alertId}-${Date.now()}`,
      time: videoTime,
      type: state === 1 ? 'alert_start' : 'alert_end',
      module: activeModule,
      description: `${activeModule} ${state === 1 ? 'detected' : 'ended'}`,
      alertId,
    });
    return alertId;
  }, [activeCamera, activeModule, videoTime, addTimelineEvent]);
  
  const processFrame = useCallback((frame: FrameData) => {
    switch (activeModule) {
      case 'intrusion': {
        if (!mockData?.roi) return;
        const persons = frame.detections.filter(d => d.cls === 'person');
        let anyInROI = false;
        for (const p of persons) {
          if (p.bottom_center) {
            const pt: Point = { x: p.bottom_center[0], y: p.bottom_center[1] };
            if (pointInPolygon(pt, mockData.roi)) { anyInROI = true; break; }
          }
        }
        const result = updateIntrusionBuffer(intrusionState, anyInROI, frame.t);
        setIntrusionState(result.state);
        if (result.emitAlert) createAlert(result.alertType === 'start' ? 1 : 0);
        break;
      }
      case 'throwing': {
        const detections = frame.detections.filter(d => d.cls === 'throwing' || d.cls === 'normal');
        for (const det of detections) {
          const cls = det.cls === 'throwing' ? 1 : 0;
          const result = updateThrowingState(throwingState, det.track_id, cls as 0 | 1);
          setThrowingState(result.state);
          if (result.triggerAlert) createAlert(1, { track_id: det.track_id });
        }
        break;
      }
      case 'vehicle': {
        const vehicles = frame.detections.filter(d => ['car', 'truck', 'bus', 'motorcycle', 'forklift'].includes(d.cls));
        const fps = mockData?.fps || 25;
        const metersPerPixel = mockData?.thresholds?.meters_per_pixel || 0.05;
        const speedThreshold = mockData?.thresholds?.speed_threshold_kmh || mockData?.thresholds?.speed_threshold || 30;
        const newTracks = new Map(vehicleState.tracks);
        
        for (const v of vehicles) {
          if (!v.centroid) continue;
          const cx = v.centroid[0];
          const cy = v.centroid[1];
          
          // Get or create Kalman filter for this track
          let kalman = vehicleKalmans.get(v.track_id);
          if (!kalman) {
            kalman = new PositionKalman(cx, cy, 0.5, 2, 1/fps);
            vehicleKalmans.set(v.track_id, kalman);
          }
          
          // Update Kalman filter
          kalman.predict();
          kalman.update(cx, cy);
          
          // Get speed in km/h
          const speedKmh = v.speed_kmh ?? kalman.getSpeedKmh(metersPerPixel);
          
          // Get or create track state
          let trackState: VehicleTrackState = newTracks.get(v.track_id) || {
            centroidHistory: [],
            kalmanState: { x: cx, y: cy, vx: 0, vy: 0, P: 1 },
            currentPlane: v.plane_hint || 0,
            computedSpeed: 0,
            lastSpeedTime: frame.t,
          };
          
          // Update track state
          const pos = kalman.getPosition();
          const vel = kalman.getVelocity();
          trackState.kalmanState = { x: pos.x, y: pos.y, vx: vel.vx, vy: vel.vy, P: 1 };
          trackState.computedSpeed = speedKmh;
          trackState.centroidHistory.push({ x: cx, y: cy });
          if (trackState.centroidHistory.length > 30) trackState.centroidHistory.shift();
          
          newTracks.set(v.track_id, trackState);
          
          // Check speed threshold
          if (speedKmh > speedThreshold) {
            const cooldown = vehicleState.alertCooldown.get(v.track_id);
            if (!cooldown || frame.t > cooldown) {
              createAlert(1, { vehicle_id: v.track_id, speed: Math.round(speedKmh * 10) / 10 });
              const newCooldown = new Map(vehicleState.alertCooldown);
              newCooldown.set(v.track_id, frame.t + 30);
              setVehicleState({ ...vehicleState, tracks: newTracks, alertCooldown: newCooldown });
              return;
            }
          }
        }
        setVehicleState({ ...vehicleState, tracks: newTracks });
        break;
      }
      case 'collision': {
        const humans = frame.detections.filter(d => d.cls === 'person');
        const vehicles = frame.detections.filter(d => ['car', 'truck', 'bus', 'motorcycle', 'forklift'].includes(d.cls));
        const distThreshold = mockData?.thresholds?.collision_distance_px || mockData?.thresholds?.collision_distance || 100;
        
        for (const h of humans) {
          for (const v of vehicles) {
            if (!h.bottom_center || !v.centroid) continue;
            const hPt: Point = { x: h.bottom_center[0], y: h.bottom_center[1] };
            const vPt: Point = { x: v.centroid[0], y: v.centroid[1] };
            const dist = distance(hPt, vPt);
            const result = updateCollisionPair(collisionState, h.track_id, v.track_id, dist < distThreshold, frame.t);
            setCollisionState(result.state);
            if (result.triggerAlert) createAlert(1, { human_id: h.track_id, piv_id: v.track_id });
          }
        }
        break;
      }
      case 'ppe': {
        const ppeDetections = frame.detections.filter(d => d.missing !== undefined);
        for (const det of ppeDetections) {
          const result = updatePPETrack(ppeState, det.track_id, det.missing || [], frame.t);
          setPPEState(result.state);
          if (result.triggerAlert) createAlert(1, { track_id: det.track_id, violations: result.violations });
        }
        break;
      }
    }
  }, [activeModule, mockData, intrusionState, throwingState, vehicleState, collisionState, ppeState,
      setIntrusionState, setThrowingState, setVehicleState, setCollisionState, setPPEState, createAlert]);
  
  // Clear Kalman filters when module changes
  useEffect(() => {
    vehicleKalmans.clear();
  }, [activeModule]);
  
  useEffect(() => {
    if (!currentFrame) return;
    if (Math.abs(currentFrame.t - lastProcessedTime.current) < 0.01) return;
    lastProcessedTime.current = currentFrame.t;
    processFrame(currentFrame);
  }, [currentFrame, processFrame]);
}
