// src/app/api/ai/generate-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateMultilingualReport } from '@/services/geminiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, role, comprehensionLevel, telemetry, apiKey } = body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || '';

    const result = await generateMultilingualReport(
      language || 'en',
      role || 'ward_officer',
      comprehensionLevel || 'simple',
      telemetry || [],
      keyToUse
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Report generation failed' },
      { status: 500 }
    );
  }
}
