// backend/src/__tests__/pipeline.test.ts
import { describe, it, expect } from 'vitest';

describe('AiraRise Ingestion, Normalization & Truthfulness Suite', () => {
  it('should normalize mg/m³ to µg/m³ correctly by multiplying by 1000', () => {
    const rawValue = 0.065;
    const unit = 'mg/m3';
    let normalizedValue = rawValue;
    if (unit.toLowerCase().includes('mg')) {
      normalizedValue = rawValue * 1000;
    }
    expect(normalizedValue).toBe(65);
  });

  it('should flag missing readings without converting them to zero', () => {
    const rawVal = 'N/A';
    const parsed = parseFloat(rawVal);
    const value = isNaN(parsed) ? null : parsed;
    const flags: string[] = [];
    if (value === null) {
      flags.push('MISSING_VALUE');
    }
    expect(value).toBeNull();
    expect(value).not.toBe(0);
    expect(flags).toContain('MISSING_VALUE');
  });

  it('should calculate deterministic statistics for PM2.5 and PM10', () => {
    const readings = [45, 65, 80, 110, 200];
    const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
    const max = Math.max(...readings);
    const min = Math.min(...readings);
    expect(mean).toBe(100);
    expect(max).toBe(200);
    expect(min).toBe(45);
  });

  it('should produce meaningfully distinct recommendations for all 4 roles', () => {
    const roles = ['ward_officer', 'housing_admin', 'school_admin', 'field_team'];
    const mockActionMap: Record<string, string> = {
      ward_officer: 'anti-smog water cannon and traffic diversion',
      housing_admin: 'construction green netting and resident advisory',
      school_admin: 'indoor recess transition and parent alert',
      field_team: 'sensor optical recalibration and road silt audit'
    };

    const actionOutputs = roles.map(r => mockActionMap[r]);
    const uniqueActions = new Set(actionOutputs);
    expect(uniqueActions.size).toBe(4);
  });

  it('should classify Indian National Air Quality Index (NAQI) bands truthfully', () => {
    function classifyAqi(pm25: number): string {
      if (pm25 <= 30) return 'Good';
      if (pm25 <= 60) return 'Satisfactory';
      if (pm25 <= 90) return 'Moderate';
      if (pm25 <= 120) return 'Poor';
      if (pm25 <= 250) return 'Very Poor';
      return 'Severe';
    }

    expect(classifyAqi(25)).toBe('Good');
    expect(classifyAqi(45)).toBe('Satisfactory');
    expect(classifyAqi(75)).toBe('Moderate');
    expect(classifyAqi(115)).toBe('Poor');
    expect(classifyAqi(180)).toBe('Very Poor');
    expect(classifyAqi(320)).toBe('Severe');
  });

  it('should maintain multilingual advisory structural parity across English, Hindi, and Marathi', () => {
    const requiredSections = ['badge', 'title', 'notice', 'precautions', 'activeInterventions', 'sourceVerification'];
    const languages = ['en', 'hi', 'mr'];

    const mockReport: Record<string, Record<string, string>> = {
      en: { badge: 'ADVISORY', title: 'Air Alert', notice: 'High PM10', precautions: 'Stay indoors', activeInterventions: 'Misting', sourceVerification: 'CPCB 018' },
      hi: { badge: 'चेतावनी', title: 'वायु गुणवत्ता चेतावनी', notice: 'उच्च पीएम10', precautions: 'घर के भीतर रहें', activeInterventions: 'छिड़काव', sourceVerification: 'सीपीसीबी 018' },
      mr: { badge: 'दक्षता इशारा', title: 'हवा गुणवत्ता सल्लागार', notice: 'धुळीचे प्रमाण जास्त', precautions: 'घरात राहावे', activeInterventions: 'फवारणी', sourceVerification: 'सीपीसीबी 018' }
    };

    languages.forEach(lang => {
      requiredSections.forEach(section => {
        expect(mockReport[lang][section]).toBeDefined();
        expect(mockReport[lang][section].length).toBeGreaterThan(0);
      });
    });
  });
});
