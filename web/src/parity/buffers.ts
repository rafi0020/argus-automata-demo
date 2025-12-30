import type {
  IntrusionState, ThrowingState, ThrowingTrackState,
  CollisionState, CollisionPairState, PPEState, PPETrackState,
} from '../types';

// Intrusion
export function initIntrusionState(bufferSize = 5, threshold = 3): IntrusionState {
  return { buffer: [], currentState: 0, lastStateChangeTime: null, bufferSize, threshold };
}

export function updateIntrusionBuffer(
  state: IntrusionState, isInROI: boolean, timestamp: number
): { state: IntrusionState; emitAlert: boolean; alertType: 'start' | 'end' | null } {
  const newBuffer = [...state.buffer, isInROI];
  while (newBuffer.length > state.bufferSize) newBuffer.shift();
  
  const trueCount = newBuffer.filter(Boolean).length;
  let newState = state.currentState;
  let emitAlert = false;
  let alertType: 'start' | 'end' | null = null;
  
  if (state.currentState === 0 && trueCount >= state.threshold) {
    newState = 1; emitAlert = true; alertType = 'start';
  } else if (state.currentState === 1 && trueCount < state.threshold) {
    newState = 0; emitAlert = true; alertType = 'end';
  }
  
  return {
    state: { ...state, buffer: newBuffer, currentState: newState, lastStateChangeTime: emitAlert ? timestamp : state.lastStateChangeTime },
    emitAlert, alertType,
  };
}

// Throwing
export function initThrowingState(consecutiveThreshold = 10, smoothingWindow = 3): ThrowingState {
  return { tracks: new Map(), consecutiveThreshold, smoothingWindow };
}

export function updateThrowingState(
  state: ThrowingState, trackId: number, detectedClass: 0 | 1
): { state: ThrowingState; triggerAlert: boolean } {
  let trackState = state.tracks.get(trackId) || { classHistory: [], smoothedClass: 0, consecutiveCount: 0 };
  
  trackState.classHistory.push(detectedClass);
  if (trackState.classHistory.length > state.smoothingWindow) trackState.classHistory.shift();
  
  const mean = trackState.classHistory.reduce((a, b) => a + b, 0) / trackState.classHistory.length;
  trackState.smoothedClass = Math.round(mean);
  trackState.consecutiveCount = trackState.smoothedClass === 1 ? trackState.consecutiveCount + 1 : 0;
  
  const triggerAlert = trackState.consecutiveCount === state.consecutiveThreshold;
  const newTracks = new Map(state.tracks);
  newTracks.set(trackId, trackState);
  
  return { state: { ...state, tracks: newTracks }, triggerAlert };
}

// Collision
export function initCollisionState(bufferSize = 5, cooldownSeconds = 30, distanceThreshold = 100): CollisionState {
  return { pairs: new Map(), bufferSize, cooldownSeconds, distanceThreshold };
}

export function updateCollisionPair(
  state: CollisionState, humanId: number, vehicleId: number, isClose: boolean, timestamp: number
): { state: CollisionState; triggerAlert: boolean } {
  const key = `${humanId}-${vehicleId}`;
  let pairState = state.pairs.get(key) || { buffer: [], cooldownUntil: null };
  
  if (pairState.cooldownUntil && timestamp < pairState.cooldownUntil) {
    return { state, triggerAlert: false };
  }
  
  pairState.buffer.push(isClose);
  if (pairState.buffer.length > state.bufferSize) pairState.buffer.shift();
  
  const triggerAlert = pairState.buffer.length >= state.bufferSize && pairState.buffer.every(Boolean);
  if (triggerAlert) {
    pairState.cooldownUntil = timestamp + state.cooldownSeconds;
    pairState.buffer = [];
  }
  
  const newPairs = new Map(state.pairs);
  newPairs.set(key, pairState);
  return { state: { ...state, pairs: newPairs }, triggerAlert };
}

// PPE
export function initPPEState(persistenceThreshold = 15, cooldownSeconds = 60): PPEState {
  return { tracks: new Map(), persistenceThreshold, cooldownSeconds };
}

export function updatePPETrack(
  state: PPEState, trackId: number, violations: string[], timestamp: number
): { state: PPEState; triggerAlert: boolean; violations: string[] } {
  let trackState = state.tracks.get(trackId) || { violationFrames: 0, cooldownUntil: null, lastViolations: [] };
  
  if (trackState.cooldownUntil && timestamp < trackState.cooldownUntil) {
    return { state, triggerAlert: false, violations: [] };
  }
  
  if (violations.length > 0) {
    trackState.violationFrames++;
    trackState.lastViolations = violations;
  } else {
    trackState.violationFrames = 0;
    trackState.lastViolations = [];
  }
  
  const triggerAlert = trackState.violationFrames === state.persistenceThreshold;
  if (triggerAlert) {
    trackState.cooldownUntil = timestamp + state.cooldownSeconds;
    trackState.violationFrames = 0;
  }
  
  const newTracks = new Map(state.tracks);
  newTracks.set(trackId, trackState);
  return { state: { ...state, tracks: newTracks }, triggerAlert, violations: trackState.lastViolations };
}

