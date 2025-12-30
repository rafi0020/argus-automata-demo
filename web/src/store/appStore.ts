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
  resetModuleStates: () => void;
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
  resetModuleStates: () => set({
    intrusionState: initIntrusionState(),
    throwingState: initThrowingState(),
    vehicleState: { tracks: new Map(), speedThreshold: 30, alertCooldown: new Map() },
    collisionState: initCollisionState(),
    ppeState: initPPEState(),
    timelineEvents: [],
    videoTime: 0,
  }),
  videoAvailable: false,
  setVideoAvailable: (available) => set({ videoAvailable: available }),
}));

