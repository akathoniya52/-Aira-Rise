'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeTelemetryWithGemini, AIAnalysisResult } from '@/services/geminiService';

export type UserRole = 'ward_officer' | 'housing_admin' | 'school_admin' | 'field_team';
export type Language = 'en' | 'hi' | 'mr';

// Backend persistence endpoint. When the backend / MongoDB is reachable, telemetry
// uploads and the settings profile are persisted there; otherwise the app falls
// back to in-memory state + localStorage so it keeps working.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SESSION_KEY = 'default';

export interface TelemetryRow {
  rowId: string;
  timestamp: string;
  sensorId: string;
  location: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  temp: number | null;
  validationFlag: 'Valid - High Spike' | 'Optimal Baseline' | 'Calibrated +1.2%' | 'Hospital Target Met' | 'Hotspot Anomaly Flagged' | 'Missing Value' | 'Invalid Number';
  notes?: string;
}

export interface Hotspot {
  rank: number;
  location: string;
  sensorId: string;
  severity: number; // 0 - 10
  primaryPollutant: string;
  concentration: string;
  rootCause: string;
  populationAtRisk: string;
  fieldSupervisor: string;
  triageCountdown: string;
  status: 'Critical' | 'Warning' | 'Moderate' | 'Safe Baseline';
}

export interface Intervention {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  deadline: string;
  geminiConfidence: number;
  description: string;
  targetLocation: string;
  responsibleGroup: string;
  evidenceCitation: string;
  status: 'Pending Dispatch' | 'In Progress' | 'Resolved' | 'Broadcasted';
  intendedRole: UserRole;
  actionType: 'dispatch' | 'advisory' | 'notice' | 'calibration';
}

export interface SettingsProfile {
  role: UserRole;
  language: Language;
  activeRegion: string;
  officerName: string;
  organization: string;
  geminiApiKey: string;
}

interface PersistenceStatus {
  online: boolean;
  lastSync: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  officerName: string;
  setOfficerName: (name: string) => void;
  organization: string;
  setOrganization: (org: string) => void;
  telemetryData: TelemetryRow[];
  addTelemetryRows: (rows: TelemetryRow[]) => void;
  hotspots: Hotspot[];
  interventions: Intervention[];
  dispatchIntervention: (id: string) => void;
  createIntervention: (intervention: Omit<Intervention, 'id'>) => void;
  lastSyncTime: string;
  refreshFeeds: () => void;
  isAiAnalyzing: boolean;
  triggerAiAnalysis: () => Promise<void>;
  aiAnalysisOutput: AIAnalysisResult | null;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  saveSettingsProfile: (overrides?: Partial<SettingsProfile>) => Promise<{ persisted: boolean; message?: string }>;
  persistenceStatus: PersistenceStatus;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const defaultTelemetry: TelemetryRow[] = [
  {
    rowId: '#001',
    timestamp: '2025-05-14 08:30',
    sensorId: 'SN-FN-04',
    location: 'Sion Circle Flyover',
    pm25: 68.4,
    pm10: 142.1,
    no2: 42.0,
    temp: 31.4,
    validationFlag: 'Valid - High Spike',
    notes: 'Traffic surge along flyover approach'
  },
  {
    rowId: '#002',
    timestamp: '2025-05-14 08:30',
    sensorId: 'SN-FN-09',
    location: "King's Circle Park",
    pm25: 32.1,
    pm10: 64.5,
    no2: 18.2,
    temp: 30.8,
    validationFlag: 'Optimal Baseline',
    notes: 'Tree canopy absorption buffer active'
  },
  {
    rowId: '#003',
    timestamp: '2025-05-14 08:30',
    sensorId: 'SN-FN-12',
    location: 'Matunga Central',
    pm25: 54.0,
    pm10: 110.2,
    no2: 35.1,
    temp: 31.1,
    validationFlag: 'Calibrated +1.2%',
    notes: 'Zero point drift adjusted against reference'
  },
  {
    rowId: '#004',
    timestamp: '2025-05-14 08:30',
    sensorId: 'SN-FN-18',
    location: 'Sion Hospital Quiet Zone',
    pm25: 28.5,
    pm10: 52.0,
    no2: 14.0,
    temp: 29.9,
    validationFlag: 'Hospital Target Met',
    notes: 'Perimeter mist curtains operating'
  },
  {
    rowId: '#005',
    timestamp: '2025-05-14 08:15',
    sensorId: 'SN-FN-04',
    location: 'Sion Circle Flyover',
    pm25: 245.0,
    pm10: 380.0,
    no2: 88.4,
    temp: 31.6,
    validationFlag: 'Hotspot Anomaly Flagged',
    notes: 'Unpaved transit shoulder friction breakdown'
  }
];

const defaultHotspots: Hotspot[] = [
  {
    rank: 1,
    location: 'Sion Circle Overpass',
    sensorId: 'SN-FN-04 (Sector 2)',
    severity: 9.2,
    primaryPollutant: 'PM10: 245 µg/m³',
    concentration: '245 µg/m³',
    rootCause: 'Unpaved construction corridor dust + 18-wheel freight transit',
    populationAtRisk: '14,250 residents',
    fieldSupervisor: 'R. Kadam (BMC)',
    triageCountdown: '05m : 42s',
    status: 'Critical'
  },
  {
    rank: 2,
    location: 'Wadala Terminal Gate 3',
    sensorId: 'SN-FN-19 (Sector 5)',
    severity: 7.8,
    primaryPollutant: 'NO2: 98 ppb',
    concentration: '98 ppb',
    rootCause: 'Heavy diesel idling at logistics queue + container shunting',
    populationAtRisk: '6,800 workers',
    fieldSupervisor: 'S. More (RTO)',
    triageCountdown: '18m : 10s',
    status: 'Warning'
  },
  {
    rank: 3,
    location: "King's Circle Traffic Node",
    sensorId: 'SN-FN-11 (Sector 3)',
    severity: 5.4,
    primaryPollutant: 'PM2.5: 72 µg/m³',
    concentration: '72 µg/m³',
    rootCause: 'Traffic bottleneck during signal phase desynchronization',
    populationAtRisk: '9,400 commuters',
    fieldSupervisor: 'V. Patil (Traffic)',
    triageCountdown: 'Controlled',
    status: 'Moderate'
  },
  {
    rank: 4,
    location: 'Five Gardens Botanical Reserve',
    sensorId: 'SN-FN-29 (Sector 1)',
    severity: 1.2,
    primaryPollutant: 'AQI: 35 (Optimal)',
    concentration: '35 AQI',
    rootCause: 'Dense tree canopy filtration zone • Negative baseline reference',
    populationAtRisk: 'Optimal Sanctuary',
    fieldSupervisor: 'A. Sharma (BMC)',
    triageCountdown: 'Safe Baseline',
    status: 'Safe Baseline'
  }
];

const defaultInterventions: Intervention[] = [
  {
    id: 'int-1',
    title: 'Deploy High-Pressure Anti-Smog Gun to Sion Circle Flyover',
    priority: 'CRITICAL',
    deadline: '12:30 IST (18 mins remaining)',
    geminiConfidence: 98.4,
    description: 'Sustained PM10 concentration exceeding 240 µg/m³ due to dry haulage dust and transit friction under south ramp. Rapid ground misting required before mid-day traffic peak.',
    targetLocation: 'Sion Circle South Ramp (Node SN-FN-04)',
    responsibleGroup: 'Ward Field Team A (Lead: Deepak K.)',
    evidenceCitation: 'Telemetry row #005; verified 3.2x baseline spike; IMD wind stagnation window (0.4 m/s NW) locks particles in flyover underpass.',
    status: 'Pending Dispatch',
    intendedRole: 'ward_officer',
    actionType: 'dispatch'
  },
  {
    id: 'int-2',
    title: 'Issue Sensitive Group Indoor Advisory to Sion Municipal Schools',
    priority: 'HIGH',
    deadline: 'Today, 11:00 IST',
    geminiConfidence: 94.2,
    description: 'Protect 1,840 primary and secondary students by transitioning outdoor physical education to indoor study halls during the expected mid-morning inversion layer trapping ground particulates.',
    targetLocation: 'Sion Municipal Ward School Cluster (4 Campuses)',
    responsibleGroup: 'School Administrators & Ward Education Officer',
    evidenceCitation: 'Ref: BMC/EDU/AQI-2025/08. Sion Hospital sensor records continuous 42-min breach above 45 µg/m³ fine particulate threshold.',
    status: 'Pending Dispatch',
    intendedRole: 'school_admin',
    actionType: 'advisory'
  },
  {
    id: 'int-3',
    title: 'Issue Dust Mitigation Notice to Wadala Transit Hub Construction Site',
    priority: 'HIGH',
    deadline: 'Enforce by 14:00 IST',
    geminiConfidence: 91.5,
    description: 'Airborne PM2.5 readings within 200m perimeter violate BMC Clean Air Guideline 2024. Mandate 25-foot perimeter green netting and continuous wet suppression on haul routes.',
    targetLocation: 'Wadala Metro Depot Worksite (Plot 14-B)',
    responsibleGroup: 'Municipal Compliance & Enforcement Squad',
    evidenceCitation: 'Optical counter SN-FN-22 registered 4.8% variation with localized dust plume trajectory crossing eastern peripheral wall.',
    status: 'Pending Dispatch',
    intendedRole: 'housing_admin',
    actionType: 'notice'
  },
  {
    id: 'int-4',
    title: 'Recalibrate Optical Particle Counter SN-FN-11 (Matunga Station)',
    priority: 'MEDIUM',
    deadline: 'Scheduled: 15:30 IST',
    geminiConfidence: 96.0,
    description: 'Sensor drift detected: +4.8% variation against nearby reference CPCB station. Self-diagnostic flagged lens condensation and humidity skew on inlet chamber.',
    targetLocation: 'Matunga Central Railway East Gate',
    responsibleGroup: 'Technical Field Maint. (Rohit M.)',
    evidenceCitation: 'Zero point drift monitoring audit log timestamp 2025-05-14 08:00 IST.',
    status: 'Pending Dispatch',
    intendedRole: 'field_team',
    actionType: 'calibration'
  }
];

const DEFAULT_SETTINGS: SettingsProfile = {
  role: 'ward_officer',
  language: 'en',
  activeRegion: 'Mumbai Central - Ward F-North',
  officerName: 'Anjali Sharma',
  organization: 'Brihanmumbai Municipal Corporation (BMC) — Ward F-North',
  geminiApiKey: '',
};

// Fetch with a timeout so an unreachable backend fails fast instead of hanging.
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(DEFAULT_SETTINGS.role);
  const [language, setLanguage] = useState<Language>(DEFAULT_SETTINGS.language);
  const [activeRegion, setActiveRegion] = useState(DEFAULT_SETTINGS.activeRegion);
  const [officerName, setOfficerNameState] = useState(DEFAULT_SETTINGS.officerName);
  const [organization, setOrganizationState] = useState(DEFAULT_SETTINGS.organization);
  const [telemetryData, setTelemetryData] = useState<TelemetryRow[]>(defaultTelemetry);
  const [hotspots, setHotspots] = useState<Hotspot[]>(defaultHotspots);
  const [interventions, setInterventions] = useState<Intervention[]>(defaultInterventions);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisOutput, setAiAnalysisOutput] = useState<AIAnalysisResult | null>(null);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>({
    online: false,
    lastSync: 'Initializing…',
  });

  useEffect(() => {
    // 1. Hydrate from localStorage (instant offline cache).
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('AIRARISE_GEMINI_API_KEY');
      if (storedKey) setGeminiApiKeyState(storedKey);
      const storedRole = localStorage.getItem('AIRARISE_ROLE') as UserRole | null;
      if (storedRole) setRoleState(storedRole);
      const storedName = localStorage.getItem('AIRARISE_OFFICER_NAME');
      if (storedName) setOfficerNameState(storedName);
      const storedOrg = localStorage.getItem('AIRARISE_ORGANIZATION');
      if (storedOrg) setOrganizationState(storedOrg);
    }

    // 2. Hydrate from the backend (source of truth) when reachable. Falls back to
    //    defaults / localStorage above on any failure, so the app never breaks.
    (async () => {
      try {
        const [telRes, setRes] = await Promise.all([
          fetchWithTimeout(`${API_URL}/telemetry?sessionKey=${SESSION_KEY}`),
          fetchWithTimeout(`${API_URL}/settings?sessionKey=${SESSION_KEY}`),
        ]);

        if (telRes.ok) {
          const telJson = await telRes.json();
          const rows: TelemetryRow[] | undefined = telJson?.data?.rows;
          // Replace seed data with persisted records only when they exist.
          if (Array.isArray(rows) && rows.length > 0) {
            setTelemetryData(rows);
          }
        }

        if (setRes.ok) {
          const setJson = await setRes.json();
          const s = setJson?.data?.settings;
          if (s && typeof s === 'object') {
            if (s.role) setRoleState(s.role as UserRole);
            if (s.language) setLanguage(s.language as Language);
            if (s.activeRegion) setActiveRegion(s.activeRegion);
            if (s.officerName) setOfficerNameState(s.officerName);
            if (s.organization) setOrganizationState(s.organization);
            if (typeof s.geminiApiKey === 'string' && s.geminiApiKey) setGeminiApiKeyState(s.geminiApiKey);
          }
        }

        setPersistenceStatus({ online: true, lastSync: 'Synced from cloud' });
      } catch {
        setPersistenceStatus({ online: false, lastSync: 'Offline (local mode)' });
      }
    })();
  }, []);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('AIRARISE_GEMINI_API_KEY', key);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('AIRARISE_ROLE', newRole);
    }
  };

  const setOfficerName = (name: string) => {
    setOfficerNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('AIRARISE_OFFICER_NAME', name);
    }
  };

  const setOrganization = (org: string) => {
    setOrganizationState(org);
    if (typeof window !== 'undefined') {
      localStorage.setItem('AIRARISE_ORGANIZATION', org);
    }
  };

  const addTelemetryRows = (rows: TelemetryRow[]) => {
    const merged = [...rows, ...telemetryData];
    setTelemetryData(merged);

    // Persist the full current dataset so it survives a refresh.
    (async () => {
      try {
        const res = await fetchWithTimeout(`${API_URL}/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionKey: SESSION_KEY, mode: 'replace', rows: merged }),
        });
        const json = await res.json();
        setPersistenceStatus((prev) => ({
          online: json?.data?.persisted === true ? true : prev.online,
          lastSync: json?.data?.persisted ? 'Saved to cloud' : 'Saved locally',
        }));
      } catch {
        setPersistenceStatus({ online: false, lastSync: 'Offline (local mode)' });
      }
    })();

    // Automatically trigger reactive AI synthesis on freshly ingested telemetry.
    setTimeout(() => {
      analyzeTelemetryWithGemini(merged, hotspots, role, geminiApiKey)
        .then((res) => setAiAnalysisOutput(res))
        .catch(() => {});
    }, 50);
  };

  const dispatchIntervention = (id: string) => {
    setInterventions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'In Progress' } : item
      )
    );
  };

  const createIntervention = (item: Omit<Intervention, 'id'>) => {
    const newInt: Intervention = {
      ...item,
      id: `int-${Date.now()}`
    };
    setInterventions(prev => [newInt, ...prev]);
  };

  const refreshFeeds = () => {
    setLastSyncTime('Just now');
  };

  const triggerAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const result = await analyzeTelemetryWithGemini(
        telemetryData,
        hotspots,
        role,
        geminiApiKey
      );
      setAiAnalysisOutput(result);

      // If new role-based interventions are returned, merge them
      if (result.roleRecommendations && result.roleRecommendations.length > 0) {
        const newItems: Intervention[] = result.roleRecommendations.map((rec, i) => ({
          id: `ai-rec-${Date.now()}-${i}`,
          title: rec.title,
          priority: rec.priority,
          deadline: 'Immediate action window',
          geminiConfidence: 95.0,
          description: rec.description,
          targetLocation: rec.targetLocation,
          responsibleGroup: `${rec.intendedRole.replace('_', ' ').toUpperCase()} Unit`,
          evidenceCitation: rec.evidenceCitation,
          status: 'Pending Dispatch',
          intendedRole: rec.intendedRole,
          actionType: rec.actionType
        }));
        setInterventions(prev => [...newItems, ...prev]);
      }
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Persists the full settings profile to the backend (MongoDB). Overrides are
  // applied to context first (optimistic), then written through. Always resolves
  // (graceful fallback) so the UI never blocks on a save.
  const saveSettingsProfile = async (overrides?: Partial<SettingsProfile>) => {
    const profile: SettingsProfile = {
      role: overrides?.role ?? role,
      language: overrides?.language ?? language,
      activeRegion: overrides?.activeRegion ?? activeRegion,
      officerName: overrides?.officerName ?? officerName,
      organization: overrides?.organization ?? organization,
      geminiApiKey: overrides?.geminiApiKey ?? geminiApiKey,
    };

    // Apply overrides to context immediately (optimistic local update).
    if (overrides?.role) setRole(overrides.role);
    if (overrides?.language) setLanguage(overrides.language);
    if (overrides?.activeRegion) setActiveRegion(overrides.activeRegion);
    if (overrides?.officerName !== undefined) setOfficerName(overrides.officerName);
    if (overrides?.organization !== undefined) setOrganization(overrides.organization);
    if (overrides?.geminiApiKey !== undefined) setGeminiApiKey(overrides.geminiApiKey);

    try {
      const res = await fetchWithTimeout(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey: SESSION_KEY, ...profile }),
      });
      const json = await res.json();
      const persisted = json?.data?.persisted === true;
      setPersistenceStatus((prev) => ({
        online: persisted || prev.online,
        lastSync: persisted ? 'Saved to cloud' : 'Saved locally',
      }));
      return { persisted, message: persisted ? undefined : json?.data?.message };
    } catch {
      setPersistenceStatus({ online: false, lastSync: 'Saved locally (offline)' });
      return { persisted: false, message: 'Backend unreachable; settings saved locally only.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        activeRegion,
        setActiveRegion,
        officerName,
        setOfficerName,
        organization,
        setOrganization,
        telemetryData,
        addTelemetryRows,
        hotspots,
        interventions,
        dispatchIntervention,
        createIntervention,
        lastSyncTime,
        refreshFeeds,
        isAiAnalyzing,
        triggerAiAnalysis,
        aiAnalysisOutput,
        geminiApiKey,
        setGeminiApiKey,
        saveSettingsProfile,
        persistenceStatus,
        isMobileMenuOpen,
        setIsMobileMenuOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
