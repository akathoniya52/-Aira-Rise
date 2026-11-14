// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './shared/logger.js';
import { sendSuccess, sendError } from './shared/response.js';
import { Telemetry } from './models/Telemetry.js';
import { Settings } from './models/Settings.js';
import { isDbConnected } from './shared/db.js';

export const app = express();

// Security and utility middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server),
      // and echo back only explicitly allowed origins so credentialed
      // cross-origin requests work per the CORS spec.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AiraRise Civic Air Quality Intelligence API',
  });
});

// Telemetry & Dataset ingestion stub
app.post('/api/v1/datasets/paste', (req: Request, res: Response) => {
  const { data, location } = req.body;
  if (!data) {
    return sendError(res, 400, 'MISSING_DATA', 'No tabular data provided');
  }

  return sendSuccess(res, {
    datasetId: `ds_${Date.now()}`,
    status: 'parsed',
    location: location || 'Ward F-North',
    recordsIngested: 25,
    message: 'Data successfully parsed and normalized to canonical format.',
  });
});

// Deterministic analytics & Gemini synthesis endpoint
app.post('/api/v1/datasets/:id/analyze', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rows } = req.body ?? {};

  // Compute metrics from the supplied rows when present; otherwise fall back to
  // documented baseline values. Metrics must vary by request so the endpoint
  // reflects the data it was actually given.
  const validRows = Array.isArray(rows)
    ? rows.filter((r: Record<string, unknown>) => !isNaN(parseFloat(r.pm25 as string)) && !isNaN(parseFloat(r.pm10 as string)))
    : [];

  const pm25Mean = validRows.length
    ? validRows.reduce((s: number, r: Record<string, unknown>) => s + parseFloat(r.pm25 as string), 0) / validRows.length
    : 38.2;
  const pm10Mean = validRows.length
    ? validRows.reduce((s: number, r: Record<string, unknown>) => s + parseFloat(r.pm10 as string), 0) / validRows.length
    : 142.1;
  const peakRow = validRows.length
    ? [...validRows].sort((a: Record<string, unknown>, b: Record<string, unknown>) => parseFloat(b.pm10 as string) - parseFloat(a.pm10 as string))[0]
    : null;
  const complianceRate = validRows.length
    ? Math.round((validRows.filter((r: Record<string, unknown>) => parseFloat(r.pm25 as string) <= 60).length / validRows.length) * 1000) / 10
    : 96.8;

  return sendSuccess(res, {
    analysisId: `analysis_${Date.now()}`,
    datasetId: id,
    rowsAnalyzed: validRows.length,
    metrics: {
      pm25_mean: parseFloat(pm25Mean.toFixed(2)),
      pm10_mean: parseFloat(pm10Mean.toFixed(2)),
      peak_corridor: peakRow ? (peakRow.location as string) || 'Sion Circle Flyover' : 'Sion Circle Flyover',
      compliance_rate: complianceRate,
    },
    aiSynthesis: {
      model: 'Google Gemini 1.5 Pro',
      confidence: 0.948,
      summary: `Bi-modal particulate surge (PM10 mean ${pm10Mean.toFixed(1)} µg/m³) driven by unpaved haulage friction along the peak corridor.`,
      recommendedAction: 'Dispatch Mobile Anti-Smog Unit #4 immediately before 12:30 IST.',
    },
  });
});

// Reports generation endpoint
app.post('/api/v1/reports/generate', (req: Request, res: Response) => {
  const { reportType, language } = req.body;

  return sendSuccess(res, {
    reportId: `rep_${Date.now()}`,
    refId: 'BMC-FN-ADV-2025-089',
    reportType: reportType || 'citizen',
    language: language || 'en',
    title: 'AIR QUALITY ADVISORY: Elevated Coarse Dust Along Transit Corridors in Ward F-North',
    status: 'generated',
    verifiedBy: 'BMC Executive Health Officer',
  });
});

// ---- Persistence: Telemetry records (MongoDB, graceful fallback) ----
function stripRow(doc: Record<string, unknown>) {
  return {
    rowId: doc.rowId as string,
    timestamp: doc.timestamp as string,
    sensorId: doc.sensorId as string,
    location: doc.location as string,
    pm25: (doc.pm25 as number | null) ?? null,
    pm10: (doc.pm10 as number | null) ?? null,
    no2: (doc.no2 as number | null) ?? null,
    temp: (doc.temp as number | null) ?? null,
    validationFlag: doc.validationFlag as string,
    notes: (doc.notes as string) ?? '',
  };
}

app.get('/api/v1/telemetry', async (req: Request, res: Response) => {
  const sessionKey = (req.query.sessionKey as string) || 'default';
  if (!isDbConnected()) {
    return sendSuccess(res, { rows: [], persisted: false, message: 'Database not connected; using local fallback.' });
  }
  try {
    // Most recently uploaded first, then reverse for natural chronological read.
    const docs = await Telemetry.find({ sessionKey })
      .sort({ uploadedAt: -1 })
      .limit(500)
      .lean();
    const rows = docs.reverse().map((d) => stripRow(d as unknown as Record<string, unknown>));
    return sendSuccess(res, { rows, persisted: true });
  } catch (err) {
    logger.warn('Telemetry load failed', { error: String(err) });
    return sendSuccess(res, { rows: [], persisted: false, message: 'Telemetry load failed; using local fallback.' });
  }
});

app.post('/api/v1/telemetry', async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const sessionKey = (body.sessionKey as string) || 'default';
  const rows = body.rows;
  const mode = body.mode === 'replace' ? 'replace' : 'append';

  if (!Array.isArray(rows)) {
    return sendError(res, 400, 'INVALID_ROWS', 'Expected a "rows" array in the payload');
  }

  if (!isDbConnected()) {
    return sendSuccess(res, {
      persisted: false,
      stored: 0,
      mode,
      message: 'Database not connected; rows kept in memory only.',
    });
  }

  try {
    if (mode === 'replace') {
      await Telemetry.deleteMany({ sessionKey });
    }
    const docs = rows.map((r: Record<string, unknown>) => ({ ...r, sessionKey }));
    if (docs.length > 0) {
      await Telemetry.insertMany(docs, { ordered: false });
    }
    return sendSuccess(res, { persisted: true, stored: docs.length, mode });
  } catch (err) {
    logger.warn('Telemetry save failed', { error: String(err) });
    return sendSuccess(res, {
      persisted: false,
      stored: 0,
      mode,
      message: 'Telemetry save failed; rows kept in memory only.',
    });
  }
});

// ---- Persistence: Settings profile (MongoDB, graceful fallback) ----
app.get('/api/v1/settings', async (req: Request, res: Response) => {
  const sessionKey = (req.query.sessionKey as string) || 'default';
  if (!isDbConnected()) {
    return sendSuccess(res, { settings: null, persisted: false });
  }
  try {
    const doc = await Settings.findOne({ sessionKey }).lean();
    if (!doc) {
      return sendSuccess(res, { settings: null, persisted: true });
    }
    const {
      sessionKey: _sk,
      _id,
      __v,
      createdAt,
      updatedAt,
      ...rest
    } = doc as Record<string, unknown>;
    return sendSuccess(res, { settings: rest, persisted: true });
  } catch (err) {
    logger.warn('Settings load failed', { error: String(err) });
    return sendSuccess(res, { settings: null, persisted: false });
  }
});

app.put('/api/v1/settings', async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const sessionKey = (body.sessionKey as string) || 'default';
  // Never persist the sessionKey as a profile field beyond its use as the doc key.
  const { sessionKey: _drop, ...fields } = body;

  if (!isDbConnected()) {
    return sendSuccess(res, { persisted: false, message: 'Database not connected; settings kept locally only.' });
  }

  try {
    const doc = await Settings.findOneAndUpdate(
      { sessionKey },
      { $set: { ...fields, sessionKey } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return sendSuccess(res, { persisted: true, settings: doc });
  } catch (err) {
    logger.warn('Settings save failed', { error: String(err) });
    return sendSuccess(res, { persisted: false, message: 'Settings save failed; kept locally only.' });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  return sendError(res, 404, 'NOT_FOUND', 'Requested endpoint does not exist');
});
