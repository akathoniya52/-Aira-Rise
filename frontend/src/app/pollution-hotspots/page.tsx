'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export default function PollutionHotspotsPage() {
  const { hotspots } = useApp();
  const [selectedLayer, setSelectedLayer] = useState<'heatmap' | 'nodes' | 'receptors'>('heatmap');
  const [activeNode, setActiveNode] = useState('SN-FN-04');
  const [isDroneScanning, setIsDroneScanning] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:gap-6 w-full">
        {/* HEADER */}
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] font-mono text-secondary font-bold uppercase tracking-wider">
                Live Ward GIS v4.12 • Ward F-North
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Spatial Pollution Hotspots & Ward Mesh
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live dispersion mapping with multi-tiered sensor telemetry, dynamic plume modeling, and acute hotspot triage.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setIsDroneScanning(true);
                setTimeout(() => {
                  setIsDroneScanning(false);
                  alert('Drone Telemetry Received: 4K Optical Density map compiled for Sion Flyover Underpass.');
                }, 1500);
              }}
              disabled={isDroneScanning}
              aria-label="Trigger autonomous drone particulate survey"
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">flight</span>
              {isDroneScanning ? 'Scanning...' : 'Trigger Drone Survey'}
            </button>
          </div>
        </div>

        {/* GIS INTERACTIVE CANVAS & NODE INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Map Viewer */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between gap-3">
            {/* Layer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/15 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Layers:</span>
                <button
                  onClick={() => setSelectedLayer('heatmap')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedLayer === 'heatmap' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  Heatmap
                </button>
                <button
                  onClick={() => setSelectedLayer('nodes')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedLayer === 'nodes' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  Mesh Nodes (38)
                </button>
                <button
                  onClick={() => setSelectedLayer('receptors')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedLayer === 'receptors' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  Schools & Hospitals
                </button>
              </div>

              <span className="text-[10px] text-error font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error" /> LIVE STREAM
              </span>
            </div>

            {/* Simulated GIS Canvas */}
            <div className="w-full h-72 sm:h-80 rounded-xl bg-surface/50 border border-outline-variant/20 relative overflow-hidden flex flex-col justify-between p-3 sm:p-4">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#003b1b_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 400" preserveAspectRatio="none">
                <path d="M 50,300 Q 200,100 400,220 T 750,150" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 100,350 Q 250,180 450,280 T 800,200" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx="280" cy="180" r="90" fill="#ba1a1a" fillOpacity="0.15" />
              </svg>

              {/* Wind Vector Banner */}
              <div className="relative z-10 self-start p-2 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/20 shadow-xs flex items-center gap-2 text-xs font-mono">
                <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
                <div>
                  <div className="font-bold text-primary">WSW 4.2 km/h</div>
                  <div className="text-[10px] text-on-surface-variant">Stagnant Inversion</div>
                </div>
              </div>

              {/* Hotspot Marker */}
              <div
                onClick={() => setActiveNode('SN-FN-04')}
                className="relative z-10 self-center cursor-pointer p-2 rounded-lg bg-error text-on-error shadow-lg flex items-center gap-1.5 border border-white animate-pulse"
              >
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span className="font-mono text-xs font-bold">Sion Flyover: 245 µg/m³ PM10</span>
              </div>

              {/* Receptor Safeguard Banner */}
              <div className="relative z-10 self-start mt-auto p-2 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/20 shadow-xs flex items-center justify-between w-full max-w-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-primary">Sion Hospital Quiet Zone</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  AQI 42 (Safe)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-outline-variant/10 text-xs font-mono text-on-surface-variant">
              <span>Coverage: 8.42 km² • Sentinel-5P Layer Synced</span>
              <span className="text-secondary font-bold">38 Sensors Operating</span>
            </div>
          </div>

          {/* Node Inspector Sidebar */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-secondary font-bold">Node Inspector</span>
                  <h3 className="font-bold text-primary text-base">Node {activeNode}</h3>
                </div>
                <span className="bg-error-container text-on-error-container font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Alert
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface/70 border border-outline-variant/20 flex flex-col gap-1 text-xs font-mono mb-3">
                <span className="text-on-surface-variant">Location: Sion Flyover South Span</span>
                <div className="text-error font-bold text-sm">PM10: 245.0 µg/m³ (+184% Spike)</div>
                <span className="text-[10px] text-on-surface-variant">Temp: 31.4°C • Humidity: 62%</span>
              </div>

              <div className="p-3 rounded-lg bg-surface/70 border border-outline-variant/20 text-xs">
                <span className="text-[10px] font-mono uppercase text-secondary font-bold">Downwind Projection</span>
                <p className="text-[11px] text-on-surface leading-snug mt-1">
                  Plume heading towards <strong className="text-primary font-bold">Sion Municipal Primary School</strong> within 35 minutes.
                </p>
                <div className="text-[10px] font-mono text-on-surface-variant mt-1.5">
                  Est. Impact: 1,420 students • 94.2% Conf.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary text-on-primary shadow-xs flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-secondary-fixed font-bold">Prescribed Countermeasure</span>
              <p className="text-[11px] leading-relaxed text-surface-container-lowest">
                Dispatch Mobile Anti-Smog Cannon Unit #4 to damp transit dust at Sion Flyover South Span.
              </p>
              <Link
                href="/action-center"
                className="py-1.5 px-3 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary rounded font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                Confirm Route & Dispatch
              </Link>
            </div>
          </div>
        </div>

        {/* WARD HOTSPOT SEVERITY LEDGER TABLE & MOBILE CARDS */}
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary text-base">Ward Hotspot Severity Ledger</h3>
            <span className="text-[10px] font-mono text-on-surface-variant">{hotspots.length} Acute Zones Identified</span>
          </div>

          {/* Mobile View: Clean Responsive Cards (Visible on screens < 768px) */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {hotspots.map((item) => (
              <div key={item.rank} className="p-3 rounded-lg bg-surface/70 border border-outline-variant/20 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[11px] ${
                      item.severity > 8 ? 'bg-error text-on-error' : item.severity > 5 ? 'bg-amber-500 text-on-error' : 'bg-emerald-600 text-on-error'
                    }`}>
                      #{item.rank}
                    </span>
                    <span className="font-bold text-xs text-primary">{item.location}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.status === 'Critical' ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-1.5 rounded bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-[9px] uppercase font-sans text-on-surface-variant block">Primary Pollutant</span>
                    <span className="font-bold text-error">{item.primaryPollutant}</span>
                  </div>
                  <div className="p-1.5 rounded bg-surface-container-lowest border border-outline-variant/10">
                    <span className="text-[9px] uppercase font-sans text-on-surface-variant block">Sensor Node</span>
                    <span className="font-bold text-primary">{item.sensorId}</span>
                  </div>
                </div>

                <p className="text-[11px] text-on-surface-variant leading-snug">
                  <strong className="text-on-surface">Cause:</strong> {item.rootCause}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-xs">
                  <span className="text-[10px] text-on-surface-variant font-medium">Risk: {item.populationAtRisk}</span>
                  <Link
                    href="/action-center"
                    className="px-3 py-1 rounded bg-primary text-on-primary hover:bg-primary-container text-xs font-bold inline-flex items-center shadow-xs"
                  >
                    Triage →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Full Responsive Table Container (Hidden on screens < 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-outline-variant/20 font-mono text-on-surface-variant uppercase text-[10px] bg-surface/50">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Pollutant</th>
                  <th className="py-2.5 px-3">Root Cause</th>
                  <th className="py-2.5 px-3">Population at Risk</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {hotspots.map((item) => (
                  <tr key={item.rank} className="hover:bg-surface/60">
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        item.severity > 8 ? 'bg-error text-on-error' : item.severity > 5 ? 'bg-amber-500 text-on-error' : 'bg-emerald-600 text-on-error'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-primary">
                      <div>{item.location}</div>
                      <div className="text-[10px] font-mono text-on-surface-variant">{item.sensorId}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-on-surface">{item.primaryPollutant}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant text-[11px] max-w-xs">{item.rootCause}</td>
                    <td className="py-2.5 px-3 text-on-surface font-medium">{item.populationAtRisk}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href="/action-center"
                        className="px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container text-xs font-bold inline-flex items-center shadow-xs"
                      >
                        Triage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
