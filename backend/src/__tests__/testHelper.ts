// backend/src/__tests__/testHelper.ts
import { Readable } from 'stream';
import { EventEmitter } from 'events';
import type { Express } from 'express';

export interface MockResponse {
  status: number;
  headers: Record<string, string>;
  json: <T = any>() => Promise<T>;
  text: () => Promise<string>;
}

export interface MockRequestOptions {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

export function requestApp(
  app: Express,
  options: MockRequestOptions
): Promise<MockResponse> {
  return new Promise((resolve, reject) => {
    const { method = 'GET', url, headers = {}, body } = options;

    const payload =
      body !== undefined
        ? typeof body === 'object'
          ? JSON.stringify(body)
          : String(body)
        : null;

    const req: any =
      payload !== null ? Readable.from([Buffer.from(payload)]) : Readable.from([]);

    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      host: 'localhost',
      ...(payload !== null
        ? {
            'content-type': 'application/json',
            'content-length': String(Buffer.byteLength(payload)),
          }
        : {}),
      ...headers,
    };
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = req.connection;

    const resHeaders: Record<string, string> = {};
    const chunks: Buffer[] = [];

    const res: any = new EventEmitter();
    res.statusCode = 200;

    res.setHeader = (key: string, value: any) => {
      resHeaders[key.toLowerCase()] = String(value);
      return res;
    };
    res.set = res.setHeader;
    res.header = res.setHeader;
    res.getHeader = (key: string) => resHeaders[key.toLowerCase()];
    res.get = res.getHeader;
    res.removeHeader = (key: string) => {
      delete resHeaders[key.toLowerCase()];
    };

    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };

    res.writeHead = (code: number, headersOrReason?: any, extraHeaders?: any) => {
      res.statusCode = code;
      const h = typeof headersOrReason === 'object' ? headersOrReason : extraHeaders;
      if (h) {
        Object.entries(h).forEach(([k, v]) => {
          resHeaders[k.toLowerCase()] = String(v);
        });
      }
      return res;
    };

    res.write = (chunk: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      return true;
    };

    res.end = (chunk?: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      const rawText = Buffer.concat(chunks).toString('utf8');

      resolve({
        status: res.statusCode,
        headers: resHeaders,
        json: async () => {
          try {
            return JSON.parse(rawText);
          } catch (e) {
            throw new Error(`Failed to parse response (status ${res.statusCode}) as JSON: "${rawText}"`);
          }
        },
        text: async () => rawText,
      });
    };

    try {
      app(req, res);
    } catch (err) {
      reject(err);
    }
  });
}
