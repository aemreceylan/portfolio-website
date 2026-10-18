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
 * Custom React Hook establishing a secure, type-safe IPC bridge between
 * the WebOS host and a sandboxed micro-container application.
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
      // 1. Strict origin & source verification per OWASP & SonarQube S2819
      if (event.origin !== targetOrigin && event.origin !== 'null' && event.origin !== '') {
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      // 2. Validate envelope structure
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'aec-webos-guest' || data.targetAppId !== appId) return;

      const payload = data.payload as GuestToHostBridgeEvent;
      if (!payload?.type) return;

      // 3. Handle message types
      switch (payload.type) {
        case 'WEBOS_GUEST_READY': {
          onGuestReady?.(payload.version);
          // Respond with initial host configuration
          postToGuest({
            type: 'WEBOS_INIT_CONFIG',
            theme: currentTheme,
            accentColor: currentTheme,
            accentRgb: getAccentRgb(),
            lang: currentLanguage,
          });
          break;
        }
        case 'WEBOS_SET_TITLE': {
          onSetTitle?.(payload.title);
          break;
        }
        case 'WEBOS_NOTIFICATION': {
          onNotification?.({
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
          });
          break;
        }
        case 'WEBOS_CRASH_REPORT': {
          onCrashReport?.({
            message: payload.message,
            stack: payload.stack,
          });
          break;
        }
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
