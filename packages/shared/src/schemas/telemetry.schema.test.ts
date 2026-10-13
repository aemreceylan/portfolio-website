import { describe, it, expect } from 'vitest';
import { telemetryPayloadSchema } from './telemetry.schema';

describe('TelemetryPayload Zod Schema Validation', () => {
  it('should validate a valid session start event', () => {
    const payload = {
      sessionId: 'session-xyz-12345678',
      eventType: 'session_start' as const,
      timestamp: Date.now(),
    };

    const result = telemetryPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should validate an app open event with duration and metadata', () => {
    const payload = {
      sessionId: 'session-xyz-12345678',
      eventType: 'app_open' as const,
      timestamp: Date.now(),
      appId: 'terminal',
      durationMs: 14500,
      metadata: { referrer: 'direct', screenWidth: 1920 },
    };

    const result = telemetryPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid event types', () => {
    const payload = {
      sessionId: 'session-xyz-12345678',
      eventType: 'malicious_injected_event',
      timestamp: Date.now(),
    };

    const result = telemetryPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject invalid timestamps', () => {
    const payload = {
      sessionId: 'session-xyz-12345678',
      eventType: 'session_heartbeat' as const,
      timestamp: -500,
    };

    const result = telemetryPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
