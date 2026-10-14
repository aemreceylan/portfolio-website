import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

/**
 * Health check response payload schema.
 */
export interface HealthStatusResponse {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
}

/**
 * Root service info response payload schema.
 */
export interface ServiceInfoResponse {
  name: string;
  version: string;
  status: 'running';
  timestamp: string;
}

/**
 * Creates and configures the Express application instance.
 * Applies essential security headers, CORS policies, and base health check routes.
 *
 * @returns {Application} Configured Express application
 */
export function createApp(): Application {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');

  // Security headers & DevSecOps baseline
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (such as mobile apps, curl, docker health checks)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // Service root endpoint
  app.get('/', (_req: Request, res: Response<ServiceInfoResponse>) => {
    res.status(200).json({
      name: '@personal-os/backend',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    });
  });

  // Health check endpoint for Docker container & orchestrator probes
  app.get('/health', (_req: Request, res: Response<HealthStatusResponse>) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Test error route for automated quality and error middleware testing
  if (process.env.NODE_ENV === 'test') {
    app.get('/test-error', () => {
      throw new Error('Simulated internal failure');
    });
  }

  // 404 handler for unmapped routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist.',
    });
  });

  // Centralized error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Internal Server Error',
      message: isProduction ? 'An unexpected error occurred.' : err.message,
    });
  });

  return app;
}
