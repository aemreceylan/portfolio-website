/**
 * Hardware permissions that can be granted to an isolated application container
 */
export interface ContainerHardwarePermissions {
  camera?: boolean;
  microphone?: boolean;
  displayCapture?: boolean;
}

/**
 * Sandboxing configuration for containerized WebOS applications
 */
export interface AppSandboxConfig {
  entryUrl: string;
  allowHardware?: ContainerHardwarePermissions;
  allowSameOrigin?: boolean;
  enableDeviceSimulator?: boolean;
}

/**
 * Host-to-Guest WebOS Bridge event payloads
 */
export type HostToGuestBridgeEvent =
  | {
      type: 'WEBOS_INIT_CONFIG';
      theme: string;
      accentColor: string;
      accentRgb: string;
      lang: string;
    }
  | {
      type: 'WEBOS_THEME_CHANGED';
      theme: string;
      accentColor: string;
      accentRgb: string;
    }
  | {
      type: 'WEBOS_LANG_CHANGED';
      lang: string;
    }
  | {
      type: 'WEBOS_WINDOW_FOCUS';
      isFocused: boolean;
    };

/**
 * Guest-to-Host WebOS Bridge event payloads
 */
export type GuestToHostBridgeEvent =
  | {
      type: 'WEBOS_GUEST_READY';
      appId: string;
      version?: string;
    }
  | {
      type: 'WEBOS_SET_TITLE';
      title: string;
    }
  | {
      type: 'WEBOS_NOTIFICATION';
      title: string;
      body: string;
      icon?: string;
    }
  | {
      type: 'WEBOS_CRASH_REPORT';
      message: string;
      stack?: string;
    };

/**
 * Unified WebOS Bridge Message envelope
 */
export interface WebOSBridgeEnvelope<T = HostToGuestBridgeEvent | GuestToHostBridgeEvent> {
  source: 'aec-webos-host' | 'aec-webos-guest';
  targetAppId: string;
  timestamp: number;
  payload: T;
}
