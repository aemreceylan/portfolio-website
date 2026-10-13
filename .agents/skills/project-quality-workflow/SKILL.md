---
name: project-quality-workflow
description: >-
  Use this skill whenever developing, modifying, refactoring, or reviewing code in the portfolio project.
  Enforces strict software engineering practices: documentation currency, SonarQube / SonarJS quality checks,
  high test coverage with automated unit and integration tests, and DevSecOps security audits.
---

# Project Quality & Engineering Standards Workflow

This skill establishes and enforces non-negotiable software engineering guidelines for the Personal Portfolio WebOS project.

## 1. Documentation-First Discipline (Canlı ve Güncel Dökümantasyon)

Her kod değişikliği veya mimari kararda dökümanlar anında güncellenmelidir:
- **`docs/ARCHITECTURE.md`**: Mimari kararlar, state modelleri, yeni eklenen app/window bileşenleri ve stil standartları güncel tutulmalı.
- **`docs/DEVLOG.md`**: Yapılan her oturum, eklenen her özellik, çözülen problemler ve sonraki adımlar kronolojik olarak kayıt altına alınmalı.
- **Kod İçi Dökümantasyon**: Public API'ler, hook'lar, store fonksiyonları ve karmaşık matematik/geometri algoritmaları (pencere sürükleme, manyetik snap, z-index stack) TSDoc standartlarında dökümante edilmelidir.

## 2. SonarQube & Statik Kod Kalitesi Analizi

Yazılan her kod parçası güvenlik açıkları (security hotspots), kod kokuları (code smells) ve karmaşıklık (cyclomatic complexity) açısından taranmalıdır:
- **SonarJS / ESLint Entegrasyonu**: `eslint-plugin-sonarjs` kuralları her zaman dev ortamında aktif olmalı ve sıfır uyarı ile geçmelidir.
- **SonarQube Analizi**: SonarQube CLI veya analiz araçları kullanılarak her yeni modül taranmalı, Cognitive Complexity eşikleri aşılmamalıdır.
- **Temiz Kod (Clean Code)**: DRY, SOLID prensiplerine tam uyum; ölü kod veya kullanılmayan bağımlılıklar derhal temizlenmelidir.

## 3. Test-Güdümlü Güvenilirlik (Unit & Integration Tests)

Masaüstü işletim sistemi simülasyonu karmaşık state ve event etkileşimleri içerir:
- **Vitest & React Testing Library**:
  - Pencere yönetimi (Window Manager: open, close, minimize, maximize, z-index reorder, drag coordinates).
  - Mobil dönüşüm (Metamorphic UI: breakpoint geçişlerinde drawer/sheet state davranışı).
  - Web Audio sentezleyicisi ve ses toggle kontrolleri.
  - Komut paleti (Spotlight / Cmd+K arama ve klavye navigasyonu).
  - Telemetri motoru ve analitik event dispatcher testleri.
- **Kapsama (Coverage)**: Kritik iş mantığı ve state reducer/store'ları için en az %80+ test kapsamı hedeflenmelidir.

## 4. DevSecOps & Güvenlik Analiz Rutini (Security Audit)

Her modül tamamlandıktan sonra güvenlik şapkası takılarak aşağıdaki kontroller yapılmalıdır:
- **Iframe Güvenliği**: Harici site/demo önizlemelerinde `sandbox` niteliklerinin aşılmadığından emin olunmalı (`allow-same-origin` + `allow-scripts` dikkatli kullanılmalı, clickjacking/CSRF engellenmeli).
- **Girdi Güvenliği**: Terminal ve form girdileri kesinlikle ham `eval()` veya `innerHTML` ile işletilmemeli; XSS ve injection zafiyetlerine karşı taranmalı.
- **Veri & Telemetri Gizliliği**: Telemetri verilerinde hiçbir PII (kişisel veri) tutulmamalı, IP adresleri anonimleştirilmeli, GDPR/KVKK uyumlu kalınmalıdır.
- **Dependency Audit**: `npm audit` çalıştırılarak kullanılan paketlerin zafiyetleri kontrol edilmelidir.
