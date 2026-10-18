import React, { useState } from 'react';
import { Wifi, WifiOff, Cpu, Info, ExternalLink, X } from 'lucide-react';
import { AppSandbox } from '#components/container/AppSandbox';
import type { AppManifest } from '@personal-os/shared';
import './BandApp.css';

export interface BandAppProps {
  manifest?: AppManifest;
  windowId?: string;
}

/**
 * BAND (Band Absolutely Not Discord) WebOS Application
 * Containerized execution with compact mode summary and configurable device simulator.
 */
export const BandApp: React.FC<BandAppProps> = ({ manifest, windowId }) => {
  const [backendMode, setBackendMode] = useState<'standalone' | 'connected'>('standalone');
  const [showModeModal, setShowModeModal] = useState(false);

  const querySuffix = windowId ? `?instanceId=${encodeURIComponent(windowId)}` : '';
  const entryUrl =
    backendMode === 'connected'
      ? `http://localhost:3000${querySuffix}`
      : `/apps/band/index.html${querySuffix}`;

  const enableDeviceSimulator = manifest?.container?.enableDeviceSimulator ?? true;

  const modeSummary = (
    <div className="band-mode-summary" data-testid="band-mode-summary">
      <div className="band-mode-segmented-group" aria-label="Çalışma Modu">
        <button
          type="button"
          className={`band-mode-segment-btn offline ${backendMode === 'standalone' ? 'active' : ''}`}
          onClick={() => setBackendMode('standalone')}
          title="Offline Mod: Simüle DB (Yerel Tarayıcı Depolaması)"
          aria-pressed={backendMode === 'standalone'}
        >
          <WifiOff size={14} className="band-mode-icon" />
          <span className="band-mode-label">Offline</span>
          <span className="band-mode-sublabel">(Simüle DB)</span>
        </button>

        <button
          type="button"
          className={`band-mode-segment-btn online ${backendMode === 'connected' ? 'active' : ''}`}
          onClick={() => setBackendMode('connected')}
          title="Online Mod: Canlı Backend (localhost:3000)"
          aria-pressed={backendMode === 'connected'}
        >
          <Wifi size={14} className="band-mode-icon" />
          <span className="band-mode-label">Online</span>
          <span className="band-mode-sublabel">(Port 3000)</span>
        </button>
      </div>

      <button
        type="button"
        className="band-mode-info-btn"
        onClick={() => setShowModeModal(true)}
        title="Çalışma Modu & Bilgi"
        aria-label="Mode Information"
      >
        <Info size={14} />
      </button>
    </div>
  );

  return (
    <div className="band-app-container" data-testid="band-app">
      <div className="band-content-body">
        <div className="band-sandbox-frame-wrap">
          <AppSandbox
            appId="band"
            entryUrl={entryUrl}
            title="BAND (Band Absolutely Not Discord)"
            allowHardware={{ camera: true, microphone: true, displayCapture: true }}
            allowSameOrigin={true}
            enableDeviceSimulator={enableDeviceSimulator}
            customToolbarLeft={modeSummary}
            initialViewport="desktop"
          />
        </div>
      </div>

      {/* Compact Info & Mode Configuration Modal */}
      {showModeModal && (
        <div className="band-info-modal-backdrop">
          <dialog
            open
            className="band-info-modal-card"
            aria-label="BAND Bilgi ve Çalışma Modu"
          >
            <div className="band-info-modal-header">
              <div className="band-info-title-group">
                <Cpu size={16} className="icon-cyan" />
                <h4>BAND Çalışma Modu & Sistem Bilgisi</h4>
              </div>
              <button
                type="button"
                className="band-info-close-btn"
                onClick={() => setShowModeModal(false)}
                aria-label="Kapat"
              >
                <X size={14} />
              </button>
            </div>

            <div className="band-info-modal-body">
              <p className="band-info-desc">
                BAND, Mediasoup v3 SFU WebRTC, Socket.IO ve MongoDB mimarisiyle geliştirilmiş açık
                kaynaklı bir iletişim platformudur.
              </p>

              <div className="band-info-mode-selector">
                <button
                  type="button"
                  className={`band-info-mode-option ${backendMode === 'standalone' ? 'active' : ''}`}
                  onClick={() => {
                    setBackendMode('standalone');
                    setShowModeModal(false);
                  }}
                >
                  <span className="band-info-mode-title">İnteraktif Simüle DB (Offline)</span>
                  <span className="band-info-mode-sub">
                    Yerel backend gerektirmez, doğrudan tarayıcı depolamasında çalışır.
                  </span>
                </button>

                <button
                  type="button"
                  className={`band-info-mode-option ${backendMode === 'connected' ? 'active' : ''}`}
                  onClick={() => {
                    setBackendMode('connected');
                    setShowModeModal(false);
                  }}
                >
                  <span className="band-info-mode-title">Canlı Yerel Backend (Port 3000)</span>
                  <span className="band-info-mode-sub">
                    <code>cd apps/band/backend/server && npm start</code> ile bağlanan canlı sunucu.
                  </span>
                </button>
              </div>

              <div className="band-info-links">
                <a
                  href="https://github.com/aemreceylan/BAND"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="band-info-link-btn"
                >
                  <ExternalLink size={13} />
                  <span>GitHub Deposunu İncele</span>
                </a>
              </div>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
};
