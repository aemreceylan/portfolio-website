/**
 * Classification of telemetry events tracked silently in NovaOS
 */
export type TelemetryEventType =
  | 'session_start'
  | 'session_heartbeat'
  | 'session_end'
  | 'app_open'
  | 'app_close'
  | 'app_focus'
  | 'terminal_command'
  | 'theme_change'
  | 'web_vitals';

/**
 * Standard telemetry event payload sent to Fastify backend
 */
export interface TelemetryPayload {
  sessionId: string;
  eventType: TelemetryEventType;
  timestamp: number;
  appId?: string;
  commandName?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated analytics view for the owner/admin dashboard
 */
export interface AnalyticsSummary {
  totalVisitors: number;
  activeSessions: number;
  averageSessionDurationMs: number;
  popularApps: Array<{
    appId: string;
    openCount: number;
    totalTimeSpentMs: number;
  }>;
  recentEvents: TelemetryPayload[];
}
