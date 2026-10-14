import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[backend] Express server listening on http://${HOST}:${PORT}`);
  console.log(`[backend] Health check available at http://${HOST}:${PORT}/health`);
});

/**
 * Handles graceful shutdown for Docker container lifecycle management.
 * Ensures open connections are closed before process termination.
 */
function handleShutdown(signal: string): void {
  console.log(`[backend] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[backend] HTTP server closed. Process exiting.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout if connections don't drain
  setTimeout(() => {
    console.error('[backend] Forcefully terminating due to shutdown timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
