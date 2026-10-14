import React from 'react';
import { Shield, Activity, Cpu, Database } from 'lucide-react';
import './styles/admin.css';

/**
 * Admin Console Root Application Component.
 * Provides isolated telemetry, system metrics, and administrative overview.
 */
export const App: React.FC = () => {
  return (
    <div className="admin-layout" data-testid="admin-layout">
      <header className="admin-header">
        <div className="admin-brand">
          <Shield size={22} aria-hidden="true" />
          <span>AEC WebOS — Admin Console</span>
        </div>
        <div className="admin-status-badge">
          <span className="status-dot" aria-hidden="true">●</span>
          <span>Sistem Aktif</span>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <h1>Yönetim & Telemetri Merkezi</h1>
          <p>Portfolio WebOS bağımsız ve izole edilmiş yönetim kontrol paneli.</p>
        </section>

        <div className="admin-grid">
          <article className="admin-card">
            <div className="admin-card-header">
              <Activity size={20} aria-hidden="true" />
              <h2>Telemetri & Analitik</h2>
            </div>
            <p>Kullanıcı etkileşimleri, oturum metrikleri ve pencere kullanım istatistikleri.</p>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <Cpu size={20} aria-hidden="true" />
              <h2>Sistem Kaynakları</h2>
            </div>
            <p>Docker konteyner durumu, bellek tüketimi ve servis çalışma süreleri (uptime).</p>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <Database size={20} aria-hidden="true" />
              <h2>İçerik & VFS Yönetimi</h2>
            </div>
            <p>Sanal dosya sistemi, dinamik portfolyo içerik güncellemeleri ve log arşivi.</p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default App;
