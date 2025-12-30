import type { KalmanState, Point } from '../types';

export function initKalman2D(point: Point): KalmanState {
  return { x: point.x, y: point.y, vx: 0, vy: 0, P: 1000 };
}

export function kalman2DUpdate(
  state: KalmanState,
  measurement: Point,
  dt: number = 1/25
): KalmanState {
  const Q = 0.1, R = 5;
  const xPred = state.x + state.vx * dt;
  const yPred = state.y + state.vy * dt;
  const PPred = state.P + Q;
  const K = PPred / (PPred + R);
  const xNew = xPred + K * (measurement.x - xPred);
  const yNew = yPred + K * (measurement.y - yPred);
  const vxNew = (xNew - state.x) / dt;
  const vyNew = (yNew - state.y) / dt;
  return { x: xNew, y: yNew, vx: vxNew, vy: vyNew, P: (1 - K) * PPred };
}

export function getSpeedFromKalman2D(state: KalmanState): number {
  return Math.sqrt(state.vx ** 2 + state.vy ** 2);
}

export function pixelSpeedToKmh(pixelSpeed: number, metersPerPixel: number): number {
  return pixelSpeed * metersPerPixel * 3.6;
}

