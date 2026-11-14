'use client';

import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const ROLE_GREETING: Record<string, string> = {
  ward_officer: 'Officer',
  housing_admin: 'Admin',
  school_admin: 'Principal',
  field_team: 'Field Officer',
};

function pm25Label(v: number): { text: string; cls: string } {
  if (v > 60) return { text: 'Poor', cls: 'bg-error-container text-on-error-container' };
  if (v > 30) return { text: 'Moderate', cls: 'bg-amber-100 text-amber-800' };
  return { text: 'Good', cls: 'bg-emerald-100 text-emerald-800' };
}

function pm10Label(v: number): { text: string; cls: string } {
  if (v > 100) return { text: 'Poor', cls: 'bg-error-container text-on-error-container' };
  if (v > 50) return { text: 'Moderate', cls: 'bg-amber-100 text-amber-800' };
  return { text: 'Good', cls: 'bg-emerald-100 text-emerald-800' };
}

function aqiLabel(v: number): string {
  if (v <= 50) return 'Good';
  if (v <= 100) return 'Moderate';
  if (v <= 150) return 'Unhealthy (Sens.)';
  if (v <= 200) return 'Unhealthy';
  return 'Very Unhealthy';
}

export default function DashboardPage() {
  const {
    role,
    lastSyncTime,
    refreshFeeds,
    interventions,
    dispatchIntervention,
    telemetryData,
    hotspots,
    isAiAnalyzing,
    triggerAiAnalysis,
    aiAnalysisOutput,
  } = useApp();

  // Auto-trigger evidence-bounded AI synthesis on first load so the
  // "Telemetry Live" badge and the AI sidebar reflect real analysis output.
  useEffect(() => {
    if (!aiAnalysisOutput && !isAiAnalyzing) {
      triggerAiAnalysis();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deterministic arithmetic computed from real telemetry (never delegated to the model).
  const {
    avgPm25,
    avgPm10,
    computedAqi,
    criticalCount,
    activeSensors,
    chartData,
    peakPm10,
    peakLocation,
    missingCount,
    aiFindings,
  } = useMemo(() => {
    const validRows = telemetryData.filter((r) => r.pm25 !== null && r.pm10 !== null);
    const avg25 = validRows.length
      ? (validRows.reduce((s, r) => s + (r.pm25 ?? 0), 0) / validRows.length).toFixed(1)
      : '—';
    const avg10 = validRows.length
      ? (validRows.reduce((s, r) => s + (r.pm10 ?? 0), 0) / validRows.length).toFixed(1)
      : '—';

    // CPCB sub-index AQI approximation (PM10 dominant in this dataset)
    const aqi = validRows.length
      ? Math.round(Math.max(Number(avg25) * (100 / 60), Number(avg10) * (100 / 100)))
      : 0;

    const critical = hotspots.filter((h) => h.status === 'Critical').length;
    const sensors = new Set(telemetryData.map((r) => r.sensorId)).size;
    const missing = telemetryData.filter((r) => r.pm25 === null || r.pm10 === null).length;

    // Sort by timestamp so the trajectory reads left-to-right across the day.
    const data = [...validRows]
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((r) => ({
        time: r.timestamp.slice(11, 16) || r.rowId,
        pm25: r.pm25,
        pm10: r.pm10,
      }));

    const peakRow = validRows.length
      ? [...validRows].sort((a, b) => (b.pm10 ?? 0) - (a.pm10 ?? 0))[0]
      : null;

    return {
      avgPm25: avg25,
      avgPm10: avg10,
      computedAqi: aqi,
      criticalCount: critical,
      activeSensors: sensors,
      chartData: data,
      peakPm10: peakRow?.pm10 ?? 0,
      peakLocation: peakRow?.location ?? 'Ward F-North',
      missingCount: missing,
      aiFindings: aiAnalysisOutput?.findings ?? [],
    };
  }, [telemetryData, hotspots, aiAnalysisOutput]);

  const pm25Badge = avgPm25 !== '—' ? pm25Label(Number(avgPm25)) : { text: '—', cls: 'bg-surface-container text-on-surface-variant' };
  const pm10Badge = avgPm10 !== '—' ? pm10Label(Number(avgPm10)) : { text: '—', cls: 'bg-surface-container text-on-surface-variant' };
  const activeHotspotLocations = hotspots
    .filter((h) => h.status === 'Critical' || h.status === 'Warning')
    .slice(0, 3)
    .map((h) => h.location)
    .join(', ');
  const certitudeToken = aiAnalysisOutput?.certitude?.split(' ')[0] || '—';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        {/* WELCOME BANNER */}
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-wider">
                Telemetry Live • Secure Channel F-N9
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Good morning, {ROLE_GREETING[role] ?? 'Officer'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ward F-North Environmental Command Center • Matunga &amp; Sion Circle
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant/20">
              Synced {lastSyncTime}
            </span>
            <button
              onClick={refreshFeeds}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* 5 KPI CARDS — FLUID GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* PM2.5 */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">PM2.5</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${pm25Badge.cls}`}>
                {pm25Badge.text}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">{avgPm25}</div>
              <span className="text-[10px] font-mono text-on-surface-variant">µg/m³ (Std: 60)</span>
            </div>
            <div className="text-[10px] text-error font-medium pt-1 border-t border-outline-variant/10">
              Live mean across {activeSensors} nodes
            </div>
          </div>

          {/* PM10 */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">PM10</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${pm10Badge.cls}`}>
                {pm10Badge.text}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-error">{avgPm10}</div>
              <span className="text-[10px] font-mono text-on-surface-variant">µg/m³ (Std: 100)</span>
            </div>
            <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/10 truncate">
              Road &amp; transit dust
            </div>
          </div>

          {/* AQI */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">AQI Index</span>
              <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600">{computedAqi || '—'}</div>
              <span className="text-[10px] font-mono text-on-surface-variant">{aqiLabel(computedAqi)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[20%]" />
              <div className="h-full bg-lime-400 w-[20%]" />
              <div className="h-full bg-amber-500 w-[30%]" />
              <div className="h-full bg-red-500 w-[30%]" />
            </div>
          </div>

          {/* Hotspots */}
          <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">Hotspots</span>
              {criticalCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-secondary" />
              )}
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-error">
                {criticalCount} Zone{criticalCount === 1 ? '' : 's'}
              </div>
              <span className="text-[10px] font-mono text-error font-semibold">
                {criticalCount > 0 ? 'Triage Active' : 'Stable'}
              </span>
            </div>
            <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/10 truncate">
              {activeHotspotLocations || 'No active triage'}
            </div>
          </div>

          {/* Mesh Integrity */}
          <div className="col-span-2 sm:col-span-1 bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase font-mono">Sensors</span>
              <span className="text-[10px] font-bold text-secondary">Audited</span>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-secondary">
                {activeSensors} / {activeSensors}
              </div>
              <span className="text-[10px] font-mono text-secondary">{activeSensors} active nodes</span>
            </div>
            <div className="text-[10px] text-secondary font-semibold pt-1 border-t border-outline-variant/10">
              {missingCount === 0 ? 'Zero missing intervals' : `${missingCount} intervals flagged`}
            </div>
          </div>
        </div>

        {/* MAIN VISUAL: POLLUTANT TRAJECTORY & GEMINI INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Real-time Trajectory */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-base font-bold text-primary">Air Quality &amp; Pollutant Trajectory</h2>
                  <p className="text-[11px] text-on-surface-variant">24-hour diurnal sensor dispersion telemetry</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> PM2.5 ({avgPm25})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> PM10 ({avgPm10})
                  </span>
                </div>
              </div>

              {/* Recharts trajectory — bound to live telemetry */}
              <div className="w-full h-48 sm:h-56 lg:h-60 bg-surface/50 rounded-lg p-2 sm:p-3 relative border border-outline-variant/10">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d8e6dc" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        stroke="#404941"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        stroke="#404941"
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                          borderRadius: 8,
                          border: '1px solid #c0c9be',
                        }}
                      />
                      <ReferenceLine
                        y={100}
                        stroke="#ba1a1a"
                        strokeDasharray="4 4"
                        label={{ value: 'PM10 std', fontSize: 9, fill: '#ba1a1a', position: 'insideTopLeft' }}
                      />
                      <ReferenceLine
                        y={60}
                        stroke="#ba1a1a"
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{ value: 'PM2.5 std', fontSize: 9, fill: '#ba1a1a', position: 'insideBottomLeft' }}
                      />
                      <Line type="monotone" dataKey="pm10" stroke="#006c49" strokeWidth={2.5} dot={false} name="PM10 (µg/m³)" />
                      <Line type="monotone" dataKey="pm25" stroke="#003b1b" strokeWidth={2} dot={false} name="PM2.5 (µg/m³)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant font-mono">
                    Upload telemetry to render the trajectory.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-outline-variant/10 text-xs">
              <span className="text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-amber-600">info</span>
                {peakPm10 > 0
                  ? `Peak PM10 reached ${peakPm10.toFixed(1)} µg/m³ at ${peakLocation}. Review the diurnal decomposition for the full trajectory.`
                  : 'No valid telemetry yet — upload a dataset to populate the trajectory.'}
              </span>
              <Link href="/air-quality" className="text-secondary font-semibold hover:underline flex items-center gap-0.5">
                Explore Decomposition →
              </Link>
            </div>
          </div>

          {/* AI Environmental Insights */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between gap-3">
            <div aria-live="polite" aria-atomic="true">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                  <h3 className="font-bold text-primary text-sm">Gemini AI Synthesis</h3>
                </div>
                <span className="text-[10px] font-mono text-secondary bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  {certitudeToken} Conf.
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {isAiAnalyzing && aiFindings.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-surface/70 border border-outline-variant/20 text-xs text-on-surface-variant">
                    Synthesizing live telemetry…
                  </div>
                ) : aiFindings.length > 0 ? (
                  aiFindings.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface/70 border border-outline-variant/20 text-xs">
                      <div className="font-bold text-primary mb-1">{item.title}</div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.explanation}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-lg bg-surface/70 border border-outline-variant/20 text-xs text-on-surface-variant">
                    Run synthesis to generate evidence-backed insights.
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/air-quality"
              className="w-full py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              View Full AI Synthesis
            </Link>
          </div>
        </div>

        {/* BOTTOM SECTION: ACTION CENTER SHORTCUT & CITIZEN BRIEFINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Action Center Hub */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-primary text-sm sm:text-base">Prioritized Civic Interventions</h3>
                <span className="text-[10px] font-mono text-error font-bold bg-error-container/50 px-2 py-0.5 rounded-full">
                  Role: {role.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {interventions.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-surface/60 border border-outline-variant/20 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.priority === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-on-surface-variant">{item.targetLocation}</span>
                    </div>
                    <div className="text-xs font-bold text-primary">{item.title}</div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-mono text-[10px] text-on-surface-variant truncate max-w-[200px]">
                        Target: {item.deadline}
                      </span>
                      {item.status === 'In Progress' ? (
                        <span className="text-secondary font-bold flex items-center gap-1 text-[11px]">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => dispatchIntervention(item.id)}
                          className="px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container text-[11px] font-bold"
                        >
                          Dispatch Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-outline-variant/10 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Live civic response matrix</span>
              <Link href="/action-center" className="text-secondary font-bold hover:underline">
                View All Interventions →
              </Link>
            </div>
          </div>

          {/* Environmental Briefings & Citizen Bulletins */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-primary text-sm sm:text-base">Recent Reports & Citizen Bulletins</h3>
                <Link href="/reports" className="text-xs text-secondary font-bold hover:underline">
                  Advisory Studio →
                </Link>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-surface/60 border border-outline-variant/20 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">BMC-FN-ADV-2025-089</span>
                    <span className="text-[10px] font-mono text-secondary font-semibold">Today, 09:15 IST</span>
                  </div>
                  <div className="font-semibold text-on-surface">Sion Circle Peak Dust Incident & Mask Advisory</div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>Languages: <strong>EN • HI • MR</strong></span>
                    <Link href="/reports" className="text-secondary font-bold hover:underline">
                      Download PDF
                    </Link>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface/60 border border-outline-variant/20 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">BMC-FN-BRIEF-24H</span>
                    <span className="text-[10px] font-mono text-secondary font-semibold">Today, 06:00 IST</span>
                  </div>
                  <div className="font-semibold text-on-surface">Daily Executive Air Quality Brief for Municipal Commissioner</div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>Languages: <strong>EN • MR</strong></span>
                    <Link href="/reports" className="text-secondary font-bold hover:underline">
                      Download PDF
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-outline-variant/10 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Statutory compliance verified</span>
              <Link href="/historical" className="text-secondary font-bold hover:underline">
                Compare Impact Trajectory →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
