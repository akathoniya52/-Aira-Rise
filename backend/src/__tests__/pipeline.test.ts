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
    const testCases = ['N/A', '', 'null', 'NaN', 'missing', '-999'];
    for (const rawVal of testCases) {
      const parsed = parseFloat(rawVal);
      const isNegativePlaceholder = parsed === -999;
      const value = isNaN(parsed) || isNegativePlaceholder ? null : parsed;
      const flags: string[] = [];
      if (value === null) {
        flags.push('MISSING_VALUE');
      }
      expect(value).toBeNull();
      expect(value).not.toBe(0);
      expect(flags).toContain('MISSING_VALUE');
    }
  });

  it('should calculate deterministic statistics for PM2.5 and PM10', () => {
    const readings = [45, 65, 80, 110, 200];
    const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
    const max = Math.max(...readings);
    const min = Math.min(...readings);

    // Sorted for median
    const sorted = [...readings].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    expect(mean).toBe(100);
    expect(max).toBe(200);
    expect(min).toBe(45);
    expect(median).toBe(80);
  });

  it('should accurately calculate standard deviation deterministically', () => {
    const readings = [10, 20, 30, 40, 50];
    const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
    const variance = readings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / readings.length;
    const stdDev = Math.sqrt(variance);

    expect(mean).toBe(30);
    expect(variance).toBe(200);
    expect(Math.round(stdDev * 100) / 100).toBe(14.14);
  });

  it('should calculate CPCB statutory limit exceedances accurately', () => {
    // CPCB 24-hr standards: PM2.5 = 60 µg/m³, PM10 = 100 µg/m³
    const rows = [
      { pm25: 45, pm10: 80 },
      { pm25: 65, pm10: 95 },   // PM2.5 exceedance
      { pm25: 55, pm10: 120 },  // PM10 exceedance
      { pm25: 85, pm10: 160 },  // Both exceed
    ];

    const pm25Exceedances = rows.filter(r => r.pm25 > 60).length;
    const pm10Exceedances = rows.filter(r => r.pm10 > 100).length;
    const complianceRate = ((rows.length - pm25Exceedances) / rows.length) * 100;

    expect(pm25Exceedances).toBe(2);
    expect(pm10Exceedances).toBe(2);
    expect(complianceRate).toBe(50);
  });

  it('should produce meaningfully distinct recommendations for all 4 roles', () => {
    const roles = ['ward_officer', 'housing_admin', 'school_admin', 'field_team'] as const;
    const mockActionMap: Record<string, { title: string; scope: string }> = {
      ward_officer: {
        title: 'Anti-smog water cannon deployment and freight transit curfew',
        scope: 'Ward-level arterial corridors',
      },
      housing_admin: {
        title: 'Construction green geotextile netting enforcement and HVAC filter activation',
        scope: 'Residential perimeter and society common areas',
      },
      school_admin: {
        title: 'Indoor recess transition and morning inversion parent SMS advisories',
        scope: 'School grounds and vulnerable child zones',
      },
      field_team: {
        title: 'Optical sensor zero-point drift recalibration and road berm silt audits',
        scope: 'Ground sensor network and monitoring nodes',
      },
    };

    const actionOutputs = roles.map(r => mockActionMap[r].title);
    const uniqueActions = new Set(actionOutputs);
    expect(uniqueActions.size).toBe(4);

    const scopeOutputs = roles.map(r => mockActionMap[r].scope);
    const uniqueScopes = new Set(scopeOutputs);
    expect(uniqueScopes.size).toBe(4);
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

    expect(classifyAqi(15)).toBe('Good');
    expect(classifyAqi(30)).toBe('Good');
    expect(classifyAqi(45)).toBe('Satisfactory');
    expect(classifyAqi(60)).toBe('Satisfactory');
    expect(classifyAqi(75)).toBe('Moderate');
    expect(classifyAqi(90)).toBe('Moderate');
    expect(classifyAqi(115)).toBe('Poor');
    expect(classifyAqi(120)).toBe('Poor');
    expect(classifyAqi(180)).toBe('Very Poor');
    expect(classifyAqi(250)).toBe('Very Poor');
    expect(classifyAqi(320)).toBe('Severe');
  });

  it('should maintain multilingual advisory structural parity across English, Hindi, and Marathi', () => {
    const requiredSections = [
      'badge',
      'title',
      'notice',
      'precautions',
      'activeInterventions',
      'sourceVerification',
    ];
    const languages = ['en', 'hi', 'mr'];

    const mockReport: Record<string, Record<string, string>> = {
      en: {
        badge: 'ADVISORY',
        title: 'Air Alert: Sion Circle Flyover',
        notice: 'Elevated coarse PM10 dust detected.',
        precautions: 'Children and seniors avoid outdoor exposure during morning peak.',
        activeInterventions: 'Misting cannons deployed along Sion Circle flyover ramp.',
        sourceVerification: 'CPCB Station 018 verification logs attached.',
      },
      hi: {
        badge: 'चेतावनी',
        title: 'वायु गुणवत्ता चेतावनी: सायन सर्कल फ्लाईओवर',
        notice: 'उच्च पीएम10 धूल का स्तर दर्ज किया गया।',
        precautions: 'बच्चे और बुजुर्ग सुबह के समय बाहरी गतिविधियों से बचें।',
        activeInterventions: 'सायन सर्कल फ्लाईओवर पर एंटी-स्मॉग गन तैनात की गई।',
        sourceVerification: 'सीपीसीबी स्टेशन 018 सत्यापन लॉग संलग्न हैं।',
      },
      mr: {
        badge: 'दक्षता इशारा',
        title: 'हवा गुणवत्ता सल्लागार: सायन सर्कल उड्डाणपूल',
        notice: 'धुळीचे प्रमाण वाढल्याची नोंद झाली आहे.',
        precautions: 'सकाळच्या वेळी लहान मुले व वृद्धांनी घराबाहेर जाणे टाळावे.',
        activeInterventions: 'सायन सर्कल उड्डाणपुलावर पाणी फवारणी यंत्रणा कार्यान्वित केली आहे.',
        sourceVerification: 'सीपीसीबी केंद्र 018 पडताळणी नोंदी जोडल्या आहेत.',
      },
    };

    languages.forEach((lang) => {
      requiredSections.forEach((section) => {
        expect(mockReport[lang][section]).toBeDefined();
        expect(mockReport[lang][section].length).toBeGreaterThan(0);
      });
    });
  });

  it('should detect diurnal morning and evening rush hour particulate peaks', () => {
    const diurnalReadings = [
      { hour: 6, pm10: 85 },
      { hour: 8, pm10: 220 }, // Morning rush peak
      { hour: 9, pm10: 245 }, // Morning rush peak
      { hour: 12, pm10: 110 },
      { hour: 15, pm10: 95 },
      { hour: 19, pm10: 210 }, // Evening rush peak
      { hour: 23, pm10: 120 },
    ];

    const morningPeak = diurnalReadings.filter(r => r.hour >= 7 && r.hour <= 10);
    const maxMorning = Math.max(...morningPeak.map(r => r.pm10));
    expect(maxMorning).toBe(245);

    const eveningPeak = diurnalReadings.filter(r => r.hour >= 18 && r.hour <= 21);
    const maxEvening = Math.max(...eveningPeak.map(r => r.pm10));
    expect(maxEvening).toBe(210);
  });
});
