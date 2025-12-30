import { create } from 'zustand';
import type {
  ModuleType, ViewMode, OverlaySettings, WhiteboxTab, TimelineEvent,
  MockDetectionData, FrameData, IntrusionState, ThrowingState,
  VehicleState, CollisionState, PPEState, SenderState,
} from '../types';
import { initIntrusionState, initThrowingState, initCollisionState, initPPEState } from '../parity/buffers';

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  overlaySettings: OverlaySettings;
  setOverlaySettings: (settings: Partial<OverlaySettings>) => void;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activeCamera: string;
  whiteboxTab: WhiteboxTab;
  setWhiteboxTab: (tab: WhiteboxTab) => void;
  videoTime: number;
  setVideoTime: (time: number) => void;
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  mockData: MockDetectionData | null;
  setMockData: (data: MockDetectionData | null) => void;
  currentFrame: FrameData | null;
  setCurrentFrame: (frame: FrameData | null) => void;
  timelineEvents: TimelineEvent[];
  addTimelineEvent: (event: TimelineEvent) => void;
  clearTimelineEvents: () => void;
  intrusionState: IntrusionState;
  setIntrusionState: (state: IntrusionState) => void;
  throwingState: ThrowingState;
  setThrowingState: (state: ThrowingState) => void;
  vehicleState: VehicleState;
  setVehicleState: (state: VehicleState) => void;
  collisionState: CollisionState;
  setCollisionState: (state: CollisionState) => void;
  ppeState: PPEState;
  setPPEState: (state: PPEState) => void;
  senderState: SenderState;
  setSenderState: (state: Partial<SenderState>) => void;
  resetModuleStates: (thresholds?: Record<string, number>) => void;
  // Video availability
  videoAvailable: boolean;
  setVideoAvailable: (available: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'explain',
  setViewMode: (mode) => set({ viewMode: mode }),
  overlaySettings: { showROI: true, showBboxes: true, showTrackIds: true, showSpeed: true, showCollisionZones: true },
  setOverlaySettings: (settings) => set((state) => ({ overlaySettings: { ...state.overlaySettings, ...settings } })),
  activeModule: 'intrusion',
  setActiveModule: (module) => set({ activeModule: module }),
  activeCamera: 'cam01',
  whiteboxTab: 'algorithm',
  setWhiteboxTab: (tab) => set({ whiteboxTab: tab }),
  videoTime: 0,
  setVideoTime: (time) => set({ videoTime: time }),
  videoDuration: 0,
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  mockData: null,
  setMockData: (data) => set({ mockData: data }),
  currentFrame: null,
  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  timelineEvents: [],
  addTimelineEvent: (event) => set((state) => ({ timelineEvents: [...state.timelineEvents, event] })),
  clearTimelineEvents: () => set({ timelineEvents: [] }),
  intrusionState: initIntrusionState(),
  setIntrusionState: (state) => set({ intrusionState: state }),
  throwingState: initThrowingState(),
  setThrowingState: (state) => set({ throwingState: state }),
  vehicleState: { tracks: new Map(), speedThreshold: 30, alertCooldown: new Map() },
  setVehicleState: (state) => set({ vehicleState: state }),
  collisionState: initCollisionState(),
  setCollisionState: (state) => set({ collisionState: state }),
  ppeState: initPPEState(),
  setPPEState: (state) => set({ ppeState: state }),
  senderState: { isRunning: false, lastSendTime: null, sentCount: 0, pendingCount: 0 },
  setSenderState: (newState) => set((state) => ({ senderState: { ...state.senderState, ...newState } })),
  resetModuleStates: (thresholds?: Record<string, number>) => set({
    intrusionState: initIntrusionState(
      thresholds?.buffer_size ?? 5,
      thresholds?.threshold ?? 3
    ),
    throwingState: initThrowingState(
      thresholds?.consecutive_threshold ?? 5,
      thresholds?.smoothing_window ?? 3
    ),
    vehicleState: { 
      tracks: new Map(), 
      speedThreshold: thresholds?.speed_threshold_kmh ?? thresholds?.speed_threshold ?? 30, 
      alertCooldown: new Map() 
    },
    collisionState: initCollisionState(
      thresholds?.collision_buffer_frames ?? thresholds?.collision_buffer ?? 3,
      thresholds?.collision_cooldown_seconds ?? thresholds?.collision_cooldown ?? 20,
      thresholds?.collision_distance_px ?? thresholds?.collision_distance ?? 120
    ),
    ppeState: initPPEState(
      thresholds?.ppe_persistence_frames ?? thresholds?.ppe_persistence ?? 5,
      thresholds?.ppe_cooldown_seconds ?? thresholds?.ppe_cooldown ?? 20
    ),
    timelineEvents: [],
    videoTime: 0,
  }),
  videoAvailable: false,
  setVideoAvailable: (available) => set({ videoAvailable: available }),
}));

