// src/server.ts
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './shared/logger.js';

async function startServer(): Promise<void> {
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 AiraRise API server running on port ${env.PORT}`, {
      environment: env.NODE_ENV,
      port: env.PORT,
    });
  });

  // Connect to MongoDB asynchronously without blocking HTTP listener
  connectDatabase().catch((err) => {
    logger.warn('Database initialization deferred:', { error: String(err) });
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error('Failed to start server', { error: String(err) });
  process.exit(1);
});
