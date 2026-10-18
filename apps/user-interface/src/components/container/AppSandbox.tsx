import React, { useState, useRef, useCallback } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { ContainerHardwarePermissions } from '@personal-os/shared';
import { useWebOSBridge } from './useWebOSBridge';
import './AppSandbox.css';

export type DeviceViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface AppSandboxProps {
  appId: string;
  entryUrl: string;
  title?: string;
  allowHardware?: ContainerHardwarePermissions;
  allowSameOrigin?: boolean;
  enableDeviceSimulator?: boolean;
  initialViewport?: DeviceViewportMode;
  className?: string;
  customToolbarLeft?: React.ReactNode;
  onCrash?: (error: { message: string; stack?: string }) => void;
}

/**
 * Sandboxed, isolated container runtime component for running guest applications
 * inside the AEC WebOS desktop with zero style or state leakage.
 */
export const AppSandbox: React.FC<AppSandboxProps> = ({
  appId,
  entryUrl,
  title = 'Application',
  allowHardware,
  allowSameOrigin = true,
  enableDeviceSimulator = true,
  initialViewport = 'desktop',
  className = '',
  customToolbarLeft,
  onCrash,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [viewportMode, setViewportMode] = useState<DeviceViewportMode>(initialViewport);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCrash, setHasCrash] = useState(false);
  const [crashDetails, setCrashDetails] = useState<{ message: string; stack?: string } | null>(
    null
  );
  const [reloadKey, setReloadKey] = useState(0);

  /**
   * Hardware permissions string formatted for the HTML5 'allow' attribute
   */
  const permissionsString = React.useMemo(() => {
    const permissions: string[] = [];
    if (allowHardware?.camera) permissions.push('camera');
    if (allowHardware?.microphone) permissions.push('microphone');
    if (allowHardware?.displayCapture) permissions.push('display-capture');
    return permissions.join('; ');
  }, [allowHardware]);

  /**
   * Safe sandbox string with conditional same-origin permissions
   */
  const sandboxString = React.useMemo(() => {
    const tokens = [
      'allow-scripts',
      'allow-forms',
      'allow-popups',
      'allow-modals',
      'allow-downloads',
    ];
    if (allowSameOrigin) {
      tokens.push('allow-same-origin');
    }
    return tokens.join(' ');
  }, [allowSameOrigin]);

  /**
   * Handle application crash or error
   */
  const handleCrash = useCallback(
    (crash: { message: string; stack?: string }) => {
      setHasCrash(true);
      setCrashDetails(crash);
      setIsLoading(false);
      onCrash?.(crash);
    },
    [onCrash]
  );

  /**
   * Handle guest application ready handshake
   */
  const handleGuestReady = useCallback(() => {
    setIsLoading(false);
    setHasCrash(false);
  }, []);

  /**
   * Setup WebOS Bridge IPC
   */
  useWebOSBridge({
    appId,
    iframeRef,
    onGuestReady: handleGuestReady,
    onCrashReport: handleCrash,
  });

  /**
   * Trigger iframe reload / restart
   */
  const handleReload = () => {
    setIsLoading(true);
    setHasCrash(false);
    setCrashDetails(null);
    setReloadKey((prev) => prev + 1);
  };

  /**
   * Open the isolated app in an external browser tab
   */
  const handleOpenExternal = () => {
    window.open(entryUrl, '_blank', 'noopener,noreferrer');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`app-sandbox-root ${className}`} data-testid={`app-sandbox-${appId}`}>
      {/* Device Simulator & Quick Actions Toolbar */}
      <div className="sandbox-toolbar" data-testid="sandbox-toolbar">
        <div className="sandbox-toolbar-left" data-testid="sandbox-toolbar-left">
          {customToolbarLeft}
        </div>

        {/* Viewport switch controls (Desktop / Tablet / Mobile) */}
        {enableDeviceSimulator && (
          <div className="sandbox-viewport-controls" data-testid="sandbox-viewport-controls">
            <button
              type="button"
              className={`sandbox-tool-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewportMode('desktop')}
              title="Masaüstü Görünümü (100%)"
              aria-label="Desktop view"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              className={`sandbox-tool-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewportMode('tablet')}
              title="Tablet Görünümü (768px)"
              aria-label="Tablet view"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              className={`sandbox-tool-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewportMode('mobile')}
              title="Mobil Görünüm (375px)"
              aria-label="Mobile view"
            >
              <Smartphone size={15} />
            </button>
          </div>
        )}

        <div className="sandbox-action-controls">
          <button
            type="button"
            className="sandbox-tool-btn"
            onClick={handleReload}
            title="Uygulamayı Yeniden Yükle"
            aria-label="Reload app"
          >
            <RotateCw size={14} />
          </button>
          <button
            type="button"
            className="sandbox-tool-btn"
            onClick={handleOpenExternal}
            title="Yeni Sekmede Aç"
            aria-label="Open in external tab"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Main Container Stage & Viewport Framing */}
      <div className={`sandbox-stage viewport-${viewportMode}`}>
        <div className="sandbox-frame-wrapper">
          {/* Loading Overlay */}
          {isLoading && !hasCrash && (
            <div className="sandbox-loading-overlay" data-testid="sandbox-loading">
              <div className="sandbox-spinner" />
              <p className="sandbox-loading-title">{title} başlatılıyor...</p>
              <span className="sandbox-loading-subtitle">
                İzole WebOS Konteyneri Hazırlanıyor
              </span>
            </div>
          )}

          {/* Crash Boundary Fallback Card */}
          {hasCrash ? (
            <div className="sandbox-crash-fallback" data-testid="sandbox-crash">
              <div className="sandbox-crash-card">
                <AlertTriangle size={36} className="sandbox-crash-icon" />
                <h4 className="sandbox-crash-title">Uygulama Beklenmedik Bir Hatayla Karşılaştı</h4>
                <p className="sandbox-crash-desc">
                  Konteyner içerisindeki misafir uygulama çalışma zamanında bir istisna bildirdi.
                  WebOS masaüstünüz güvenli ve etkilenmedi.
                </p>
                {crashDetails?.message && (
                  <pre className="sandbox-crash-error-code">{crashDetails.message}</pre>
                )}
                <button
                  type="button"
                  className="sandbox-btn-restart"
                  onClick={handleReload}
                >
                  <RefreshCw size={15} />
                  <span>Uygulamayı Yeniden Başlat</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sandboxed Iframe Runtime */
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={entryUrl}
              title={title}
              className="sandbox-iframe"
              sandbox={sandboxString}
              allow={permissionsString}
              onLoad={handleIframeLoad}
              data-testid={`sandbox-iframe-${appId}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
