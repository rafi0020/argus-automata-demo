// Core Types for Argus Automata Demo

export type ModuleType = 'intrusion' | 'throwing' | 'vehicle' | 'collision' | 'ppe';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Detection Types
export interface BaseDetection {
  track_id: number;
  cls: string;
  conf: number;
  bbox: [number, number, number, number];
}

export interface PersonDetection extends BaseDetection {
  bottom_center: [number, number];
}

export interface ThrowingDetection extends BaseDetection {
  cls: 'throwing' | 'normal';
}

export interface VehicleDetection extends BaseDetection {
  centroid: [number, number];
  plane_hint?: number;
}

export interface PPEDetection extends BaseDetection {
  missing: string[];
}

export type Detection = BaseDetection & Partial<PersonDetection & VehicleDetection & PPEDetection>;

export interface FrameData {
  t: number;
  detections: Detection[];
}

export interface MockDetectionData {
  camera_id: string;
  module: ModuleType;
  fps: number;
  roi?: Point[];
  homography_matrices?: number[][][];
  thresholds?: Record<string, number>;
  frames: FrameData[];
}

// Alert Types
export interface Alert {
  id?: number;
  camera_id: string;
  module: ModuleType;
  state: number;
  detected_time: string;
  image_data?: string;
  processed: 0 | 1;
  created_at: string;
  track_id?: number;
  vehicle_id?: number;
  speed?: number;
  human_id?: number;
  piv_id?: number;
  violations?: string[];
}

// State Types
export interface IntrusionState {
  buffer: boolean[];
  currentState: 0 | 1;
  lastStateChangeTime: number | null;
  bufferSize: number;
  threshold: number;
}

export interface ThrowingTrackState {
  classHistory: number[];
  smoothedClass: number;
  consecutiveCount: number;
}

export interface ThrowingState {
  tracks: Map<number, ThrowingTrackState>;
  consecutiveThreshold: number;
  smoothingWindow: number;
}

export interface KalmanState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  P: number;
}

export interface VehicleTrackState {
  centroidHistory: Point[];
  kalmanState: KalmanState;
  currentPlane: number;
  computedSpeed: number;
  lastSpeedTime: number;
}

export interface VehicleState {
  tracks: Map<number, VehicleTrackState>;
  speedThreshold: number;
  alertCooldown: Map<number, number>;
}

export interface CollisionPairState {
  buffer: boolean[];
  cooldownUntil: number | null;
}

export interface CollisionState {
  pairs: Map<string, CollisionPairState>;
  bufferSize: number;
  cooldownSeconds: number;
  distanceThreshold: number;
}

export interface PPETrackState {
  violationFrames: number;
  cooldownUntil: number | null;
  lastViolations: string[];
}

export interface PPEState {
  tracks: Map<number, PPETrackState>;
  persistenceThreshold: number;
  cooldownSeconds: number;
}

export type ViewMode = 'explain' | 'operator';
export type WhiteboxTab = 'algorithm' | 'state' | 'config' | 'alerts';

export interface OverlaySettings {
  showROI: boolean;
  showBboxes: boolean;
  showTrackIds: boolean;
  showSpeed: boolean;
  showCollisionZones: boolean;
}

export interface TimelineEvent {
  id: string;
  time: number;
  type: 'alert_start' | 'alert_end';
  module: ModuleType;
  description: string;
  alertId?: number;
}

export interface SenderState {
  isRunning: boolean;
  lastSendTime: number | null;
  sentCount: number;
  pendingCount: number;
}

