// src/app/api/ai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeTelemetryWithGemini } from '@/services/geminiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telemetry, hotspots, role, apiKey } = body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';

    const result = await analyzeTelemetryWithGemini(
      telemetry || [],
      hotspots || [],
      role || 'ward_officer',
      keyToUse
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI Analysis failed' },
      { status: 500 }
    );
  }
}
