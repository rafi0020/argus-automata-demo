import { describe, it, expect } from 'vitest';
import {
  isPointInPolygon,
  getDistance,
  getBboxCenter,
  getBboxBottomCenter,
  bboxesOverlap,
  calculateIoU,
} from './geometry';

describe('isPointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  it('returns true for point inside polygon', () => {
    expect(isPointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
  });

  it('returns false for point outside polygon', () => {
    expect(isPointInPolygon({ x: 150, y: 50 }, square)).toBe(false);
  });

  it('returns false for point above polygon', () => {
    expect(isPointInPolygon({ x: 50, y: -10 }, square)).toBe(false);
  });

  it('returns false for point below polygon', () => {
    expect(isPointInPolygon({ x: 50, y: 110 }, square)).toBe(false);
  });

  it('handles triangle polygon', () => {
    const triangle = [
      { x: 50, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(isPointInPolygon({ x: 50, y: 50 }, triangle)).toBe(true);
    expect(isPointInPolygon({ x: 10, y: 10 }, triangle)).toBe(false);
  });

  it('handles complex polygon', () => {
    const lShape = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(isPointInPolygon({ x: 25, y: 25 }, lShape)).toBe(true);
    expect(isPointInPolygon({ x: 75, y: 75 }, lShape)).toBe(true);
    expect(isPointInPolygon({ x: 75, y: 25 }, lShape)).toBe(false);
  });

  it('returns false for insufficient vertices', () => {
    expect(isPointInPolygon({ x: 50, y: 50 }, [])).toBe(false);
    expect(isPointInPolygon({ x: 50, y: 50 }, [{ x: 0, y: 0 }])).toBe(false);
    expect(isPointInPolygon({ x: 50, y: 50 }, [{ x: 0, y: 0 }, { x: 100, y: 0 }])).toBe(false);
  });
});

describe('getDistance', () => {
  it('calculates distance between two points', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('returns 0 for same point', () => {
    expect(getDistance({ x: 10, y: 20 }, { x: 10, y: 20 })).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
  });

  it('calculates vertical distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(10);
  });

  it('handles negative coordinates', () => {
    expect(getDistance({ x: -5, y: -5 }, { x: 5, y: 5 })).toBeCloseTo(14.142, 2);
  });
});

describe('getBboxCenter', () => {
  it('calculates center of bounding box', () => {
    const center = getBboxCenter([0, 0, 100, 100]);
    expect(center.x).toBe(50);
    expect(center.y).toBe(50);
  });

  it('handles non-square bbox', () => {
    const center = getBboxCenter([10, 20, 50, 80]);
    expect(center.x).toBe(30);
    expect(center.y).toBe(50);
  });
});

describe('getBboxBottomCenter', () => {
  it('calculates bottom center of bounding box', () => {
    const bottom = getBboxBottomCenter([0, 0, 100, 100]);
    expect(bottom.x).toBe(50);
    expect(bottom.y).toBe(100);
  });

  it('handles offset bbox', () => {
    const bottom = getBboxBottomCenter([100, 200, 200, 400]);
    expect(bottom.x).toBe(150);
    expect(bottom.y).toBe(400);
  });
});

describe('bboxesOverlap', () => {
  it('returns true for overlapping boxes', () => {
    expect(bboxesOverlap([0, 0, 50, 50], [25, 25, 75, 75])).toBe(true);
  });

  it('returns false for non-overlapping boxes (horizontal)', () => {
    expect(bboxesOverlap([0, 0, 50, 50], [60, 0, 100, 50])).toBe(false);
  });

  it('returns false for non-overlapping boxes (vertical)', () => {
    expect(bboxesOverlap([0, 0, 50, 50], [0, 60, 50, 100])).toBe(false);
  });

  it('returns true for contained box', () => {
    expect(bboxesOverlap([0, 0, 100, 100], [25, 25, 75, 75])).toBe(true);
  });

  it('returns true for touching boxes', () => {
    expect(bboxesOverlap([0, 0, 50, 50], [50, 0, 100, 50])).toBe(false);
  });
});

describe('calculateIoU', () => {
  it('returns 1 for identical boxes', () => {
    expect(calculateIoU([0, 0, 100, 100], [0, 0, 100, 100])).toBe(1);
  });

  it('returns 0 for non-overlapping boxes', () => {
    expect(calculateIoU([0, 0, 50, 50], [60, 60, 100, 100])).toBe(0);
  });

  it('calculates correct IoU for partial overlap', () => {
    // 50x50 boxes with 25x25 overlap
    // Intersection = 625, Union = 2500 + 2500 - 625 = 4375
    // IoU = 625 / 4375 ≈ 0.143
    const iou = calculateIoU([0, 0, 50, 50], [25, 25, 75, 75]);
    expect(iou).toBeCloseTo(0.143, 2);
  });

  it('returns correct IoU for 50% overlap', () => {
    // Two 100x100 boxes, one shifted 50 pixels right
    // Intersection = 50x100 = 5000, Union = 10000 + 10000 - 5000 = 15000
    // IoU = 5000 / 15000 ≈ 0.333
    const iou = calculateIoU([0, 0, 100, 100], [50, 0, 150, 100]);
    expect(iou).toBeCloseTo(0.333, 2);
  });
});

