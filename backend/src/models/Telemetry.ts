// src/models/Telemetry.ts
// Persisted air-quality telemetry records (ingested CSV / pasted rows).

import mongoose from 'mongoose';

/**
 * Mirrors the frontend `TelemetryRow` shape so rows round-trip losslessly.
 * `pm25` / `pm10` may be null when a reading was missing — we store null, never
 * zero-impute, to preserve data-truthfulness.
 */
const TelemetrySchema = new mongoose.Schema(
  {
    sessionKey: { type: String, default: 'default', index: true },
    rowId: { type: String, required: true },
    timestamp: { type: String, default: '' },
    sensorId: { type: String, default: '' },
    location: { type: String, default: '' },
    pm25: { type: Number, default: null },
    pm10: { type: Number, default: null },
    no2: { type: Number, default: null },
    temp: { type: Number, default: null },
    validationFlag: { type: String, default: 'Optimal Baseline' },
    notes: { type: String, default: '' },
  },
  { _id: true, timestamps: { createdAt: 'uploadedAt', updatedAt: false } }
);

TelemetrySchema.index({ sessionKey: 1, uploadedAt: -1 });

export const Telemetry = mongoose.model('Telemetry', TelemetrySchema);
