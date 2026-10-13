import { z } from 'zod';

export const telemetryEventTypeSchema = z.enum([
  'session_start',
  'session_heartbeat',
  'session_end',
  'app_open',
  'app_close',
  'app_focus',
  'terminal_command',
  'theme_change',
  'web_vitals',
]);

export const telemetryPayloadSchema = z.object({
  sessionId: z.string().min(8).max(64),
  eventType: telemetryEventTypeSchema,
  timestamp: z.number().int().positive(),
  appId: z.string().max(50).optional(),
  commandName: z.string().max(100).optional(),
  durationMs: z.number().min(0).max(86400000).optional(), // Max 24 hours
  metadata: z.record(z.unknown()).optional(),
});

export type ValidatedTelemetryPayload = z.infer<typeof telemetryPayloadSchema>;
