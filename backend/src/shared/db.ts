// src/shared/db.ts
// Lightweight DB-readiness guard so persistence endpoints fail fast (and the
// caller can gracefully fall back) when MongoDB is not connected.

import mongoose from 'mongoose';

export function isDbConnected(): boolean {
  // 1 === connected
  return mongoose.connection.readyState === 1;
}
