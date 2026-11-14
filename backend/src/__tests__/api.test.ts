// backend/src/__tests__/api.test.ts
import { describe, it, expect } from 'vitest';
import { app } from '../app.js';
import { requestApp } from './testHelper.js';

describe('AiraRise Full Backend REST API Integration Suite', () => {
  it('GET /health, /api/health, and /api/v1/health should return 200 with service metadata', async () => {
    for (const url of ['/health', '/api/health', '/api/v1/health']) {
      const res = await requestApp(app, { url });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('ok');
      expect(json.data.service).toContain('AiraRise');
      expect(typeof json.data.uptime).toBe('number');
      expect(typeof json.data.version).toBe('string');
    }
  });

  it('POST /api/v1/datasets/paste with valid data should return 200 and datasetId', async () => {
    const payload = {
      data: 'Location,Timestamp,PM2.5,PM10\nSion Circle,2025-05-14 08:30,245,380\nMatunga,2025-05-14 08:30,54,110',
      location: 'Ward F-North',
    };

    const res = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/datasets/paste',
      body: payload,
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.datasetId).toBeDefined();
    expect(json.data.status).toBe('parsed');
    expect(json.data.recordsIngested).toBe(2);
  });

  it('POST /api/v1/datasets/paste with empty data should return 400 validation error', async () => {
    const res = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/datasets/paste',
      body: { data: '' },
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/datasets/:id/analyze with custom rows should compute deterministic metrics', async () => {
    const rows = [
      { pm25: '40.0', pm10: '100.0', location: 'Matunga West' },
      { pm25: '60.0', pm10: '200.0', location: 'Sion Circle Flyover' },
    ];

    const res = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/datasets/ds_test123/analyze',
      body: { rows },
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.datasetId).toBe('ds_test123');
    expect(json.data.metrics.pm25_mean).toBe(50);
    expect(json.data.metrics.pm10_mean).toBe(150);
    expect(json.data.metrics.peak_corridor).toBe('Sion Circle Flyover');
    expect(json.data.metrics.compliance_rate).toBe(100);
    expect(json.data.aiSynthesis.model).toContain('Gemini');
  });

  it('POST /api/v1/reports/generate should return multilingual reports correctly', async () => {
    // English
    const resEn = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/reports/generate',
      body: { reportType: 'citizen', language: 'en' },
    });
    const jsonEn = await resEn.json();
    expect(resEn.status).toBe(200);
    expect(jsonEn.data.language).toBe('en');
    expect(jsonEn.data.title).toContain('AIR QUALITY ADVISORY');

    // Hindi
    const resHi = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/reports/generate',
      body: { reportType: 'citizen', language: 'hi' },
    });
    const jsonHi = await resHi.json();
    expect(resHi.status).toBe(200);
    expect(jsonHi.data.language).toBe('hi');
    expect(jsonHi.data.title).toContain('वायु गुणवत्ता');

    // Marathi
    const resMr = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/reports/generate',
      body: { reportType: 'citizen', language: 'mr' },
    });
    const jsonMr = await resMr.json();
    expect(resMr.status).toBe(200);
    expect(jsonMr.data.language).toBe('mr');
    expect(jsonMr.data.title).toContain('हवा गुणवत्ता');
  });

  it('GET /api/v1/telemetry should return 200 with standard response envelope', async () => {
    const res = await requestApp(app, { url: '/api/v1/telemetry?sessionKey=default' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.rows)).toBe(true);
  });

  it('POST /api/v1/telemetry should reject invalid rows payload with 400', async () => {
    const res = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/telemetry',
      body: { rows: 'not-an-array' },
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET & PUT /api/v1/settings should handle settings profile and mask API keys', async () => {
    // Put settings
    const putRes = await requestApp(app, {
      method: 'PUT',
      url: '/api/v1/settings',
      body: {
        sessionKey: 'test_session',
        officerName: 'Anjali Sharma',
        role: 'ward_officer',
        geminiApiKey: 'AIzaSyA1234567890abcdefghijklmnopqrst',
      },
    });
    const putJson = await putRes.json();
    expect(putRes.status).toBe(200);
    expect(putJson.success).toBe(true);

    // Get settings
    const getRes = await requestApp(app, {
      url: '/api/v1/settings?sessionKey=test_session',
    });
    const getJson = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getJson.success).toBe(true);
    if (getJson.data.settings?.geminiApiKey) {
      expect(getJson.data.settings.geminiApiKey).toContain('...');
      expect(getJson.data.settings.geminiApiKey).not.toBe('AIzaSyA1234567890abcdefghijklmnopqrst');
    }
  });

  it('Non-existent endpoints should return 404 NOT_FOUND', async () => {
    const res = await requestApp(app, { url: '/api/v1/non_existent_route' });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });
});
