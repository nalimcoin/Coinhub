import { webcrypto } from 'crypto';
import { App } from './App.js';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

const app = new App();

app.start().catch((error) => {
  console.error('[Server] Fatal error:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  await app.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});