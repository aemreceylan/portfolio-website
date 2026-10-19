import { useEffect, useCallback } from 'react';
import {
  HostToGuestBridgeEvent,
  GuestToHostBridgeEvent,
  WebOSBridgeEnvelope,
} from '@personal-os/shared';
import { useThemeStore } from '#stores/theme.store';
import { useI18nStore } from '#i18n/i18n.store';

/**
 * Configuration hooks and callbacks for WebOS Container Bridge
 */
export interface UseWebOSBridgeOptions {
  appId: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  allowedOrigin?: string;
  onGuestReady?: (version?: string) => void;
  onSetTitle?: (title: string) => void;
  onNotification?: (notification: { title: string; body: string; icon?: string }) => void;
  onCrashReport?: (crash: { message: string; stack?: string }) => void;
}

/**
 * Strict origin verification helper per OWASP & SonarQube S2819
 */
function isEventOriginAllowed(origin: string, targetOrigin: string): boolean {
  if (origin === targetOrigin) return true;
  return targetOrigin === '' && (origin === 'null' || origin === '');
}

/**
 * Validates inbound message envelope structure
 */
function isValidEnvelope(data: unknown, appId: string): data is WebOSBridgeEnvelope<GuestToHostBridgeEvent> {
  if (!data || typeof data !== 'object') return false;
  const envelope = data as Record<string, unknown>;
  return envelope.source === 'aec-webos-guest' && envelope.targetAppId === appId && Boolean(envelope.payload);
}

function handleNotificationPayload(
  payload: Extract<GuestToHostBridgeEvent, { type: 'WEBOS_NOTIFICATION' }>,
  onNotification?: (notification: { title: string; body: string; icon?: string }) => void
) {
  const safeTitle = typeof payload.title === 'string'
    ? payload.title.replace(/[\r\n\0]/g, '').trim().slice(0, 100)
    : '';
  const safeBody = typeof payload.body === 'string'
    ? payload.body.replace(/[\r\n\0]/g, '').trim().slice(0, 300)
    : '';
  const safeIcon =
    typeof payload.icon === 'string' && !payload.icon.toLowerCase().startsWith('javascript:')
      ? payload.icon.slice(0, 200)
      : undefined;

  if (safeTitle && safeBody) {
    onNotification?.({
      title: safeTitle,
      body: safeBody,
      icon: safeIcon,
    });
  }
}

function handleCrashReportPayload(
  payload: Extract<GuestToHostBridgeEvent, { type: 'WEBOS_CRASH_REPORT' }>,
  onCrashReport?: (crash: { message: string; stack?: string }) => void
) {
  const safeMessage = typeof payload.message === 'string'
    ? payload.message.slice(0, 1000)
    : 'Unknown guest crash';
  const safeStack = typeof payload.stack === 'string'
    ? payload.stack.slice(0, 4000)
    : undefined;

  onCrashReport?.({
    message: safeMessage,
    stack: safeStack,
  });
}

/**
 * Setup secure inbound message listener with strict OWASP origin and source verification
 */
export function useWebOSBridge({
  appId,
  iframeRef,
  allowedOrigin,
  onGuestReady,
  onSetTitle,
  onNotification,
  onCrashReport,
}: UseWebOSBridgeOptions) {
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const currentLanguage = useI18nStore((s) => s.currentLanguage);
  const targetOrigin = allowedOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');

  /**
   * Helper to retrieve computed accent RGB triplet from CSS variables
   */
  const getAccentRgb = useCallback((): string => {
    if (typeof window === 'undefined') return '6, 182, 212';
    const rawRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb');
    return rawRgb ? rawRgb.trim() : '6, 182, 212';
  }, []);

  /**
   * Dispatches a typed message payload to the isolated guest iframe
   */
  const postToGuest = useCallback(
    (payload: HostToGuestBridgeEvent) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return;

      const envelope: WebOSBridgeEnvelope<HostToGuestBridgeEvent> = {
        source: 'aec-webos-host',
        targetAppId: appId,
        timestamp: Date.now(),
        payload,
      };

      targetWindow.postMessage(envelope, targetOrigin);
    },
    [appId, iframeRef, targetOrigin]
  );

  /**
   * Sync theme changes with the guest application
   */
  useEffect(() => {
    postToGuest({
      type: 'WEBOS_THEME_CHANGED',
      theme: currentTheme,
      accentColor: currentTheme,
      accentRgb: getAccentRgb(),
    });
  }, [currentTheme, postToGuest, getAccentRgb]);

  /**
   * Sync language changes with the guest application
   */
  useEffect(() => {
    postToGuest({
      type: 'WEBOS_LANG_CHANGED',
      lang: currentLanguage,
    });
  }, [currentLanguage, postToGuest]);

  /**
   * Setup secure inbound message listener with strict OWASP origin and source verification
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isEventOriginAllowed(event.origin, targetOrigin)) {
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (!isValidEnvelope(event.data, appId)) {
        return;
      }

      const payload = event.data.payload;
      switch (payload.type) {
        case 'WEBOS_GUEST_READY':
          onGuestReady?.(typeof payload.version === 'string' ? payload.version.slice(0, 20) : undefined);
          postToGuest({
            type: 'WEBOS_INIT_CONFIG',
            theme: currentTheme,
            accentColor: currentTheme,
            accentRgb: getAccentRgb(),
            lang: currentLanguage,
          });
          break;
        case 'WEBOS_SET_TITLE': {
          const safeTitle = typeof payload.title === 'string'
            ? payload.title.replace(/[\r\n\0]/g, '').trim().slice(0, 100)
            : '';
          if (safeTitle) onSetTitle?.(safeTitle);
          break;
        }
        case 'WEBOS_NOTIFICATION':
          handleNotificationPayload(payload, onNotification);
          break;
        case 'WEBOS_CRASH_REPORT':
          handleCrashReportPayload(payload, onCrashReport);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    appId,
    iframeRef,
    targetOrigin,
    currentTheme,
    currentLanguage,
    onGuestReady,
    onSetTitle,
    onNotification,
    onCrashReport,
    postToGuest,
    getAccentRgb,
  ]);

  return { postToGuest };
}
