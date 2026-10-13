# NovaOS / AEC Portfolio Geliştirme Günlüğü (DEVLOG)

## [2026-10-09] - İyileştirme & UX Güncellemeleri

### Yapılanlar
- **IDE & TypeScript Uyarıları Giderildi**:
  - `apps/user-interface/vite.config.ts` dosyasında `defineConfig` importu `'vitest/config'` olarak güncellenerek IDE'deki `test does not exist in UserConfigExport` uyarısı ve kırmızı çizgiler tamamen çözüldü.
  - Kök `tsconfig.json` monorepo proje referansları ile yapılandırıldı; `tsc --noEmit` sıfır hatayla çalışıyor.
- **8 Yönlü Pencere Boyutlandırma (N, S, E, W, NE, NW, SE, SW)**:
  - `WindowFrame.tsx` bileşenine 4 kenar ve 4 köşe için `resize-handle` eklendi.
  - Sol (`W`) ve üst (`N`) kenarlar çekildiğinde koordinat (`x, y`) ve boyut (`width, height`) değişimlerini `minSize` sınırlarını aşmayacak şekilde eşzamanlı hesaplayan matematiksel mantık yazıldı.
- **Pencere Kontrol Butonlarına İkonlar & Tam Ekran İyileştirmesi**:
  - Kapat butonuna `X`, Küçült butonuna `Minus` eklendi.
  - Normal boyutta `Maximize2` ("Ekranı Kapla"), tam ekranda belirgin `Minimize2` ("Normal Boyuta Dön") ikonu gösterildi.
  - Pencere başlık çubuğuna **çift tıklama (double-click)** ile tam ekran / geri alma kısayolu eklendi.
- **Marka & Kimlik Güncellemesi (AEC)**:
  - Fiktif "NovaOS" ismi kaldırılarak gerçek geliştirici kimliği: **AEC** olarak güncellendi.
  - Terminal komut satırı `ahmet@aec:~$` ve karşılama metinleri uyarlandı.
  - Sahte/işlevsiz widget'lar (wifi, şarj simgesi) üst bardan temizlendi; sade, estetik ve işlevsel bir başlık alanı oluşturuldu.
- **Dinamik Açık Uygulamalar Çubuğu (Dock)**:
  - Dock artık tüm statik uygulamaları değil; **yalnızca o an açık olan uygulamaları** listeliyor.
  - Açık pencereler kapatıldığında alt bardan otomatik kaldırılıyor; tıklandığında simge durumuna küçülüp geri açılabiliyor.
## [2026-10-13] - Çekirdek Sistem, Çoklu Dil & UX İyileştirmeleri

### Yapılanlar
- **Kapsam Sadeleştirme & Çekirdek Uygulamalar**:
  - Fiktif/geçici sistem uygulamaları (`system-specs`, `project-sandbox`) temizlendi. Sistem şu an kesin olarak yalnızca iki kararlı çekirdek uygulama içeriyor: `terminal` ve `settings`.
- **Terminal Gelişmiş Kullanıcı Yönetimi (`guest` & `su`)**:
  - Terminal başlangıç varsayılan kullanıcısı `guest` (`guest@aec:~$`) yapıldı.
  - `su <username>` ve `login <username>` komutları eklendi. Hedef kullanıcı isimleri Zod şeması ile (`/^[a-zA-Z0-9_-]+$/`) sıkı doğrulamadan geçirildi.
  - `whoami` komutu ile oturumdaki aktif kullanıcı adı sorgulanabiliyor, `exit` veya `logout` ile tekrar `guest` kullanıcısına dönülebiliyor.
- **7 Dilli Uluslararasılaştırma Sistemi (i18n Engine)**:
  - 7 dil için (İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça, Japonca) eksiksiz yerelleştirme sözlüğü oluşturuldu (`translations.ts`).
  - Tarayıcının sistem dilini (`navigator.language`) otomatik tespit eden ve kullanıcı tercihini `localStorage` üzerinde saklayan `i18n.store.ts` Zustand motoru yazıldı.
  - React 19 Derleyicisi (React Compiler) otomatik memoization davranışı ile tam uyumlu çalışacak reaktif `useTranslation()` React Hook'u geliştirildi.
  - Bağımsız, Spatial Dark Glass estetiğinde **Ayarlar (Settings)** uygulaması geliştirildi; bayrak, yerel isim ve aktif rozetleri ile dil seçimi sunuldu.
- **Pencere Geometrisi & Tam Ekran Çakışma Düzeltmesi**:
  - Üst durum çubuğu kalınlığı 42px'e çıkarıldı (`--statusbar-height: 42px`).
  - Ekranı Kapla (`maximizeWindow`) modunda pencerenin üst barın altına girmesi engellendi; pencere tepe noktası kesin olarak `y: 42px` ve yüksekliği `screenHeight - 42px` olarak sınırlandırıldı.
- **Açık Uygulamalar Çubuğu (Dock) Taşma Düzeltmesi**:
  - Dock simgelerine gelindiğinde (hover) büyüme animasyonunun alt bar çerçevesini taşması ve kırpılması giderildi (`scale(1.12) translateY(-2px)`, dikey boşluklar ve esnek padding uygulandı).
- **Özel Buzlu Cam Kaydırma Çubuğu (Custom Spatial Scrollbar)**:
  - Pencereler küçültüldüğünde ortaya çıkan varsayılan tarayıcı scrollbar'ı kaldırıldı; Spatial Dark Glass temasına tam oturan yarı saydam yuvarlatılmış WebKit ve Firefox (`scrollbar-width: thin; scrollbar-color:...`) kaydırma çubukları oluşturuldu.
- **Çapraz Tarayıcı Desteği (Chromium, Firefox, Safari)**:
  - Safari ve iOS WebKit için `-webkit-backdrop-filter` önekleri eklendi.
  - Pointer events ve standart dışı event'ler için emniyetli fallback'ler yerleştirildi.
- **Node.js Subpath Imports (`#`)**:
  - Native `#` önekli import eşlemeleri (`#components/*`, `#stores/*`, `#styles/*`, `#apps/*`, `#i18n/*`, `#test/*`) `package.json` ve `tsconfig.json` (`rootDir: "."`) yapılandırmasına taşındı.
- **Lucide Deprecation Temizliği**:
  - `lucide-react.d.ts` dosyasındaki deprecated `Github` ikonu kaldırıldı; sadece saf geometrik Lucide ikonları (`Terminal`, `Settings`, `Globe`, `Palette`, `Check`, `X`, `Minus`, `Maximize2`, `Minimize2`) kullanıldı.
- **Kapsamlı İngilizce Kod Açıklamaları**:
  - Tüm kod tabanına temiz JSDoc / TSDoc standartlarında İngilizce açıklama ve dokümantasyon yorumları eklendi.
- **Terminal Dosya Yönetimi (`ls` & `cat`)**:
  - WebOS sanal terminaline `ls` ve `dir` komutları eklendi (`bio.md`, `skills.md`, `contact.md`, `welcome.txt`).
  - `cat` komutu tüm sanal dosyaları ve kısa adlarını (`cat bio`, `cat skills`, `cat contact`, `cat welcome`) okuyacak şekilde genişletildi. Bilinmeyen dosya istendiğinde mevcut dosyalar listelenerek yol gösterici hata mesajı sunuldu.
- **TypeScript Derleme & Vitest İzolasyonu**:
  - `apps/user-interface/tsconfig.json` içinde `"noEmit": true` tanımlandı; `package.json` build betiği `tsc --noEmit && vite build` yapıldı.
  - Vitest test koşucusu için `dist/**` ve `node_modules/**` dizinleri açıkça hariç tutuldu (`exclude`), böylece build sonrası dist içinde oluşan dosyaların test ortamına sızması engellendi.
- **Test ve Kalite Durumu**:
  - 11 test dosyasında 37 birim/entegrasyon testi %100 başarıyla geçti.
  - `npm run typecheck` monorepo genelinde 0 hata ile doğrulandı.
  - `npm run build` 4.5 saniyede temiz üretim paketi oluşturdu.
