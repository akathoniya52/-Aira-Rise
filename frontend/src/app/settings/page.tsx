'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApp, UserRole, Language } from '@/context/AppContext';

export default function SettingsPage() {
  const {
    role,
    setRole,
    language,
    setLanguage,
    geminiApiKey,
    officerName,
    setOfficerName,
    organization,
    setOrganization,
    saveSettingsProfile,
    persistenceStatus,
  } = useApp();

  // Gemini key is edited in a local buffer and committed on "Save Key".
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [keySaving, setKeySaving] = useState(false);
  const [keyMsg, setKeyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Profile save state.
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Keep the buffer in sync if the key is loaded from the backend / localStorage later.
  useEffect(() => {
    setApiKeyInput(geminiApiKey);
  }, [geminiApiKey]);

  const handleSaveKey = async () => {
    setKeySaving(true);
    const res = await saveSettingsProfile({ geminiApiKey: apiKeyInput });
    setKeySaving(false);
    setKeyMsg({
      ok: true,
      text: res.persisted
        ? 'Gemini API Key saved to cloud.'
        : 'Gemini API Key saved locally (backend offline).',
    });
    setTimeout(() => setKeyMsg(null), 3000);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const res = await saveSettingsProfile();
    setProfileSaving(false);
    setProfileMsg({
      ok: true,
      text: res.persisted
        ? 'Civic profile saved to cloud.'
        : 'Civic profile saved locally (backend offline).',
    });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-space-lg w-full max-w-4xl">
        {/* HEADER */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-mono text-secondary font-bold uppercase tracking-wider">
                System Configuration & Organization
              </span>
            </div>
            <span
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                persistenceStatus.online
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
              title="Persistence status"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${persistenceStatus.online ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              {persistenceStatus.online ? 'Cloud Synced' : 'Local Mode'} • {persistenceStatus.lastSync}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline-md text-primary tracking-tight">
            Settings & Civic Identity
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your organization profile, active sensor telemetry mesh nodes, Google Gemini API credentials, and notification thresholds. Changes are persisted to the AiraRise database.
          </p>
        </div>

        {/* GEMINI API CONFIGURATION */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">psychology</span>
              <div>
                <h2 className="text-base font-bold text-primary font-headline-sm">Google Gemini AI Credentials</h2>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Used for real-time telemetry interpretation, structured evidence reasoning, and multilingual citizen advisories.
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              Gemini 1.5 Pro / Flash
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-primary" htmlFor="gemini-key">
              Google Gemini API Key (Optional / Live Mode):
            </label>
            <div className="flex gap-2">
              <input
                id="gemini-key"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter AIzaSy... (or leave blank to use pre-validated deterministic engine)"
                className="flex-1 p-2 text-xs font-mono rounded-lg border border-outline-variant/40 bg-surface/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSaveKey}
                disabled={keySaving}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-all active:scale-95 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {keySaving ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Key
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              When an API key is entered, live requests call Google Gemini 1.5 Flash directly with JSON schema enforcement. Without an API key, the validated evidence-grounded mathematical engine executes without hallucination.
            </p>
            {keyMsg && (
              <div className={`p-2 text-xs font-mono font-bold rounded flex items-center gap-1.5 ${keyMsg.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined text-[16px]">{keyMsg.ok ? 'check_circle' : 'error'}</span>
                {keyMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* PROFILE & CIVIC ROLE */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-primary font-headline-sm">Civic Organization Profile</h2>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-all active:scale-95 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {profileSaving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-xs">
            <div>
              <label className="text-[10px] uppercase font-mono text-on-surface-variant font-bold" htmlFor="officer-name">
                Officer Name
              </label>
              <input
                id="officer-name"
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-surface border border-outline-variant/30 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-on-surface-variant font-bold" htmlFor="organization">
                Organization / Division
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-surface border border-outline-variant/30 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-on-surface-variant font-bold" htmlFor="active-role">
                Current Active Role
              </label>
              <select
                id="active-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full mt-1 p-2 rounded-lg bg-surface border border-outline-variant/30 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ward_officer">Municipal Ward Officer</option>
                <option value="housing_admin">Housing Society Administrator</option>
                <option value="school_admin">School Administrator</option>
                <option value="field_team">Ward-Level Field Team</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-on-surface-variant font-bold" htmlFor="active-language">
                Primary Language
              </label>
              <select
                id="active-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full mt-1 p-2 rounded-lg bg-surface border border-outline-variant/30 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {profileMsg && (
            <div className={`p-2 text-xs font-mono font-bold rounded flex items-center gap-1.5 ${profileMsg.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container text-on-error-container'}`}>
              <span className="material-symbols-outlined text-[16px]">{profileMsg.ok ? 'check_circle' : 'error'}</span>
              {profileMsg.text}
            </div>
          )}
        </div>

        {/* SENSOR & TELEMETRY FEEDS */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-space-md">
          <h2 className="text-base font-bold text-primary font-headline-sm">Telemetry Ingestion Sources</h2>

          <div className="flex flex-col gap-space-sm text-xs">
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-primary">Central Pollution Control Board (CPCB) CAAQMS Feed</div>
                <div className="text-[11px] text-on-surface-variant font-mono">18 Active Sensors in Ward F-North • 15-min sampling</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Synced</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-primary">India Meteorological Department (IMD) Colaba Doppler Radar</div>
                <div className="text-[11px] text-on-surface-variant font-mono">Micro-climate wind vectors & thermal inversion layer tracking</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Synced</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
