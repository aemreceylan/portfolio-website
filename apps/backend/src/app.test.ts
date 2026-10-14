import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.js';

describe('Express Backend Application', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('responds with service info on GET /', async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      name: '@personal-os/backend',
      version: '1.0.0',
      status: 'running',
    });
    expect(body.timestamp).toBeDefined();
  });

  it('responds with healthy status on GET /health', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(typeof body.uptime).toBe('number');
    expect(body.timestamp).toBeDefined();
  });

  it('returns 404 for unknown endpoints', async () => {
    const response = await fetch(`${baseUrl}/unknown-path`);
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toMatchObject({
      error: 'Not Found',
      message: 'The requested resource does not exist.',
    });
  });

  it('handles uncaught errors via centralized error middleware', async () => {
    const response = await fetch(`${baseUrl}/test-error`);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBeDefined();
  });
});
