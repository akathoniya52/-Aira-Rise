// src/app/api/datasets/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export interface RawRowInput {
  location?: string;
  station?: string;
  timestamp?: string;
  date?: string;
  pm25?: string | number;
  pm10?: string | number;
  no2?: string | number;
  temp?: string | number;
  unit?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { rows } = body;
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: false, error: 'Expected "rows" array in payload' }, { status: 400 });
    }

    if (rows.length > 10000) {
      return NextResponse.json({ success: false, error: 'Payload exceeds maximum limit of 10,000 rows' }, { status: 413 });
    }

    const flagsCount = {
      MISSING_VALUE: 0,
      INVALID_NUMBER: 0,
      NORMALIZED_UNIT: 0,
      HOTSPOT_SPIKE: 0,
      OPTIMAL_BASELINE: 0,
    };

    const validatedRows = rows.map((r: Record<string, unknown>, idx: number) => {
      const loc = String(r.Location || r.location || r.station || r.Station || 'Ward Monitoring Node').trim();
      const time = String(r.Timestamp || r.timestamp || r.date || r.Date || new Date().toISOString().slice(0, 16).replace('T', ' ')).trim();

      const rawUnit = String(r.Unit || r.unit || 'µg/m³').trim();
      const isMg = rawUnit.toLowerCase().includes('mg');

      const rawPm25 = r.PM25 ?? r['PM2.5'] ?? r.pm25 ?? r.pm_25;
      const rawPm10 = r.PM10 ?? r['PM 10'] ?? r.pm10 ?? r.pm_10;
      const rawNo2 = r.NO2 ?? r.no2 ?? '24.5';
      const rawTemp = r.Temp ?? r.temp ?? '31.2';

      let pm25 = typeof rawPm25 === 'number' ? rawPm25 : parseFloat(String(rawPm25));
      let pm10 = typeof rawPm10 === 'number' ? rawPm10 : parseFloat(String(rawPm10));
      const no2 = typeof rawNo2 === 'number' ? rawNo2 : parseFloat(String(rawNo2));
      const temp = typeof rawTemp === 'number' ? rawTemp : parseFloat(String(rawTemp));

      const flags: string[] = [];

      if (isMg) {
        if (!isNaN(pm25)) pm25 *= 1000;
        if (!isNaN(pm10)) pm10 *= 1000;
        flags.push('NORMALIZED_UNIT');
        flagsCount.NORMALIZED_UNIT++;
      }

      if (isNaN(pm25) || isNaN(pm10)) {
        flags.push('MISSING_VALUE');
        flagsCount.MISSING_VALUE++;
      } else if (pm10 > 200 || pm25 > 150) {
        flags.push('Hotspot Anomaly Flagged');
        flagsCount.HOTSPOT_SPIKE++;
      } else {
        flags.push('Optimal Baseline');
        flagsCount.OPTIMAL_BASELINE++;
      }

      return {
        rowId: `#${String(idx + 1).padStart(3, '0')}`,
        timestamp: time,
        sensorId: r.SensorID || r.sensor_id || `SN-FN-${String((idx % 18) + 1).padStart(2, '0')}`,
        location: loc,
        pm25: isNaN(pm25) ? null : pm25,
        pm10: isNaN(pm10) ? null : pm10,
        no2: isNaN(no2) ? null : no2,
        temp: isNaN(temp) ? null : temp,
        validationFlag: flags[0] || 'Optimal Baseline',
        flags,
        unit: 'µg/m³'
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRows: rows.length,
        flagsCount,
        validatedRows: validatedRows.slice(0, 50)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
