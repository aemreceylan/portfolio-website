# NovaOS Hızlı Başlangıç & Geliştirici Kılavuzu (QUICKSTART)

Bu kılavuz, projeye yeni dahil olan bir geliştiricinin veya bir **AI Agent'ın** tüm sistem mimarisini (`ARCHITECTURE.md`) baştan sona okumasına gerek kalmadan, doğrudan işe koyulabilmesi için hazırlanmış pratik bir el kitabıdır.

---

## 1. Proje Mimarisi (Kuşbakışı)

* **`apps/user-interface`**: React 19 + TypeScript + Vite + Zustand (Spatial Dark Glass WebOS - Ziyaretçi Arayüzü).
* **`apps/admin-interface`**: React 19 + TypeScript + Vite (CMS & Telemetri Paneli - Güvenlik amacıyla izole edilmiştir).
* **`apps/backend`**: Node.js 22 + Fastify + SQLite (`better-sqlite3`) (API, Auth, Telemetri motoru).
* **`packages/shared`**: Ortak TypeScript tipleri ve Zod doğrulama şemaları.

---

## 2. Temel Komutlar (Cheatsheet)

```bash
# Tüm bağımlılıkları yükle (Monorepo kökünde)
npm install

# Geliştirme ortamını başlat (Tüm alt projeler paralel başlar)
npm run dev

# Testleri çalıştır (Vitest)
npm test

# Tip kontrolü ve Linting
npm run typecheck
npm run lint
```

---

## 3. Pratik Senaryolar & "Nasıl Yapılır?"

### Senaryo A: Sisteme Yeni Bir Uygulama Eklemek
1. `apps/user-interface/src/apps/` altına yeni klasör aç (örn: `notes/`).
2. `apps/user-interface/src/apps/app-registry.tsx` dosyasına `lazy` import ve manifest tanımını ekle:
   ```tsx
   import { lazy } from 'react';
   import { AppManifest } from '@personal-os/shared';

   export const notesManifest: AppManifest = {
     id: 'notes',
     title: 'Not Defteri',
     iconName: 'FileText',
     category: 'utility',
     bounds: { x: 120, y: 80, width: 640, height: 480 },
     minSize: { width: 360, height: 260 },
     resizable: true,
     isMinimized: false,
     isMaximized: false,
     isOpen: false,
     zIndex: 10,
   };
   ```
3. `APP_REGISTRY` nesnesine kaydet. Sistem otomatik olarak masaüstü ikonunu ve pencere motorunu bağlar.
4. Dosya importlarında daima Node.js subpath eşlemelerini (`#components/*`, `#stores/*`, `#styles/*`, `#apps/*`, `#i18n/*`) kullan.

### Senaryo B: Terminal'e Yeni Bir Komut Eklemek
1. `apps/user-interface/src/apps/terminal/commands/` klasörüne git.
2. Yeni komut dosyasını ekle ve `terminalCommandRegistry` içine kaydet.
3. *Kural*: Girdiler daima Zod şeması ile doğrulanmalı, ham `eval()` veya `innerHTML` asla kullanılmamalıdır.

### Senaryo C: Backend'e Yeni Bir API Uç Noktası Eklemek
1. `packages/shared/src/schemas/` altında Zod şemasını tanımla (istek gövdesi ve yanıt tipi).
2. `apps/backend/src/routes/` altında Fastify rotasını oluştur.
3. Şema doğrulaması için Fastify'ın dahili doğrulayıcısını veya Zod'u entegre et.

---

## 4. Geliştirici & Agent Kuralları (Altın Kurallar)

1. **Dökümantasyon**: Mimari bir değişiklik yaptıysan `docs/ARCHITECTURE.md`'ye, tamamladığın adımı ise `docs/DEVLOG.md`'ye kaydet.
2. **Doğrulama (Zod)**: Kullanıcıdan, terminalden veya API'den gelen her veriyi `zod` ile doğrula.
3. **Testler**: Yeni bir store veya kritik bileşen eklediğinde `*.test.ts(x)` dosyasını yaz ve `npm test` ile doğrula.
4. **Güvenlik**: SPA sandbox iframe'lerinde `sandbox="allow-scripts allow-same-origin"` kuralını koru.
