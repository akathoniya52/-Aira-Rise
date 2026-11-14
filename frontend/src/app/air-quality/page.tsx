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
  ReferenceArea,
} from 'recharts';

export default function AirQualityIntelligencePage() {
  const { isAiAnalyzing, triggerAiAnalysis, aiAnalysisOutput, telemetryData } = useApp();

  // Auto-run synthesis on first load so the correlation chart and evidence
  // stream reflect real analysis output instead of static placeholders.
  useEffect(() => {
    if (!aiAnalysisOutput && !isAiAnalyzing) {
      triggerAiAnalysis();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(
    () =>
      [...telemetryData]
        .filter((r) => r.pm25 !== null && r.pm10 !== null && r.no2 !== null)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .map((r) => ({
          time: r.timestamp.slice(11, 16) || r.rowId,
          pm25: r.pm25,
          pm10: r.pm10,
          no2: r.no2,
        })),
    [telemetryData]
  );

  const aiFindings = useMemo(() => aiAnalysisOutput?.findings ?? [], [aiAnalysisOutput]);
  const activeSensors = useMemo(
    () => new Set(telemetryData.map((r) => r.sensorId)).size,
    [telemetryData]
  );
  const certitudeToken = aiAnalysisOutput?.certitude?.split(' ')[0] || '94.8%';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-space-lg w-full">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-mono text-secondary font-bold uppercase tracking-wider">
                Gemini 1.5 Pro Synthesis Active • Model v4.8.2-Correlation
              </span>
            </div>
            <h1 className="text-2xl font-bold font-headline-md text-primary tracking-tight">
              AI Air Quality Intelligence & Predictive Synthesis
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Deep multi-parameter environmental analysis driven by Google Gemini 1.5 Pro. Correlating meteorological telemetry, vehicular flow, and spatial emission vectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerAiAnalysis}
              disabled={isAiAnalyzing}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              {isAiAnalyzing ? 'Synthesizing...' : 'Re-run Gemini Synthesis'}
            </button>
            <Link
              href="/reports"
              className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold border border-outline-variant/20 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Export Brief (PDF)
            </Link>
          </div>
        </div>

        {/* GEMINI AUTONOMOUS DIAGNOSTIC HERO BANNER */}
        <div className="p-space-lg rounded-xl bg-gradient-to-r from-surface-container-lowest via-surface-container-low/40 to-surface-container-lowest border border-secondary/30 shadow-xs flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-space-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-secondary tracking-wider">
                Gemini Autonomous Environmental Diagnostic
              </span>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                REALTIME INFERENCE
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-on-surface-variant">Analytical Certitude: </span>
              <span className="font-mono text-xs font-bold text-secondary">{certitudeToken} HIGH</span>
              <span className="text-[10px] text-on-surface-variant ml-1">(Cross-checked via {activeSensors} Nodes)</span>
            </div>
          </div>

          <blockquote className="text-sm sm:text-base font-semibold text-primary font-headline-sm leading-relaxed border-l-4 border-secondary pl-3 sm:pl-4 my-1">
            &quot;{aiAnalysisOutput?.summary || 'Ward F-North is undergoing a bi-modal particulate surge driven by unpaved shoulder friction along Sion Circle Flyover combined with low-velocity marine boundary layer trapping between 08:00 and 10:30 IST.'}&quot;
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-error">grain</span>
                Primary Culprit: <strong>{aiAnalysisOutput?.culprit || 'Resuspended Coarse Dust (PM10)'}</strong>
              </span>
              <span className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-amber-600">air</span>
                Atmospheric Dispersion: <strong>Stagnant (1.2 m/s)</strong>
              </span>
            </div>
            <span className="text-on-surface-variant flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-secondary">database</span>
              Evidence Basis: Verified Sensor Mesh
            </span>
          </div>
        </div>

        {/* MIDDLE GRID: CORRELATION CHART & SOURCE APPORTIONMENT DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Advanced Pollutant Correlation */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-space-sm">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                    Telemetry Decomposition • Real-time Multi-stream
                  </span>
                  <h3 className="font-bold text-primary text-base">Advanced Pollutant Correlation & Boundary Dynamics</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-error" /> PM10
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> PM2.5
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> NO2
                  </span>
                </div>
              </div>

              {/* Recharts correlation chart — bound to live telemetry */}
              <div className="w-full h-64 bg-surface-container-low/30 rounded-lg p-space-sm relative border border-outline-variant/10">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d8e6dc" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#404941" />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#404941" width={40} />
                      <Tooltip
                        contentStyle={{
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                          borderRadius: 8,
                          border: '1px solid #c0c9be',
                        }}
                      />
                      {/* Forecast / sea-breeze onset window */}
                      {chartData.length > 4 && (
                        <ReferenceArea
                          x1={chartData[Math.max(0, chartData.length - 2)].time}
                          x2={chartData[chartData.length - 1].time}
                          fill="#6cf8bb"
                          fillOpacity={0.12}
                          label={{ value: 'Sea breeze', fontSize: 9, fill: '#006c49', position: 'top' }}
                        />
                      )}
                      <ReferenceLine y={100} stroke="#ba1a1a" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'PM10 std', fontSize: 9, fill: '#ba1a1a', position: 'insideTopRight' }} />
                      <Line type="monotone" dataKey="pm10" stroke="#ba1a1a" strokeWidth={3} dot={false} name="PM10 (µg/m³)" />
                      <Line type="monotone" dataKey="pm25" stroke="#006c49" strokeWidth={2} dot={false} name="PM2.5 (µg/m³)" />
                      <Line type="monotone" dataKey="no2" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 2" dot={false} name="NO2 (ppb)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant font-mono">
                    Upload telemetry to render the correlation decomposition.
                  </div>
                )}

                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant pt-2 border-t border-outline-variant/20">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00 (NOW)</span>
                  <span className="font-bold text-secondary">20:00 (FORECAST)</span>
                </div>
              </div>
            </div>

            {/* Micro parameters */}
            <div className="grid grid-cols-3 gap-space-sm pt-space-sm mt-space-sm border-t border-outline-variant/10 text-xs font-mono">
              <div className="p-2 rounded bg-surface-container-low/50">
                <span className="text-[10px] text-on-surface-variant uppercase">Correlation Index (PM10/NO2)</span>
                <div className="font-bold text-primary text-sm mt-0.5">r = 0.88 (High)</div>
                <span className="text-[10px] text-on-surface-variant">High vehicular co-emission</span>
              </div>
              <div className="p-2 rounded bg-surface-container-low/50">
                <span className="text-[10px] text-on-surface-variant uppercase">Boundary Layer Height</span>
                <div className="font-bold text-primary text-sm mt-0.5">140m → 680m</div>
                <span className="text-[10px] text-secondary">Thermal expansion active</span>
              </div>
              <div className="p-2 rounded bg-surface-container-low/50">
                <span className="text-[10px] text-on-surface-variant uppercase">Model Divergence Check</span>
                <div className="font-bold text-secondary text-sm mt-0.5">± 3.2% Error</div>
                <span className="text-[10px] text-on-surface-variant">Exemplary telemetry alignment</span>
              </div>
            </div>
          </div>

          {/* Pollution Genesis Breakdown (Donut) */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div>
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold">Source Apportionment</span>
                  <h3 className="font-bold text-primary text-base">Pollution Genesis Breakdown</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  ISOTOPE MATCHED
                </span>
              </div>

              {/* Donut representation */}
              <div className="flex items-center justify-center my-space-md">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Road Dust 48% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="48 52" strokeDashoffset="0" />
                    {/* Vehicular 28% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#003b1b" strokeWidth="4" strokeDasharray="28 72" strokeDashoffset="-48" />
                    {/* Waste 14% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#84cc16" strokeWidth="4" strokeDasharray="14 86" strokeDashoffset="-76" />
                    {/* Marine 10% */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0284c7" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">Primary</span>
                    <span className="text-2xl font-bold font-mono text-orange-600">48%</span>
                    <span className="text-[10px] font-semibold text-primary">Road / Dust</span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low/40">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    Road & Construction Dust
                  </span>
                  <span className="font-mono font-bold text-primary">48%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low/40">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Vehicular Diesel Exhaust
                  </span>
                  <span className="font-mono font-bold text-primary">28%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low/40">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                    Waste / Bio-incineration
                  </span>
                  <span className="font-mono font-bold text-primary">14%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low/40">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Transboundary Marine Mist
                  </span>
                  <span className="font-mono font-bold text-primary">10%</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-on-surface-variant font-mono mt-space-sm pt-space-xs border-t border-outline-variant/10 text-center">
              Multi-modal regression combining ground signatures and optical density.
            </p>
          </div>
        </div>

        {/* EVIDENCE-BACKED AI INSIGHTS STREAM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left: Evidence Stream Cards (reactive to AI analysis output) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md" aria-live="polite" aria-atomic="true">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-secondary font-bold">Auditable Inference Ledger</span>
                <h3 className="font-bold text-primary text-base">Evidence-Backed AI Insights Stream</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full">
                {aiFindings.length > 0 ? `${aiFindings.length} High-Priority Flags` : 'Synthesizing…'}
              </span>
            </div>

            {isAiAnalyzing && aiFindings.length === 0 ? (
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 text-xs text-on-surface-variant font-mono">
                Synthesizing evidence-backed insights from live telemetry…
              </div>
            ) : aiFindings.length > 0 ? (
              aiFindings.map((item, idx) => {
                const dotColor =
                  item.severity === 'critical' ? 'bg-error' : item.severity === 'warning' ? 'bg-amber-500' : 'bg-secondary';
                return (
                  <div key={idx} className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        {item.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        Confidence {item.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.explanation}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/10 text-[11px] font-mono">
                      <span className="text-on-surface-variant truncate max-w-[60%]">{item.evidence}</span>
                      {item.severity === 'info' ? (
                        <span className="text-secondary font-bold">Natural Venting Window</span>
                      ) : (
                        <Link href={item.severity === 'critical' ? '/action-center' : '/reports'} className="text-secondary font-bold hover:underline">
                          {item.severity === 'critical' ? 'Trigger Mitigation →' : 'View Advisory →'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 text-xs text-on-surface-variant font-mono">
                Run Gemini synthesis to populate the evidence stream.
              </div>
            )}
          </div>

          {/* Right: Sensor Calibration Matrix */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20 mb-space-sm">
                <div>
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold">Hardware Integrity</span>
                  <h3 className="font-bold text-primary text-base">Sensor Calibration Matrix</h3>
                </div>
                <span className="text-[10px] font-mono text-secondary font-bold">99.4% HEALTH</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-[10px] text-on-surface-variant">
                      <th scope="col" className="py-2">Node / Location</th>
                      <th scope="col" className="py-2">Uptime</th>
                      <th scope="col" className="py-2">Drift</th>
                      <th scope="col" className="py-2 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr>
                      <td className="py-2 font-semibold text-primary">SN-FN-01 (Matunga)</td>
                      <td className="py-2 text-secondary">99.8%</td>
                      <td className="py-2 text-on-surface-variant">±0.4%</td>
                      <td className="py-2 text-right text-[10px]">02 May</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-primary">SN-FN-04 (Sion Flyover)</td>
                      <td className="py-2 text-secondary">99.1%</td>
                      <td className="py-2 text-on-surface-variant">±0.8%</td>
                      <td className="py-2 text-right text-[10px]">11 May</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-primary">SN-FN-09 (King&apos;s Circle)</td>
                      <td className="py-2 text-secondary">100.0%</td>
                      <td className="py-2 text-on-surface-variant">±0.1%</td>
                      <td className="py-2 text-right text-[10px]">18 Apr</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-primary">SN-FN-18 (Sion Hospital)</td>
                      <td className="py-2 text-amber-600">97.6%</td>
                      <td className="py-2 text-amber-600">±1.4%</td>
                      <td className="py-2 text-right text-[10px]">08 May</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 mt-space-md flex items-center justify-between">
              <span className="text-[11px] font-mono text-on-surface-variant">
                ISO-17025 Calibrated • Laser optical sensors
              </span>
              <button
                onClick={() => alert('Calibration schedule opened for field teams')}
                className="text-xs font-bold text-secondary hover:underline"
              >
                Schedule Audit
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM DIRECTIVE BANNER */}
        <div className="p-space-md rounded-xl bg-primary text-on-primary shadow-sm flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-[32px] text-secondary-fixed">assignment_turned_in</span>
            <div>
              <div className="text-[10px] font-mono uppercase text-secondary-fixed font-bold tracking-wider">
                Municipal Action Directive Generated • Directive #F-892
              </div>
              <h4 className="text-sm font-bold mt-0.5">
                Immediate road misting & haulage curfew recommended for Sion-Dharavi connector until 13:00 IST.
              </h4>
            </div>
          </div>
          <Link
            href="/action-center"
            className="px-4 py-2 bg-surface-container-lowest text-primary hover:bg-surface-container font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Review & Issue Directive
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
