# NovaOS / AEC Portfolio — Mimari & Konsept Belgesi

## 1. Vizyon ve Tasarım Felsefesi
Bu proje, klasik statik portfolyo sitelerinin ötesine geçen, modern bir bilgisayar mühendisinin yeteneklerini, sistem düşüncesini ve kod kalitesini sergileyen **Spatial Dark Glass (VisionOS & Linear esintili)** bir masaüstü web deneyimidir (**AEC Portfolyo**).

* **Marka / Kimlik**: Fiktif OS yerine doğrudan geliştirici kimliği: **AEC** (Ahmet).
* **Estetik**: Derin koyu tonlar (`#060709`, `#0a0c10`), katmanlı buzlu cam (`backdrop-filter: blur(24px)`), aurora ışık huzmeleri ve mikro-interaksiyonlar.
* **İşlevsel Sadelik**: Yalnızca çalışan ve amaca hizmet eden arayüz elemanları; sahte/dekoratif widget'lar (wifi, pil vb.) kaldırılmıştır.
* **Aktif Uygulama Kapsamı**: Şu an için sistem yalnızca iki kararlı ve amaca odaklı çekirdek uygulama içerir:
  - **Terminal (`terminal`)**: CLI portfolyo, biyografi, yetenekler, iletişim ve kullanıcı oturum yönetimi.
  - **Ayarlar (`settings`)**: Sistem tercihleri ve 7 dilli uluslararasılaştırma seçimi.
* **Tipografi**: Arayüz metinleri için modern sans-serif (Inter / Geist Sans), kod ve sistem detayları için monospace (JetBrains Mono).
* **Eğitici Geliştirme (Mentorship Approach)**: Tüm mimari kararlar, tasarım desenleri ve optimizasyonlar adım adım açıklanarak belgelenir.
* **Hızlı Başlangıç Rehberi**: Geliştiriciler ve AI Agent'lar için özet rehber [QUICKSTART.md](file:///docs/QUICKSTART.md) dosyasında tutulur.

---

## 2. Uluslararasılaştırma & Çoklu Dil Mimarisi (i18n)

* **Desteklenen Diller**: İngilizce (`en`), Türkçe (`tr`), Almanca (`de`), Fransızca (`fr`), İspanyolca (`es`), Rusça (`ru`), Japonca (`ja`).
* **Tarayıcı Tespiti & Kalıcılık**: `navigator.language` üzerinden ilk yüklemede otomatik dil eşleme yapılır, kullanıcının seçimi `localStorage` (`aec_portfolio_lang`) anahtarında kalıcı hale getirilir.
* **React 19 Compiler Uyumluluğu**: React 19 Derleyicisinin otomatik memoization kısıtlamalarını aşmak için `useTranslation()` kancası dinamik `t` referansı üretir; dil değiştiğinde tüm UI bileşenleri gecikmesiz güncellenir.
* **Ayarlar Uygulaması**: Kullanıcı bayrak, yerel dil ismi ve aktif göstergeleri ile tek tıkla dil geçişi yapabilir.

---

## 3. Pencere Motoru ve Geometri Mimarisi

Pencereler **Zustand** store üzerinden reaktif olarak yönetilir:
* **8 Yönlü Boyutlandırma (N, S, E, W, NE, NW, SE, SW)**:
  - Kullanıcı pencerenin herhangi bir kenarından veya köşesinden tutarak pencereyi genişletip daraltabilir.
  - Sol (`W`) ve üst (`N`) kenarlar sürüklendiğinde, pencerenin konumu (`x`, `y`) ve boyutu (`width`, `height`) eşzamanlı ve `minSize` kısıtları korunarak matematiksel olarak dengelenir.
* **Tam Ekran & Üst Bar Çakışma Koruması**:
  - Üst durum çubuğu 42px (`--statusbar-height: 42px`) kalınlığındadır.
  - Ekranı kaplama eyleminde (`maximizeWindow`), pencere tepe noktası kesin olarak `y: 42px` ve yüksekliği `screenHeight - 42px` olarak ayarlanır, böylece pencere başlık çubuğu asla üst barın altında gizlenmez.
* **Pencere Kontrol İkonları ve Eylemleri**:
  - **Kapat (Kırmızı)**: `X` ikonu. Pencereyi kapatır ve açık uygulamalar çubuğundan (Dock) kaldırır.
  - **Küçült (Sarı)**: `Minus` ikonu. Pencereyi simge durumuna küçülterek Dock'a indirir.
  - **Ekranı Kapla / Normal Boyuta Dön (Yeşil / Mavi)**:
    - Normal boyuttayken: `Maximize2` ikonu ("Ekranı Kapla").
    - Tam ekrandayken: `Minimize2` ikonu ("Normal Boyuta Dön") ve belirgin mavi parıltı.
  - **Başlık Çubuğuna Çift Tıklama (Double-Click)**: Ekranı kaplama ve eski boyuta dönme arasında hızlıca geçiş yapılır.

---

## 4. Dinamik Açık Uygulamalar Çubuğu (Dock / Taskbar)

* **Sadece Çalışan Uygulamalar**: Alt bar artık tüm statik uygulamaları değil; **yalnızca o an açık veya simge durumunda olan uygulamaları** listeler.
* **Taşmasız Hover Efekti**: Dock butonları büyüdüğünde (`scale(1.12) translateY(-2px)`) dock sınırlarını taşmayacak şekilde dikey boşluklar ve esnek çerçeve yapılandırılmıştır.
* **Etkileşim**:
  - Aktif pencereye tıklandığında simge durumuna küçülür.
  - Simge durumundaki veya arkadaki pencereye tıklandığında öne gelir ve odaklanır.
  - Pencere kapatıldığında alt bardan otomatik olarak ayrılır.

---

## 5. Çapraz Tarayıcı & Tasarım Sistemi

* **Cam & Bulanıklık**: `-webkit-backdrop-filter` ve standart `backdrop-filter` birlikte kullanılarak Safari, iOS WebKit, Firefox ve Chromium üzerinde pürüzsüz buzlu cam deneyimi sağlanır.
* **Özel Kaydırma Çubukları (Custom Scrollbars)**:
  - Pencereler küçüldüğünde ortaya çıkan varsayılan kaba kaydırma çubukları yerine; `::-webkit-scrollbar` ve Firefox `scrollbar-width: thin; scrollbar-color:...` ile Spatial Dark Glass temasına özel yarı saydam yuvarlatılmış kaydırıcılar kullanılır.

---

## 6. Modüler Monolit & Subpath Imports (`#`)

* **Node.js Subpath Imports**: Kod içi dosya yollarında kırılgan `../../` bağıntıları yerine `package.json`'da `"imports"` ve `tsconfig.json`'da `"paths"` ile `#components/*`, `#stores/*`, `#styles/*`, `#apps/*`, `#i18n/*`, `#test/*` standartlaştırılmıştır.
* **Monorepo Yapısı**:
```text
PersonalWebSite/
├── apps/
│   ├── user-interface/     # React 19 + Vite + React Compiler (AEC Spatial Dark Glass Deneyimi)
│   ├── admin-interface/    # React 19 + Vite (Minimal, standart, güvenli CMS & Telemetri Paneli)
│   └── backend/            # Node.js 22 + Fastify + SQLite (API, Auth, Telemetri Endpoints)
├── packages/
│   └── shared/             # TypeScript Tipleri, DTO'lar, Zod Şemaları, Manifest Sözleşmeleri
├── docker/
│   ├── Dockerfile.backend  # Multi-stage Debian-slim imajı
│   └── docker-compose.yml  # Prodüksiyon orkestrasyonu
└── docs/                   # ARCHITECTURE.md, DEVLOG.md, QUICKSTART.md
```

---

## 7. Güvenlik, Zod & DevSecOps

* **Çalışma Zamanı Güvenliği**: Terminal komutları, argümanları ve kullanıcı isimleri (`su <user>`) Zod şemaları ile doğrulanır.
* **DevSecOps Standardı**: `npm audit` sıfır zafiyet garantisi ile denetlenir.
