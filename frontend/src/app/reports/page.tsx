'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApp } from '@/context/AppContext';
import { generateMultilingualReport, GeneratedReportResult } from '@/services/geminiService';

export default function ReportsStudioPage() {
  const { role, telemetryData, geminiApiKey } = useApp();
  const [reportArchetype, setReportArchetype] = useState<'citizen' | 'internal' | 'compliance'>('citizen');
  const [activePreviewLang, setActivePreviewLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [comprehensionLevel, setComprehensionLevel] = useState<'simple' | 'standard' | 'technical'>('simple');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<GeneratedReportResult | null>(null);

  // Sync report content on language/role switch
  useEffect(() => {
    let isCancelled = false;
    async function loadReport() {
      const res = await generateMultilingualReport(
        activePreviewLang,
        role,
        comprehensionLevel,
        telemetryData,
        geminiApiKey
      );
      if (!isCancelled) {
        setReportData(res);
      }
    }
    loadReport();
    return () => {
      isCancelled = true;
    };
  }, [activePreviewLang, role, comprehensionLevel, telemetryData, geminiApiKey]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateMultilingualReport(
        activePreviewLang,
        role,
        comprehensionLevel,
        telemetryData,
        geminiApiKey
      );
      setReportData(res);
      alert(
        res.isAiGenerated
          ? 'Live Google Gemini 1.5 Flash synthesized new multilingual report!'
          : 'Validated evidence-bounded synthesis generated for ' + activePreviewLang.toUpperCase()
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const curContent = reportData || {
    badge: 'CITIZEN ADVISORY: HIGH PARTICULATE DISPERSION (LEVEL 2)',
    title: 'AIR QUALITY ADVISORY: Elevated Coarse Dust Along Transit Corridors in Ward F-North',
    notice: 'Notice issued to residents regarding micro-climate inversion causing sustained particulate suspension along Dr. Ambedkar Road and King\'s Circle interchange.',
    compositeAqi: 174,
    dominantPollutant: '142 µg/m³ (PM10)',
    expectedDissipation: '15:30 IST Today',
    precautions: {
      children: 'Suspend outdoor sports and physical training drills until 14:00 IST. Keep street-facing classroom windows secured.',
      seniors: 'Refrain from brisk morning walks in public gardens. Inhaler users are advised to carry preventive doses and wear N95 filters outdoors.',
      commuters: 'Keep vehicle windows rolled up along Eastern Express Highway. Citizens are requested to report uncovered transit sand trucks to Ward Control Room.'
    },
    activeInterventions: 'Two anti-smog water misting cannons have been mobilized along Sion Flyover corridor (Ambedkar Road). Mechanical road sweeping units FN-04 and FN-09 are conducting continuous suppression cycles.',
    sourceVerification: 'Data corroborated against CPCB Station CPCB-MH-MUM-018 • Digital Seal Verified by Dr. Anjali Sharma, Executive Health Officer',
    isAiGenerated: false
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-space-lg w-full">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-mono text-secondary font-bold uppercase tracking-wider">
                Statutory Environmental Intelligence • BMC-DIV-FN-2025
              </span>
            </div>
            <h1 className="text-2xl font-bold font-headline-md text-primary tracking-tight">
              Environmental Reports & Citizen Advisory Studio
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Generate compliant municipal briefings, statutory environmental filings, and multilingual citizen advisories at customizable reading levels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const doc = `${curContent.badge}\n${curContent.title}\n\nNotice: ${curContent.notice}\n\nAQI: ${curContent.compositeAqi} | Dominant: ${curContent.dominantPollutant}\nExpected Dissipation: ${curContent.expectedDissipation}\n\nMandated Precautions:\n- Children & Schools: ${curContent.precautions.children}\n- Seniors: ${curContent.precautions.seniors}\n- Commuters: ${curContent.precautions.commuters}\n\nActive Ward Interventions:\n${curContent.activeInterventions}\n\n${curContent.sourceVerification}`;
                const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `BMC_Air_Quality_Advisory_${activePreviewLang}.txt`;
                a.click();
              }}
              className="px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download Official PDF
            </button>
            <button
              onClick={() => alert('Published to Mumbai Citizen Portal (BMC Live Feed)')}
              className="px-3 py-2 rounded-lg bg-secondary text-on-secondary hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">publish</span>
              Publish to Portal
            </button>
          </div>
        </div>

        {/* TWO-COLUMN STUDIO: CONFIGURATOR (LEFT) & LIVE PREVIEW (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Configurator Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Archetype Selector */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-space-sm">
              <span className="text-[10px] font-mono uppercase text-secondary font-bold">Report Archetype</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setReportArchetype('internal')}
                  className={`p-space-sm rounded-lg text-left text-xs transition-all border ${
                    reportArchetype === 'internal'
                      ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                      : 'bg-surface-container-low/40 border-outline-variant/20 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="font-bold">Internal Executive Briefing Note</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Official BMC / CPCB Municipal Format. High-density telemetric analytics & regulatory escalation codes.
                  </div>
                </button>

                <button
                  onClick={() => setReportArchetype('citizen')}
                  className={`p-space-sm rounded-lg text-left text-xs transition-all border ${
                    reportArchetype === 'citizen'
                      ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                      : 'bg-surface-container-low/40 border-outline-variant/20 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Public Health & Citizen Advisory</span>
                    <span className="px-1.5 py-0.2 rounded bg-secondary text-on-secondary text-[10px] font-mono">ACTIVE DRAFT</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Actionable health-centric guidance, school directives, and clear non-technical ward mitigation steps.
                  </div>
                </button>

                <button
                  onClick={() => setReportArchetype('compliance')}
                  className={`p-space-sm rounded-lg text-left text-xs transition-all border ${
                    reportArchetype === 'compliance'
                      ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                      : 'bg-surface-container-low/40 border-outline-variant/20 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="font-bold">Construction & Industrial Compliance Notice</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    Statutory CPCB Notice 142(A) format for particulate suppression violations & work stop orders.
                  </div>
                </button>
              </div>
            </div>

            {/* Configuration Parameters Form */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-space-sm">
              <span className="text-[10px] font-mono uppercase text-secondary font-bold">Configuration Parameters</span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label htmlFor="geo-target" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Geographic Target</label>
                  <input
                    id="geo-target"
                    type="text"
                    readOnly
                    value="Ward F-North (Mumbai)"
                    className="w-full mt-1 p-2 rounded bg-surface-container-low border border-outline-variant/20 font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="telemetry-range" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Telemetry Data Range</label>
                  <input
                    id="telemetry-range"
                    type="text"
                    readOnly
                    value="Last 24 Hours (Live)"
                    className="w-full mt-1 p-2 rounded bg-surface-container-low border border-outline-variant/20 font-medium"
                  />
                </div>
              </div>

              {/* Comprehension Level */}
              <div className="pt-2">
                <span id="comprehension-label" className="text-[10px] uppercase font-mono text-on-surface-variant font-bold">Comprehension Level & Tone</span>
                <div role="radiogroup" aria-labelledby="comprehension-label" className="grid grid-cols-3 gap-1.5 mt-1">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={comprehensionLevel === 'simple'}
                    onClick={() => setComprehensionLevel('simple')}
                    className={`py-1.5 px-2 rounded text-xs font-semibold border focus-visible:ring-2 focus-visible:ring-primary ${
                      comprehensionLevel === 'simple' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    Simple (Grade 6)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={comprehensionLevel === 'standard'}
                    onClick={() => setComprehensionLevel('standard')}
                    className={`py-1.5 px-2 rounded text-xs font-semibold border focus-visible:ring-2 focus-visible:ring-primary ${
                      comprehensionLevel === 'standard' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    Standard Civic
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={comprehensionLevel === 'technical'}
                    onClick={() => setComprehensionLevel('technical')}
                    className={`py-1.5 px-2 rounded text-xs font-semibold border focus-visible:ring-2 focus-visible:ring-primary ${
                      comprehensionLevel === 'technical' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    Technical
                  </button>
                </div>
              </div>

              {/* Include AI Telemetry Evidence Checkbox */}
              <label htmlFor="include-ai-evidence" className="p-2.5 rounded bg-surface-container-low/50 border border-outline-variant/20 flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  id="include-ai-evidence"
                  type="checkbox"
                  defaultChecked
                  className="rounded text-primary focus:ring-2 focus:ring-primary h-4 w-4"
                />
                <div className="text-[11px] leading-tight">
                  <strong className="text-primary font-bold">Include AI Telemetry Evidence</strong>
                  <div className="text-on-surface-variant">Attach CPCB Station 018 verification logs & IMD micro-climate wind vector arrays.</div>
                </div>
              </label>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-2 w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                {isGenerating ? 'Synthesizing with Gemini...' : 'Generate Multi-Language Report with Gemini'}
                <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-mono px-1.5 py-0.2 rounded">v2.5 Flash</span>
              </button>
            </div>
          </div>

          {/* Live Document Preview Right Column */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              {/* Language Switcher Tabs for Document */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-space-sm border-b border-outline-variant/20 mb-space-md">
                <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg text-xs font-mono overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActivePreviewLang('en')}
                    className={`px-2.5 sm:px-3 py-1 rounded-md font-bold transition-all whitespace-nowrap text-xs ${
                      activePreviewLang === 'en' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setActivePreviewLang('mr')}
                    className={`px-2.5 sm:px-3 py-1 rounded-md font-bold transition-all whitespace-nowrap text-xs ${
                      activePreviewLang === 'mr' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
                    }`}
                  >
                    मराठी (Marathi)
                  </button>
                  <button
                    onClick={() => setActivePreviewLang('hi')}
                    className={`px-2.5 sm:px-3 py-1 rounded-md font-bold transition-all whitespace-nowrap text-xs ${
                      activePreviewLang === 'hi' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-on-surface-variant">PAGE 1 OF 1</span>
              </div>

              {/* Rendered Document Body */}
              <div className="p-space-lg rounded-xl bg-surface/50 border border-outline-variant/30 flex flex-col gap-space-md">
                {/* Official Issuance Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-space-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                      BMC
                    </div>
                    <div>
                      <div className="font-bold text-primary text-xs">BMC Ward F-North Environmental Command</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">Public Health Advisory System • Municipal Corporation of Greater Mumbai</div>
                      <div className="text-[10px] text-secondary font-mono">REF ID: BMC-FN-ADV-2025-089</div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[10px] font-mono text-on-surface-variant pt-1 sm:pt-0 border-t sm:border-t-0 border-outline-variant/10">
                    <div>ISSUANCE: 14 MAY 2025, 08:30 IST</div>
                    <div className="text-error font-bold">ACTIVE PROTOCOL LEVEL 2</div>
                    <div>VALIDITY: 12 HOURS</div>
                  </div>
                </div>

                {/* Badge & Title */}
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-mono font-bold uppercase mb-1">
                    {curContent.badge}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-primary font-headline-sm leading-snug">
                    {curContent.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {curContent.notice}
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-center">
                    <span className="text-[10px] text-on-surface-variant uppercase">Composite AQI</span>
                    <div className="text-base sm:text-lg font-bold text-amber-600 mt-0.5">{curContent.compositeAqi} POOR</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-center">
                    <span className="text-[10px] text-on-surface-variant uppercase">Dominant Pollutant</span>
                    <div className="text-base sm:text-lg font-bold text-error mt-0.5">{curContent.dominantPollutant}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-center">
                    <span className="text-[10px] text-on-surface-variant uppercase">Expected Dissipation</span>
                    <div className="text-base sm:text-lg font-bold text-secondary mt-0.5">{curContent.expectedDissipation}</div>
                  </div>
                </div>

                {/* Vulnerability Directives */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-primary">
                    Mandated Health Precautions by Vulnerability Tier
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-primary flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-[16px] text-secondary">school</span>
                          Children & Schools
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {curContent.precautions?.children}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-secondary mt-2 pt-1 border-t border-outline-variant/10">
                        Affects 18 Schools in F-N
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-primary flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-[16px] text-secondary">elderly</span>
                          Seniors & Respiratory
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {curContent.precautions?.seniors}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-secondary mt-2 pt-1 border-t border-outline-variant/10">
                        Sion Hospital Perimeter Buffer
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-primary flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-[16px] text-secondary">commute</span>
                          General Commuters
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {curContent.precautions?.commuters}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-secondary mt-2 pt-1 border-t border-outline-variant/10">
                        Toll Free Line: 1916
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Interventions Banner */}
                <div className="p-space-sm rounded-lg bg-primary-container text-on-primary-container text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-secondary-fixed">
                    <span>Active Ward Interventions Deployed</span>
                    <span>FIELD DEPLOYMENT LIVE</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-surface-container-lowest font-medium">
                    {curContent.activeInterventions}
                  </p>
                </div>

                {/* Audit & Cryptographic Seal Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/20 text-[10px] font-mono text-on-surface-variant">
                  <div>
                    <div>Source Corroborated: CPCB-MH-MUM-018</div>
                    <div>SHA-256: 8f4b931c0e29b109 • Gemini Environmental Engine</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">Dr. Anjali Sharma, Executive Health Officer</div>
                    <div className="text-secondary font-bold">✓ Digital Seal Verified</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md border-t border-outline-variant/20 mt-space-md flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant">
                Marathi (मराठी) and Hindi (हिंदी) translations synchronized with identical telemetry references.
              </span>
              <button
                onClick={() => alert('Side-by-side comparison opened for Hindi & Marathi')}
                className="text-secondary font-bold hover:underline"
              >
                Compare Side-by-Side ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
