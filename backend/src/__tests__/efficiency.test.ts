// backend/src/__tests__/efficiency.test.ts
import { describe, it, expect } from 'vitest';
import { app } from '../app.js';
import { requestApp } from './testHelper.js';

describe('AiraRise Micro-Efficiency, Latency & Caching Suite', () => {
  it('should serve cached responses with X-Cache: HIT on repetitive requests', async () => {
    const payload = {
      reportType: 'citizen',
      language: 'en',
    };

    // First request - MISS
    const res1 = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/reports/generate',
      body: payload,
    });
    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache']).toBe('MISS');

    // Second request with same parameters - HIT
    const start = performance.now();
    const res2 = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/reports/generate',
      body: payload,
    });
    const duration = performance.now() - start;

    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache']).toBe('HIT');
    expect(duration).toBeLessThan(50);
  });

  it('should deliver analytical synthesis with low latency', async () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      location: `Sensor Station ${i % 5}`,
      pm25: 45 + (i % 20),
      pm10: 100 + (i % 50),
    }));

    const start = performance.now();
    const res = await requestApp(app, {
      method: 'POST',
      url: '/api/v1/datasets/ds_bench/analyze',
      body: { rows },
    });
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(150);
  });

  it('should provide HTTP Cache-Control on read endpoints', async () => {
    const res = await requestApp(app, {
      url: '/api/v1/telemetry?sessionKey=default',
    });
    expect(res.status).toBe(200);
    const cacheControl = res.headers['cache-control'];
    expect(cacheControl).toBeDefined();
    expect(cacheControl).toContain('max-age');
  });

  it('should execute 1,000 statistical calculations deterministically in under 10ms', () => {
    const data = Array.from({ length: 1000 }, (_, i) => 20 + (i % 180));

    const t0 = performance.now();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const variance = data.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);
    const elapsed = performance.now() - t0;

    expect(mean).toBeGreaterThan(0);
    expect(max).toBeGreaterThanOrEqual(min);
    expect(std).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(10);
  });
});
