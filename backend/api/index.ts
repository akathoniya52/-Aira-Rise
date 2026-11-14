import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

// Cache the DB connection across serverless invocations so we don't
// reconnect on every request (Vercel reuses warm function instances).
let dbConnected = false;

async function ensureDatabase(): Promise<void> {
  if (dbConnected) return;
  try {
    await connectDatabase();
    dbConnected = true;
  } catch (err) {
    // Don't crash the function — allow it to run without DB when needed
    console.error('Database connection failed:', err);
  }
}

// Vercel serverless entry point: export the Express app as the handler.
export default async function handler(req: any, res: any) {
  await ensureDatabase();
  return app(req, res);
}
