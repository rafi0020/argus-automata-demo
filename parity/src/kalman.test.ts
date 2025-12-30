import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleKalman, PositionKalman, EMAFilter } from './kalman';

describe('SimpleKalman', () => {
  let kalman: SimpleKalman;

  beforeEach(() => {
    kalman = new SimpleKalman(0.1, 1, 0);
  });

  it('initializes with given value', () => {
    const k = new SimpleKalman(0.1, 1, 50);
    expect(k.getValue()).toBe(50);
  });

  it('smooths noisy measurements', () => {
    // Simulate noisy measurements around 100
    const measurements = [95, 105, 98, 102, 100, 97, 103, 99, 101, 100];
    let lastValue = 0;

    for (const m of measurements) {
      lastValue = kalman.update(m);
    }

    // After many updates, should converge near 100
    expect(lastValue).toBeGreaterThan(90);
    expect(lastValue).toBeLessThan(110);
  });

  it('responds faster with lower measurement noise', () => {
    const fastKalman = new SimpleKalman(0.1, 0.1, 0);
    const slowKalman = new SimpleKalman(0.1, 10, 0);

    fastKalman.update(100);
    slowKalman.update(100);

    // Fast kalman should be closer to measurement
    expect(fastKalman.getValue()).toBeGreaterThan(slowKalman.getValue());
  });

  it('resets correctly', () => {
    kalman.update(100);
    kalman.update(100);
    kalman.reset(50);
    expect(kalman.getValue()).toBe(50);
  });

  it('getCovariance returns value', () => {
    expect(kalman.getCovariance()).toBeGreaterThan(0);
  });

  it('covariance decreases with updates', () => {
    const initialCov = kalman.getCovariance();
    kalman.update(100);
    kalman.update(100);
    expect(kalman.getCovariance()).toBeLessThan(initialCov);
  });
});

describe('PositionKalman', () => {
  let kalman: PositionKalman;

  beforeEach(() => {
    kalman = new PositionKalman(0, 0, 0.1, 1, 0.04);
  });

  it('initializes at given position', () => {
    const k = new PositionKalman(100, 200);
    const pos = k.getPosition();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it('tracks moving object', () => {
    // Simulate object moving right at constant velocity
    for (let i = 0; i < 10; i++) {
      kalman.predict();
      kalman.update(i * 10, 50);
    }

    const pos = kalman.getPosition();
    expect(pos.x).toBeGreaterThan(80);
    expect(pos.y).toBeCloseTo(50, 0);
  });

  it('estimates velocity', () => {
    // Object moving diagonally
    for (let i = 0; i < 20; i++) {
      kalman.predict();
      kalman.update(i * 5, i * 3);
    }

    const vel = kalman.getVelocity();
    expect(vel.vx).toBeGreaterThan(0);
    expect(vel.vy).toBeGreaterThan(0);
  });

  it('calculates speed', () => {
    for (let i = 0; i < 10; i++) {
      kalman.predict();
      kalman.update(i * 10, i * 10);
    }

    const speed = kalman.getSpeed();
    expect(speed).toBeGreaterThan(0);
  });

  it('resets correctly', () => {
    kalman.update(100, 100);
    kalman.reset(50, 50);
    const pos = kalman.getPosition();
    expect(pos.x).toBe(50);
    expect(pos.y).toBe(50);
  });
});

describe('EMAFilter', () => {
  let filter: EMAFilter;

  beforeEach(() => {
    filter = new EMAFilter(0.3);
  });

  it('initializes on first value', () => {
    expect(filter.update(100)).toBe(100);
  });

  it('smooths subsequent values', () => {
    filter.update(100);
    const second = filter.update(200);
    // 0.3 * 200 + 0.7 * 100 = 60 + 70 = 130
    expect(second).toBe(130);
  });

  it('smooths more with lower alpha', () => {
    const smoothFilter = new EMAFilter(0.1);
    const roughFilter = new EMAFilter(0.9);

    smoothFilter.update(0);
    roughFilter.update(0);

    smoothFilter.update(100);
    roughFilter.update(100);

    // Lower alpha = slower response to changes
    expect(smoothFilter.getValue()).toBeLessThan(roughFilter.getValue());
  });

  it('converges to constant value', () => {
    for (let i = 0; i < 50; i++) {
      filter.update(100);
    }
    expect(filter.getValue()).toBeCloseTo(100, 5);
  });

  it('resets correctly', () => {
    filter.update(100);
    filter.update(200);
    filter.reset();
    expect(filter.update(50)).toBe(50);
  });
});

describe('Kalman Filter for Speed Smoothing', () => {
  it('smooths noisy speed readings', () => {
    const kalman = new SimpleKalman(0.5, 2, 30);
    
    // Simulate noisy speed readings around 45 km/h
    const noisyReadings = [42, 48, 44, 46, 45, 43, 47, 45, 44, 46];
    const smoothedReadings: number[] = [];

    for (const speed of noisyReadings) {
      smoothedReadings.push(kalman.update(speed));
    }

    // Calculate variance of smoothed vs original
    const originalVariance = calculateVariance(noisyReadings);
    const smoothedVariance = calculateVariance(smoothedReadings);

    // Smoothed should have lower variance
    expect(smoothedVariance).toBeLessThan(originalVariance);
  });
});

// Helper function
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}

