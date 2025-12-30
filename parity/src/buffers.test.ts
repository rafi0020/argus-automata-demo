import { describe, it, expect, beforeEach } from 'vitest';
import {
  PersistenceBuffer,
  CooldownTracker,
  ClassSmoothingBuffer,
  createIntrusionTrackState,
  createThrowingTrackState,
} from './buffers';

describe('PersistenceBuffer', () => {
  let buffer: PersistenceBuffer;

  beforeEach(() => {
    buffer = new PersistenceBuffer(5);
  });

  it('starts empty', () => {
    expect(buffer.count()).toBe(0);
    expect(buffer.isFull()).toBe(false);
  });

  it('counts true values correctly', () => {
    buffer.push(true);
    buffer.push(false);
    buffer.push(true);
    expect(buffer.count()).toBe(2);
  });

  it('becomes full after maxSize pushes', () => {
    for (let i = 0; i < 5; i++) {
      buffer.push(true);
    }
    expect(buffer.isFull()).toBe(true);
  });

  it('overwrites old values when full', () => {
    // Fill with true
    for (let i = 0; i < 5; i++) {
      buffer.push(true);
    }
    expect(buffer.count()).toBe(5);

    // Push false values
    buffer.push(false);
    buffer.push(false);
    expect(buffer.count()).toBe(3);
  });

  it('resets correctly', () => {
    buffer.push(true);
    buffer.push(true);
    buffer.reset();
    expect(buffer.count()).toBe(0);
    expect(buffer.isFull()).toBe(false);
  });

  it('getBuffer returns correct order', () => {
    buffer.push(true);
    buffer.push(false);
    buffer.push(true);
    expect(buffer.getBuffer()).toEqual([true, false, true]);
  });

  it('size returns correct value', () => {
    expect(buffer.size()).toBe(0);
    buffer.push(true);
    expect(buffer.size()).toBe(1);
    buffer.push(false);
    expect(buffer.size()).toBe(2);
  });
});

describe('CooldownTracker', () => {
  let tracker: CooldownTracker;

  beforeEach(() => {
    tracker = new CooldownTracker();
  });

  it('returns false for unknown keys', () => {
    expect(tracker.isOnCooldown('unknown', 0)).toBe(false);
  });

  it('tracks cooldown correctly', () => {
    tracker.setCooldown('key1', 0, 10);
    expect(tracker.isOnCooldown('key1', 5)).toBe(true);
    expect(tracker.isOnCooldown('key1', 15)).toBe(false);
  });

  it('tracks multiple keys independently', () => {
    tracker.setCooldown('key1', 0, 10);
    tracker.setCooldown('key2', 5, 10);

    expect(tracker.isOnCooldown('key1', 8)).toBe(true);
    expect(tracker.isOnCooldown('key2', 8)).toBe(true);

    expect(tracker.isOnCooldown('key1', 12)).toBe(false);
    expect(tracker.isOnCooldown('key2', 12)).toBe(true);
  });

  it('returns remaining time correctly', () => {
    tracker.setCooldown('key1', 0, 10);
    expect(tracker.getRemainingTime('key1', 3)).toBe(7);
    expect(tracker.getRemainingTime('key1', 10)).toBe(0);
    expect(tracker.getRemainingTime('key1', 15)).toBe(0);
  });

  it('clears expired cooldowns', () => {
    tracker.setCooldown('key1', 0, 5);
    tracker.setCooldown('key2', 0, 15);
    
    tracker.clearExpired(10);
    
    expect(tracker.getRemainingTime('key1', 10)).toBe(0);
    expect(tracker.getRemainingTime('key2', 10)).toBe(5);
  });

  it('resets all cooldowns', () => {
    tracker.setCooldown('key1', 0, 10);
    tracker.setCooldown('key2', 0, 10);
    tracker.reset();
    
    expect(tracker.isOnCooldown('key1', 5)).toBe(false);
    expect(tracker.isOnCooldown('key2', 5)).toBe(false);
  });
});

describe('ClassSmoothingBuffer', () => {
  let buffer: ClassSmoothingBuffer;

  beforeEach(() => {
    buffer = new ClassSmoothingBuffer(5);
  });

  it('returns empty string when empty', () => {
    expect(buffer.getMajorityClass()).toBe('');
  });

  it('returns single class when only one present', () => {
    buffer.push('throwing');
    expect(buffer.getMajorityClass()).toBe('throwing');
  });

  it('returns majority class', () => {
    buffer.push('normal');
    buffer.push('throwing');
    buffer.push('throwing');
    buffer.push('throwing');
    buffer.push('normal');
    expect(buffer.getMajorityClass()).toBe('throwing');
  });

  it('handles tie by returning first encountered', () => {
    buffer.push('normal');
    buffer.push('throwing');
    // With 2 values, it depends on iteration order
    const result = buffer.getMajorityClass();
    expect(['normal', 'throwing']).toContain(result);
  });

  it('resets correctly', () => {
    buffer.push('throwing');
    buffer.push('throwing');
    buffer.reset();
    expect(buffer.getMajorityClass()).toBe('');
  });
});

describe('State Initializers', () => {
  it('creates intrusion track state with defaults', () => {
    const state = createIntrusionTrackState();
    expect(state.state).toBe('outside');
    expect(state.lastAlertTime).toBe(-Infinity);
    expect(state.buffer.count()).toBe(0);
  });

  it('creates intrusion track state with custom buffer size', () => {
    const state = createIntrusionTrackState(10);
    for (let i = 0; i < 10; i++) {
      state.buffer.push(true);
    }
    expect(state.buffer.isFull()).toBe(true);
  });

  it('creates throwing track state with defaults', () => {
    const state = createThrowingTrackState();
    expect(state.consecutiveCount).toBe(0);
    expect(state.lastAlertTime).toBe(-Infinity);
  });

  it('creates throwing track state with custom smoothing window', () => {
    const state = createThrowingTrackState(7);
    for (let i = 0; i < 7; i++) {
      state.smoothingBuffer.push('throwing');
    }
    expect(state.smoothingBuffer.getMajorityClass()).toBe('throwing');
  });
});

