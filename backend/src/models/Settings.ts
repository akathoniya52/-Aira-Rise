// src/models/Settings.ts
// Persisted user / organization settings profile.

import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    // Single profile per session for this demo. Extensible to per-user later.
    sessionKey: { type: String, default: 'default', unique: true },
    role: { type: String, default: 'ward_officer' },
    language: { type: String, default: 'en' },
    activeRegion: { type: String, default: 'Mumbai Central - Ward F-North' },
    officerName: { type: String, default: 'Anjali Sharma' },
    organization: {
      type: String,
      default: 'Brihanmumbai Municipal Corporation (BMC) — Ward F-North',
    },
    geminiApiKey: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);

export const Settings = mongoose.model('Settings', SettingsSchema);
