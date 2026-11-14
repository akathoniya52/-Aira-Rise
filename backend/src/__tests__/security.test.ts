// backend/src/__tests__/security.test.ts
import { describe, it, expect } from 'vitest';
import { app, sanitizeSessionKey, maskApiKey } from '../app.js';
import { requestApp } from './testHelper.js';

describe('AiraRise Application Security & Defense Suite', () => {
  describe('NoSQL Injection Neutralization', () => {
    it('should sanitize object-based NoSQL injection attempts to default', () => {
      const maliciousPayloads = [
        { $ne: null },
        { $gt: '' },
        { $where: 'sleep(1000)' },
        ['session1', 'session2'],
        null,
        undefined,
        12345,
      ];

      for (const payload of maliciousPayloads) {
        const sanitized = sanitizeSessionKey(payload);
        expect(sanitized).toBe('default');
      }
    });

    it('should strip special injection characters from malicious strings', () => {
      const injectionStrings = [
        'session; DROP TABLE users;--',
        'session{"$gt": ""}',
        'session$where',
        'session<script>alert(1)</script>',
        'session/../etc/passwd',
      ];

      for (const str of injectionStrings) {
        const sanitized = sanitizeSessionKey(str);
        expect(sanitized).not.toContain('$');
        expect(sanitized).not.toContain('{');
        expect(sanitized).not.toContain('}');
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('/');
      }
    });

    it('should safely preserve legitimate alphanumeric and hyphenated keys', () => {
      expect(sanitizeSessionKey('ward_f_north')).toBe('ward_f_north');
      expect(sanitizeSessionKey('user-session-123')).toBe('user-session-123');
      expect(sanitizeSessionKey('officer.sharma@bmc.gov.in')).toBe('officer.sharma@bmc.gov.in');
    });

    it('should handle malicious query parameters over HTTP without server crash', async () => {
      const res = await requestApp(app, {
        url: '/api/v1/telemetry?sessionKey[$ne]=null',
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('Sensitive Secret Protection & Masking', () => {
    it('should mask standard length API keys properly', () => {
      const realKey = 'AIzaSyBN1234567890abcdefghijklmnopqrst';
      const masked = maskApiKey(realKey);

      expect(masked).toContain('...');
      expect(masked.startsWith('AIza')).toBe(true);
      expect(masked.endsWith('rst')).toBe(true);
      expect(masked).not.toBe(realKey);
      expect(masked).not.toContain('1234567890');
    });

    it('should safely handle empty or short keys without throwing', () => {
      expect(maskApiKey('')).toBe('');
      expect(maskApiKey(undefined)).toBe('');
      expect(maskApiKey('abc')).toBe('********');
    });
  });

  describe('HTTP Security Headers (OWASP Hardening)', () => {
    it('should emit standard security headers on API responses', async () => {
      const res = await requestApp(app, { url: '/api/v1/health' });

      // X-Content-Type-Options
      expect(res.headers['x-content-type-options']).toBe('nosniff');

      // X-Frame-Options (Clickjacking defense)
      expect(res.headers['x-frame-options']).toBe('DENY');

      // Strict-Transport-Security (HSTS)
      expect(res.headers['strict-transport-security']).toContain('max-age=31536000');

      // Hide X-Powered-By
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });
});
