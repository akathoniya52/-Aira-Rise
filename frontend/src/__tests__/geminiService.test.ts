// frontend/src/__tests__/geminiService.test.ts
import { describe, it, expect } from 'vitest';
import {
  analyzeTelemetryWithGemini,
  generateMultilingualReport,
} from '../services/geminiService';
import type { TelemetryRow, Hotspot } from '../context/AppContext';

describe('AiraRise Frontend Gemini & Deterministic Synthesis Engine', () => {
  const sampleTelemetry: TelemetryRow[] = [
    {
      rowId: '#001',
      timestamp: '2025-05-14 08:00',
      sensorId: 'SN-FN-01',
      location: 'Kingsway Wadala',
      pm25: 42.0,
      pm10: 105.0,
      no2: 22.0,
      temp: 31.0,
      validationFlag: 'Optimal Baseline',
    },
    {
      rowId: '#002',
      timestamp: '2025-05-14 08:15',
      sensorId: 'SN-FN-02',
      location: 'Sion Circle Flyover',
      pm25: 85.0,
      pm10: 245.0,
      no2: 38.0,
      temp: 32.5,
      validationFlag: 'Hotspot Anomaly Flagged',
    },
    {
      rowId: '#003',
      timestamp: '2025-05-14 08:30',
      sensorId: 'SN-FN-03',
      location: 'Matunga Station East',
      pm25: null,
      pm10: null,
      no2: 24.0,
      temp: 30.5,
      validationFlag: 'Missing Value',
    },
  ];

  const sampleHotspots: Hotspot[] = [
    {
      id: 'h1',
      name: 'Sion Circle Flyover Ramp',
      aqi: 245,
      severity: 'critical',
      culprit: 'Heavy Haulage Coarse Dust',
      trend: '+18% since 07:30 IST',
      action: 'Dispatch Mobile Anti-Smog Gun',
    },
  ];

  it('should generate evidence-grounded synthesis without hallucinating unverified rows', async () => {
    const analysis = await analyzeTelemetryWithGemini(
      sampleTelemetry,
      sampleHotspots,
      'ward_officer'
    );

    expect(analysis).toBeDefined();
    expect(analysis.summary).toContain('Sion Circle Flyover');
    expect(analysis.culprit).toContain('Resuspended Coarse Dust');
    expect(analysis.findings.length).toBeGreaterThanOrEqual(2);

    // Verify evidence citation refers to actual row (#002 or SN-FN-02)
    const evidenceStrings = analysis.findings.map(f => f.evidence).join(' ');
    expect(evidenceStrings).toMatch(/SN-FN-02|#002|245/);
  });

  it('should tailor prioritized recommendations to Ward Officer authority', async () => {
    const analysis = await analyzeTelemetryWithGemini(
      sampleTelemetry,
      sampleHotspots,
      'ward_officer'
    );

    expect(analysis.roleRecommendations.length).toBeGreaterThan(0);
    const wardRec = analysis.roleRecommendations[0];
    expect(wardRec.intendedRole).toBe('ward_officer');
    expect(wardRec.actionType).toBe('dispatch');
    expect(wardRec.title.toLowerCase()).toMatch(/anti-smog|curfew|cannon/);
  });

  it('should tailor prioritized recommendations to Housing Society Admin authority', async () => {
    const analysis = await analyzeTelemetryWithGemini(
      sampleTelemetry,
      sampleHotspots,
      'housing_admin'
    );

    expect(analysis.roleRecommendations.length).toBeGreaterThan(0);
    const housingRec = analysis.roleRecommendations[0];
    expect(housingRec.intendedRole).toBe('housing_admin');
    expect(housingRec.title.toLowerCase()).toMatch(/netting|resident|filter|construction/);
  });

  it('should generate synchronized multilingual citizen reports across EN, HI, MR', async () => {
    const enReport = await generateMultilingualReport('en', 'ward_officer', 'simple', sampleTelemetry);
    const hiReport = await generateMultilingualReport('hi', 'ward_officer', 'simple', sampleTelemetry);
    const mrReport = await generateMultilingualReport('mr', 'ward_officer', 'simple', sampleTelemetry);

    expect(enReport.badge).toContain('CITIZEN ADVISORY');
    expect(hiReport.badge).toContain('नागरिक');
    expect(mrReport.badge).toContain('नागरिक');

    // Composite AQI and dominant pollutant parity
    expect(enReport.compositeAqi).toBe(hiReport.compositeAqi);
    expect(hiReport.compositeAqi).toBe(mrReport.compositeAqi);

    // Precautions structure parity
    expect(enReport.precautions.children.length).toBeGreaterThan(0);
    expect(hiReport.precautions.children.length).toBeGreaterThan(0);
    expect(mrReport.precautions.children.length).toBeGreaterThan(0);
  });
});
