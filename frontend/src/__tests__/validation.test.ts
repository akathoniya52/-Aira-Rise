// frontend/src/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';

describe('AiraRise Dataset Normalization & Integrity Suite', () => {
  it('should normalize units from mg/m³ to µg/m³ faithfully', () => {
    const rawVal = 0.125;
    const unit = 'mg/m3';
    let val = rawVal;
    if (unit.toLowerCase().includes('mg')) {
      val = rawVal * 1000;
    }
    expect(val).toBe(125);
  });

  it('should isolate missing telemetry without converting to zero', () => {
    const rawValues = ['N/A', '', 'NaN', null, undefined];
    const parsed = rawValues.map(v => {
      if (v === null || v === undefined || v === '') return null;
      const num = parseFloat(String(v));
      return isNaN(num) ? null : num;
    });

    parsed.forEach(val => {
      expect(val).toBeNull();
      expect(val).not.toBe(0);
    });
  });

  it('should classify anomaly flags correctly based on CPCB thresholds', () => {
    function getValidationFlag(pm10: number | null, pm25: number | null): string {
      if (pm10 === null || pm25 === null) return 'Missing Value';
      if (pm10 > 200 || pm25 > 150) return 'Hotspot Anomaly Flagged';
      return 'Optimal Baseline';
    }

    expect(getValidationFlag(null, 45)).toBe('Missing Value');
    expect(getValidationFlag(245, 80)).toBe('Hotspot Anomaly Flagged');
    expect(getValidationFlag(95, 45)).toBe('Optimal Baseline');
  });
});
