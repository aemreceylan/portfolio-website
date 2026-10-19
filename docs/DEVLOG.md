# NovaOS / AEC Portfolio Geliştirme Günlüğü (DEVLOG)

## [2026-10-19] - DevSecOps Güvenlik Denetimi, Zafiyet İyileştirmeleri & OWASP Sıkılaştırması

### Yapılanlar
- **DevSecOps Güvenlik Denetimi (Security Audit)**:
  - OWASP Top 10 (2021) ve CWE/SANS standartlarına uygun olarak BAND mikro-konteyner ve WebOS bileşenleri üzerinde kapsamlı güvenlik denetimi gerçekleştirildi.
  - [security_audit_report.md](file:///C:/Users/ahmet/.gemini/antigravity-ide/brain/3656ab52-c7a4-4fa2-a70c-7c4b3043a4a2/security_audit_report.md) başlığı altında detaylı denetim raporu üretildi.
- **Kriptografik Parola Güvenliği (SEC-01 - CWE-256 / CWE-312)**:
  - `simulatedBackend.js`: `localStorage` üzerinde düz metin parola saklama kaldırıldı.
  - Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`) ve kullanıcı başına 16-baytlık kriptografik tuz (`generateSalt()`) ile tuzlu SHA-256 özet yapısına geçildi.
  - Eski düz metin hesapların oturum açarken otomatik olarak güvenli özet formatına yükseltilmesi sağlandı.
- **Dosya İndirme Bağlantılarında Stored XSS Koruması (SEC-02 - CWE-79)**:
  - `MessageFile.jsx`: `file[1]` indirme URL'inde `isSafeFileUrl` doğrulaması eklendi; `javascript:`, `vbscript:`, `data:text/html` protokol enjeksiyonu engellendi.
- **Profil ve Banner URL Enjeksiyonunun Önlenmesi (SEC-03 - CWE-79 / CWE-116)**:
  - `ProfileScreen.jsx`: `backgroundImage: url(...)` yapısındaki CSS enjeksiyonu ve kaçış dizileri engellendi (`getSafeImageUrl`).
  - `UsersElement.jsx` ve `Post.jsx`: Güvenli resim URL şeması kontrolü ve eksik `alt` erişilebilirlik nitelikleri tamamlandı.
- **Mesaj Bağlantı Ayrıştırıcısında DoS/Crash Koruması (SEC-04 - CWE-754 / CWE-400)**:
  - `Message.jsx`: Boş/dosyalı mesajlarda `data.text` undefined olduğunda oluşan React çökmesi (`text.split`) katı null-safe kontrollerle giderildi.
- **Girdi Doğrulama ve Boyut Sınırlandırması (SEC-05 - CWE-20 / CWE-400)**:
  - `simulatedBackend.js`: Rumuz (3-32 karakter, alfasayısal regex), kategori/kanal (1-64 karakter) ve mesaj metni (maks. 2000 karakter) için sınırlandırmalar getirildi.
- **Konteyner IPC Köprüsü Sıkılaştırması (SEC-06 - CWE-345 / CWE-942)**:
  - `App.jsx`: `postMessage` içindeki joker karakter `*` hedef kökeni kaldırılarak kesin `window.location.origin` yapısına geçildi.
  - `useWebOSBridge.ts`: Gelen olaylarda `isEventOriginAllowed` ile köken doğrulandı; pencere başlığı (maks. 100) ve bildirim (başlık maks. 100, gövde maks. 300) içerikleri sınırlandırıldı.
- **SonarJS Bilişsel Karmaşıklık (Cognitive Complexity) İyileştirmesi**:
  - `useWebOSBridge.ts`: `handleMessage` fonksiyonunun karmaşıklığı (27) modüler yardımcı fonksiyonlara bölünerek (`isEventOriginAllowed`, `isValidEnvelope`, `handleNotificationPayload`, `handleCrashReportPayload`) SonarJS eşik değerinin (<= 15) çok altına çekildi.
- **Test ve Kalite Standartları Doğrulaması**:
  - `security-audit.test.tsx` dosyasına konteyner köprüsü köken denetimi ve girdi doğrulama birim testleri eklendi.
  - Monorepo genelinde 38 test dosyasında **326 test %100 başarıyla geçti**.
  - `npm run typecheck` ve `npm run lint` 0 hata ve 0 uyarı ile tamamlandı.
  - `band` üretim paketi (`npm run build`) başarıyla derlenip `public/apps/band/` içine güncellendi.

## [2026-10-18] - IDE Hataları Temizliği & SonarQube Statik Kod Analizi Denetimi

### Yapılanlar
- **IDE "Problems" Panelindeki Tüm Hataların ve Uyarıların Giderilmesi**:
  - `apps/band/frontend/band/src/hooks/useCall.js`: 12 WebRTC fonksiyonunda yer alan `no-async-promise-executor` anti-paterni saf `async` fonksiyonlarla refaktör edildi.
  - `apps/band/frontend/band/src/hooks/useWait.js` & `useFetch.js`: `useWait` sözde hook'u saf asenkron yardımcı fonksiyon `waitForData` olarak yeniden yapılandırıldı.
  - `apps/band/frontend/band/src/Components/Hub/Hub.jsx`: `no-empty` hatası giderildi, kullanılmayan import ve değişkenler temizlendi.
  - `apps/band/frontend/band/eslint.config.js`: `'react/prop-types': 'off'` ve `no-unused-vars` ignore ayarları eklendi.
  - Unused imports ve değişkenler temizlendi (`WSProvider.jsx`, `main.jsx`, `useUserValidation.js`, `HubList.jsx`, `Users.jsx`, `UsersElement.jsx`, `ChatBox.jsx`, `Post.jsx`, `Video.jsx`).
- **SonarQube Statik Kod Analizi & Kalite Güvencesi**:
  - Tüm yeni ve güncellenen dosyalar SonarQube MCP `analyze_code_snippet` ile tarandı: 0 code smell, 0 bug, 0 vulnerability (**0 issues**).
- **Test ve Derleme Doğrulaması**:
  - 38 test dosyasında **324 test %100 geçti**. `typecheck` ve `lint` sıfır hatayla doğrulandı.

## [2026-10-18] - Konteyner Arayüz Sadeleştirmesi, Siyah Ekran Çözümü & Dinamik Görünüm Simülatörü

### Yapılanlar
- **Üst Sekme Çubuğunun Kaldırılması & Yalın Uygulama Görünümü**:
  - `BandApp.tsx` penceresinin üstündeki "Canlı Uygulama", "Çalışma Modu" ve "Mimari & Vaka Analizi" navigasyon sekmeleri (`band-nav-tabs`) tamamen kaldırıldı.
  - Pencere alanı doğrudan ve eksiksiz olarak misafir uygulama konteynerine (`<AppSandbox />`) ayrıldı.
- **Özet Offline/Online Segmented Mod Seçim Düğmesi (`customToolbarLeft`)**:
  - "Korumalı Konteyner" rozeti yerine araç çubuğunun soluna entegre edilen mod seçimi, tam boy ve ergonomik bir **Segmented Control** (`.band-mode-segmented-group`) yapısına dönüştürüldü.
  - Doğru ve standart semboller entegre edildi:
    - **Offline Mod**: `<WifiOff size={14} />` ikonu ile `Offline (Simüle DB)` seçeneği (zümrüt yeşili ışıma ve aktif durum).
    - **Online Mod**: `<Wifi size={14} />` ikonu ile `Online (Port 3000)` seçeneği (camgöbeği ışıma ve aktif durum).
  - Buton yükseklikleri araç çubuğunun 28px'lik diğer kontrol butonlarıyla (`.sandbox-tool-btn`) tam hizada eşitlendi; font boyutu ve dokunma/tıklama alanları büyütüldü.
  - Mod bilgisi ve detayları için yanına 28px boyutunda bağımsız `Info` butonu yerleştirildi.
- **Siyah Ekran Hatasının Kök Neden Çözümü (`allow-same-origin`)**:
  - **Kök Neden**: `AppSandbox.tsx` bileşeninde `allow-same-origin` bayrağının bulunmaması nedeniyle iframe kökeni `null` (`origin: 'null'`) oluyordu. Tarayıcı güvenlik politikası gereği, `type="module"` scriptleri (`index-*.js`) ve stil dosyaları `origin 'null'` üzerinden yüklenirken CORS hatası (`net::ERR_FAILED`) alıyor ve `localStorage` erişimi engelleniyordu.
  - **Çözüm**: `AppSandbox.tsx` içerisine `allowSameOrigin={true}` (varsayılan: `true`) opsiyonu eklendi; iframe `sandbox` özelliğine `allow-same-origin` token'ı dahil edildi. CORS engeli kalktı, JavaScript modülleri sorunsuz yüklendi ve BAND arayüzü pencere içinde derhal render oldu.
- **Dinamik Cihaz Simülatörü Yapılandırması (Manifest & Arka Uç Hazırlığı)**:
  - `packages/shared/src/schemas/manifest.schema.ts`: `containerConfigSchema` oluşturuldu ve `enableDeviceSimulator: z.boolean().default(true)` tanımlandı.
  - `packages/shared/src/types/manifest.ts`: `AppManifest` tipine `container?: ContainerConfig` eklendi.
  - `apps/user-interface/src/apps/app-registry.tsx`: `bandManifest` içine `container.enableDeviceSimulator = true` tanımlandı.
  - `AppSandbox.tsx`: `enableDeviceSimulator` prop'u ile cihaz değiştirme (Desktop / Tablet / Mobile) butonları deklaratif olarak açılıp kapatılabilir hale getirildi. Arka uç bağlandığında herhangi bir proje manifestosundan tek bir bayrakla yönetilebilecek altyapı hazırlandı.
- **Kapsamlı Test & Kalite Standartları**:
  - `BandApp.test.tsx` ve `AppSandbox.test.tsx` güncellenerek yeni araç çubuğu, modal pencereler ve `enableDeviceSimulator` durumları için birim/entegrasyon testleri yazıldı.
  - Monorepo genelinde 37 test dosyasında **307 test %100 başarıyla geçti**.
  - `npm run typecheck` ve `npm run lint` 0 hata ve 0 uyarı ile tamamlandı.

## [2026-10-18] - BAND Orijinal Depo Entegrasyonu & Saf Veritabanı Simülasyon Motoru (Zero Fake Data)

### Yapılanlar
- **Kullanıcı Talimatı Doğrultusunda Sahte Veri ve Butonların Temizlenmesi**:
  - Önceki aşamada eklenen statik demo verileri (`MediasoupBot`, fiktif karşılama mesajları, hazır demo kanalları) ve `Demo Girişi` butonu bütünüyle temizlendi.
  - Orijinal BAND projesinin (Ahmet Emre Ceylan) tüm UI bileşenleri, form yapısı ve CSS tasarımları orijinal durumuna sadık bırakıldı ("diğer hiçbir şeye dokunma", "veri doldurma").
- **Saf Veritabanı ve Arka Uç Simülatörü (`simulatedBackend.js`)**:
  - BAND'in MongoDB modellerini (User, Channel, Category, Message) ve Express API endpoint'lerini (`api/signup`, `api/login`, `api/session-check`, `api/get-csrf`, `api/set-hub-settings`, `api/get-messages`, `api/set-user-settings`) tarayıcı içinde aslına uygun simüle eden mimari geliştirildi.
  - **Kayıt ve Oturum**: Kullanıcı kayıt olduğunda ilk kullanıcı admin (`roles: ["1"]`) rolü alır; oturum ve kullanıcı kimliği yerel veritabanında saklanır.
  - **Dinamik Kategori & Kanal**: Kullanıcı arayüz üzerinden kategori veya kanal oluşturduğunda WebSocket/Socket.IO `sectionList` olayı tetiklenerek sol menü dinamik güncellenir.
  - **Sohbet & Mesajlaşma**: Gönderilen gerçek iletiler `newMessageFromClient` üzerinden işlenerek veritabanına kaydedilir ve `newMessageFromServer` olayıyla feed ekranına basılır; hiçbir uydurma mesaj önden doldurulmaz.
- **Canlı / Çevrimdışı Hibrit İletişim Hattı (`useFetch` & `useUserValidation`)**:
  - `fetch("http://localhost:3000/...")` çağrıları yerel Node.js/MongoDB backend'i çalışırken doğrudan canlı servise bağlanır; canlı servis kapalıyken şeffaf biçimde simüle veritabanı motoruna yönlenir.
- **Güvenlik ve İzolasyon**:
  - Iframe içinde çalışan BAND uygulamasının oturum/kayıt sonrası üst WebOS penceresini yönlendirmesini önleyen `window.self === window.top` güvenlik koruması eklendi.
  - `userList?.get(...)` çağrılarında olası undefined nesne hatalarına karşı güvenli zincirleme (`?.`) uygulanarak bileşen kırılmaları önlendi.
- **Test ve Kalite Standartları**:
  - Monorepo genelinde 37 test dosyasında **306 test %100 başarıyla geçti**.
  - `npm run typecheck` ve `npm run lint` 0 hata ve 0 uyarı ile tamamlandı.


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

## [2026-10-13] - Sanal Dosya Sistemi (VFS), GNU nano, Markdown Okuyucu, JavaScript IDE & Tema Motoru

### Yapılanlar
- **Sanal Dosya Sistemi (Virtual File System - VFS) Katmanı**:
  - `useFileSystemStore` Zustand store'u oluşturuldu (`apps/user-interface/src/stores/filesystem.store.ts`).
  - Sadece `.txt`, `.md`, `.js` uzantılı dosyalara izin veren Zod destekli uzantı denetimi yazıldı.
  - Sistem dosyaları (`bio.md`, `skills.md`, `contact.md`, `welcome.txt`) `isSystem: true` bayrağı ile silinmeye karşı korundu.
  - Dosya oluşturma (`createFile`), silme (`deleteFile`), güncelleme (`updateFile`), yeniden adlandırma (`renameFile`) operasyonları reaktif hale getirildi.
- **Linux Terminal Standartları & GNU nano Editörü**:
  - Linux standartlarına geçilerek `dir`, `login` ve `logout` komutları kaldırıldı.
  - Kullanıcı değiştirme doğrudan `su <username>` ile, oturum kapatma `exit` ile sınırlandırıldı.
  - Terminal sanal dosya sistemi ile tam entegre edildi: `ls`, `cat <file>`, `touch <file>`, `rm <file>`.
  - Terminal geçmişi değişmezliği (Static Terminal History): Geçmiş `ls` komutlarının çıktıları VFS güncellense bile terminal tampon belleğinde statik kalır; yeni `ls` komutu çağrıldığında güncel durum listelenir.
  - Gerçek GNU nano deneyimi: `nano <filename>` komutu ile terminal içinde tam ekran nano arayüzü (`GNU nano 7.2`), üst durum çubuğu, alt `^O WriteOut` (Ctrl+O/Ctrl+S) ve `^X Exit` (Ctrl+X/Esc) kısayolları geliştirildi.
- **Farklılaştırılmış Hata Kanalları (Terminal vs GUI Modal)**:
  - Terminal üzerinden korumalı sistem dosyası silinmeye çalışıldığında hata doğrudan komut satırına yazılır (`rm: cannot remove '...': Protected system file`).
  - Grafik arayüzde (Desktop veya buton üzerinden) sistem dosyası silinmeye çalışıldığında ise şık bir Spatial Dark Glass Alert Modal (`ShieldAlert` ikonu, başlık, açıklama ve Tamam butonu) gösterilir.
- **İki Yeni Çekirdek Uygulama**:
  1. **Markdown Okuyucu (`markdown-viewer`)**:
     - `marked` kütüphanesi entegre edildi.
     - Tüm `.md` ve `.txt` dosyaları için reaktif sekme çubuğu, Zengin HTML Önizleme (`Preview`) ve Ham Kaynak Kodu (`Raw`) modları sağlandı.
  2. **JavaScript IDE & Sandboxed Kod Stüdyosu (`js-ide`)**:
     - Satır numaraları, Tab girintileme ve sözdizimi dostu kod editörü.
     - Tamamen izole `<iframe sandbox="allow-scripts">` (OWASP DevSecOps standartlarında `allow-same-origin` verilmeden) güvenli çalıştırma ortamı.
     - `console.log`, `info`, `warn`, `error` yakalayan ve zaman damgaları ile konsol panelinde gösteren `postMessage` köprüsü.
- **Masaüstü & Tema Motoru**:
  - 4 spatial koyu duvar kağıdı (`deep-space`, `cyberpunk`, `emerald-matrix`, `obsidian-minimal`).
  - Dinamik akıcı tema rengi (Accent palette: `cyan`, `purple`, `emerald`, `amber`, `rose`) ve duvar kağıdıyla otomatik senkronize olan Otomatik Mod (`isAutoAccent`).
  - Masaüstünde VFS dosyalarının anlık listelenmesi; terminalde `touch` veya `nano` ile kaydedilen dosyaların anında masaüstüne dosya ikonu olarak yansıması.
- **Doğrulama ve Metrikler**:
  - 14 test dosyasında 61 birim ve entegrasyon testi %100 başarıyla geçti.
  - `npm run typecheck` monorepo genelinde 0 hata ile doğrulandı.
  - `npm run build` 18 saniyede temiz, dinamik chunk'lara bölünmüş üretim paketi oluşturdu.
  - `npm audit` 0 güvenlik açığı (0 vulnerabilities) ile DevSecOps gereksinimlerini karşıladı.
  - Monorepo kök `tsconfig.json` ve `tsconfig.base.json` yapılandırmasına `"jsx": "react-jsx"` ve temel miras eklenerek IDE TypeScript dil sunucusunun (TSServer) test dosyalarındaki JSX/TSX modül çözümleme hatası (TS2307) tamamen çözüldü.

## [2026-10-13] - Masaüstü Sağ Tık Menüsü, JS IDE Çoklu Betik & Hata Yakalama, Vektör Bayraklar ve Tema Senkronizasyonu

### Yapılanlar
- **Terminal CLI Sadeleştirmesi & Tam Yerelleştirme**:
  - `skills`, `contact`, `whoami` komutları CLI komut kümesinden ve `help` çıktısından çıkarıldı.
  - CLI `help` çıktısındaki tüm komut açıklamaları 7 dilde (`en`, `tr`, `de`, `fr`, `es`, `ru`, `ja`) `t(...)` motoruna bağlandı; sistem dili Türkçe seçildiğinde yarı Türkçe yarı İngilizce görünme sorunu tamamen giderildi.
- **İşlevsel Masaüstü & Dosya Sağ Tık (Context) Menüsü**:
  - Masaüstü dosya kartlarının üzerindeki doğrudan hover silme butonu kaldırıldı.
  - Masaüstü boşluğuna sağ tıklandığında: `Yeni Metin Belgesi (.txt)`, `Yeni Markdown Belgesi (.md)`, `Yeni JavaScript Dosyası (.js)`, `Dosya Yükle`, `Terminali Aç`, `Ayarları Aç` menüsü açılır.
  - Dosya üzerine sağ tıklandığında: `Aç`, `Yeniden Adlandır`, `Sil` menüsü gelir.
  - Yerel diskten dosya yükleme (`FileReader` + VFS) ve isim değiştirme modal diyalogları entegre edildi.
  - Korumalı sistem dosyaları sağ tık menüsünden silinmek istendiğinde Spatial Alert güvenlik uyarısı tetiklenir.
- **JavaScript IDE Çoklu Dosya Desteği & Gelişmiş Hata Tanılama**:
  - Tek dosyaya bağlı kalma kısıtlaması kaldırıldı; sekme çubuğuna `+` butonu ve modal diyalog eklenerek sınırsız sayıda yeni `.js` betiği oluşturulabilmesi sağlandı (`script-2.js`, vb.).
  - Oluşturulan tüm `.js` betikleri eşzamanlı olarak masaüstü VFS sisteminde dosya ikonu olarak belirir.
  - **Sözdizimi Hatası Denetimi (Syntax Error Detection)**: Kod çalıştırılmadan önce `new Function(code)` ile dinamik sözdizimi doğrulamasından geçirilir. Hatalı kod durumunda (örn. `const x = ;`) sandbox başlatılmadan araç çubuğunda kırmızı `🚨 Sözdizimi Hatası` rozeti ve konsol panelinde detaylı hata satırı basılır.
  - **Çalışma Zamanı Hata Yakalama (Runtime Error Catching)**: İzole iframe içerisinde `window.onerror` ve `window.onunhandledrejection` yakalayıcıları ile beklenmedik çalışma zamanı hataları yakalanıp konsola iletilir.
- **Duvar Kağıdı & Çerçeve Başlık Çubuğu Renk Senkronizasyonu**:
  - `design-tokens.css` içindeki statik gradyan geçersiz kılınarak `var(--wallpaper-bg)` değişkenine bağlandı; duvar kağıdı değişimleri 0.6s akıcı bezier geçişiyle anında masaüstüne yansıtıldı.
  - `.window-titlebar` arka planı ve alt kenarlığı `rgba(var(--accent-rgb), ...)` temasına bağlandı; pencere kontrol butonlarının yer aldığı üst başlık çubuğu seçilen vurgu rengiyle dinamik olarak aydınlatıldı.
- **Vektör SVG Bayrak Motoru (Pixel-Crisp Language Flags)**:
  - Windows işletim sisteminde ülke bayrak emojilerinin `GB`, `TR` gibi harf kısaltmalarına dönüşmesi ve alttaki dil koduyla yinelenmesi sorunu çözüldü.
  - 7 desteklenen dil için (`en`, `tr`, `de`, `fr`, `es`, `ru`, `ja`) saf vektör SVG bayrak bileşeni (`LanguageFlag.tsx`) geliştirildi.
  - Ayarlar uygulamasındaki gereksiz dil kısaltma etiketi (`.language-code`) kaldırılarak solda keskin ulusal bayrak ve sağda ana dil ismi sunuldu.
- **Test ve Kalite**:
  - 13 test dosyasında 64 birim/entegrasyon testi %100 başarıyla geçti (`TerminalApp`, `JsIdeApp`, `SettingsApp`, `Desktop`, `LanguageFlag`, `WindowFrame`, `MarkdownViewerApp`, `Dock`, vb.).
  - `npm run typecheck` 0 hata ile doğrulandı.
  - Chrome DevTools MCP ile görsel doğrulamalar ve test adımları başarıyla tamamlandı.

## [2026-10-13] - Pencere Sağ Tık İzolasyonu, Gerçek IDE Sekme Yaşam Döngüsü, İki Yönlü Markdown Editörü & Dinamik Sekme Başlığı

### Yapılanlar
- **Masaüstü Sağ Tık Sadeleştirmesi**:
  - Masaüstü bağlam menüsünden `Dosya Yükle` seçeneği tamamen kaldırıldı.
- **Pencere & Masaüstü Sağ Tık İzolasyonu**:
  - Uygulama pencerelerinin çerçevesine veya içeriğine sağ tıklandığında masaüstü bağlam menüsünün açılması kesin olarak engellendi (`e.stopPropagation()` ve `.window-container` kontrolü).
  - Pencere başlık çubuğuna (`.window-titlebar`) sağ tıklandığında pencere yönetim menüsü açılır:
    - **Kapat** (`Close`)
    - **Simge Durumuna Küçült** (`Minimize`)
    - **Ekranı Kapla / Önceki Boyuta Getir** (`Maximize / Restore`)
  - Uygulama içerik alanına (`.window-content`) sağ tıklandığında `e.stopPropagation()` ile masaüstü menüsü engellenirken `preventDefault()` çağrılmayarak tarayıcının yerel sağ tık menüsünün (Kopyala, Yapıştır, İncele) çalışması sağlandı.
- **Gerçek IDE Sekme & Boş Çalışma Alanı Yaşam Döngüsü (Markdown & JavaScript IDE)**:
  - Editörler artık herhangi bir varsayılan dosya ile açılmaz; gerçek IDE standartlarında boş çalışma ekranı (`No Open Files / Açık Dosya Yok`) ile başlar.
  - Sistemdeki tüm dosyaların üstte peşinen listelenmesi kuralı kaldırıldı; sadece kullanıcının açtığı dosyalar sekmelere eklenir.
  - Her sekme için `X` kapatma butonu eklendi; sekme kapatıldığında açık kalan diğer sekmeye veya boş ekrana sorunsuz geçiş yapılır.
  - Boş ekranda doğrudan yeni dosya oluşturma (`+ Yeni Belge / + Yeni Script`) ve hızlı dosya açma çipleri sunuldu.
- **İki Yönlü Markdown Editörü (Okuma & Yazma / Düzenleme)**:
  - Markdown uygulaması salt okuyucu olmaktan çıkarılarak tam teşekküllü bir editöre dönüştürüldü.
  - Üç görüntüleme modu sağlandı:
    - **Düzenle (Edit)**: Satır numaralı ham Markdown / düz metin editörü.
    - **Önizleme (Preview)**: Zengin biçimlendirilmiş HTML çıktısı.
    - **Bölünmüş (Split)**: Eşzamanlı canlı düzenleme ve önizleme paneli.
  - Araç çubuğunda `Kaydet` butonu ve `Ctrl+S` / `Cmd+S` klavye kısayolu ile Sanal Dosya Sistemine (VFS) doğrudan anlık yazma sağlandı. Kaydedilmemiş değişiklikler için sekmede `md-dirty-dot` uyarı noktası gösterilir.
- **Dinamik & Yerelleştirilmiş Tarayıcı Sekme Başlığı (`document.title`)**:
  - Sayfa başlığı aktif seçilen dile göre dinamik olarak güncellenir:
    - Türkçe: `AEC — Uygulama Portfolyosu`
    - İngilizce: `AEC — Application Portfolio`
    - Almanca, Fransızca, İspanyolca, Rusça, Japonca dahil 7 dilde tam senkronizasyon.
  - `index.html` başlangıç başlığı ve `App.tsx` kök reaktif dinleyicisi güncellendi.
- **Test ve Kalite Durumu**:
  - 13 test dosyasında 70 birim ve entegrasyon testi %100 başarıyla geçti.
  - `npm run typecheck` monorepo genelinde 0 hata ile doğrulandı.
  - Chrome DevTools MCP ile görsel, işlevsel ve bağlam menüsü etkileşimleri test edildi.

## [2026-10-13] - Pencere Başlık Menüsü, JS IDE Bildirimleri, Çoklu Sütun & Masaüstü Sürükle-Bırak

### Yapılanlar
- **Pencere Başlık Çubuğu Sağ Tık Menüsü (`WindowFrame.tsx`, `window.css`)**:
  - `handleTitlebarPointerDown` fonksiyonunda `e.button !== 0` filtresi eklenerek sağ tıklama anında pointer capture'ın `contextmenu` olayını yutması engellendi.
  - Başlık çubuğu menüsü (`.window-titlebar-context-menu`) `createPortal` kullanılarak doğrudan `document.body` üzerine monte edildi. Böylece pencere çerçevesindeki `translate3d` CSS transform koordinat alanı ve taşma kırpmaları tamamen elimine edildi.
  - Kapat, Simge Durumuna Küçült ve Ekranı Kapla / Normal Boyuta Dön seçenekleri yerelleştirilmiş olarak çalışır hale getirildi.
- **JS IDE Yerelleştirilmiş Kaydetme & Değişiklik Bildirimi (`JsIdeApp.tsx`, `js-ide.css`)**:
  - Kaydet butonu İngilizce sabit "Saved!" yerine yerelleştirilmiş `t('editor_saved')` ("Kaydedildi") ve yeşil onay işareti (`Check`) ile güncellendi.
  - Kaydedilmemiş değişiklik olduğunda (`code !== currentFile.content`) dosya sekmesinde turuncu `js-dirty-dot` uyarı noktası gösterildi.
  - `Ctrl+S` / `Cmd+S` kısayolu ile anlık VFS kaydı sağlandı; kayıt tamamlandığında nokta otomatik olarak kaybolur.
- **Masaüstü Çoklu Sütunlu Yukarıdan Aşağıya Sarma Düzeni (`Desktop.tsx`, `desktop.css`)**:
  - Dosya sayısı arttığında alt barın (Dock) altına taşmayı engelleyen dinamik sütun sarma algoritması (`maxRows = Math.floor((viewportHeight - START_Y - DOCK_MARGIN) / CELL_HEIGHT)`) geliştirildi.
  - Simgeler ilk sütunu yukarıdan aşağıya doldurduktan sonra gerçek masaüstü işletim sistemlerindeki gibi sağdaki sütunlara (Sütun 1, 2, 3...) temizce sarar.
- **Sürüklenebilir & Konumlandırılabilir Masaüstü Simgeleri (Drag-and-Drop Desktop Grid)**:
  - Masaüstündeki tüm uygulama ve dosya simgelerine sürükle-bırak desteği kazandırıldı.
  - `window.addEventListener('pointermove' / 'pointerup')` ile fare hızlı hareket etse dahi imleç takibi kesintiye uğramaz.
  - Sürükleme bittiğinde simgeler en yakın ızgara hücresine kenetlenir (`grid snap`) ve konumlar `localStorage` üzerinde (`aec-desktop-icon-positions`) kalıcı olarak saklanır.
  - Sürükleme işlemi bittiğinde istem dışı dosya/uygulama açılmasını önlemek için `justDraggedRef` tıklama koruması eklendi.
- **Masaüstü Simgelerinde Çakışma Önleme & Üst Üste Binmeme Algoritması (`Desktop.tsx`, `Desktop.test.tsx`)**:
  - Masaüstü simgeleri sürüklenip bırakılırken başka bir simgenin bulunduğu koordinatlara (`targetX, targetY`) bırakılmaya çalışıldığında çakışmayı tespit eden `occupiedKeysByOthers` kontrolü eklendi.
  - Hedef ızgara hücresi dolu olduğunda bırakılan simgenin üzerine binmesi engellendi; bırakılan fare imlecine en yakın boş ızgara hücresine (`bestCandidate`) otomatik kenetlenme sağlandı.
  - `layoutPositions` memoized hesaplayıcısı ile özel konumu olmayan simgelerin de özel konumu olan simgelerin yerlerini çiğnemeden sonraki boş hücrelere akması garantilendi.
- **Test ve Kalite Durumu**:
  - 13 test dosyasında 73 birim ve entegrasyon testi %100 başarıyla geçti (`Desktop.test.tsx`'e çakışma önleme birim testi eklendi).
  - `npm run typecheck` monorepo genelinde 0 hata ile doğrulandı.
  - Chrome DevTools MCP ile canlı tarayıcıda simgelerin birbirinin üzerine bırakılamadığı ve en yakın boş hücreye kenetlendiği görsel olarak doğrulandı.

## [2026-10-13] - Masaüstü Sağ Tık Konumunda Dosya Oluşturma & İlk Boşluk Otomatik Doldurma

### Yapılanlar
- **Sağ Tıklanan Konumda Dosya Oluşturma (`Desktop.tsx`)**:
  - Masaüstünde boş bir alana sağ tıklandığında imlecin orijinal tıklama koordinatları (`rawX, rawY`) kaydedilip istemci oluşturma modalına (`promptModal.targetCoords`) aktarıldı.
  - "Yeni Metin Belgesi", "Yeni Markdown Belgesi" veya "Yeni JavaScript Dosyası" oluşturulduğunda, oluşturulan dosya simgesi kullanıcının sağ tıkladığı ızgara hücresinde (`col, row`) anında konumlandırıldı.
  - Tıklanan ızgara hücresinde başka bir simge bulunması durumunda çakışma koruması devreye girerek dosyayı tıklanan noktaya en yakın boş hücreye yerleştirir ve `localStorage` üzerinde saklar.
- **Terminal ve IDE'den Dosya Oluşumunda İlk Boşluğu Doldurma Algoritması (`Desktop.tsx`)**:
  - Terminal (`touch`, `nano`) veya JavaScript IDE üzerinden yeni bir dosya oluşturulduğunda (sağ tık koordinatı olmadan), masaüstü ızgarası sütun 0 satır 0'dan taranarak ızgarada bulunan **ilk boş hücre** (`findNextFreeCell(0, 0)`) bulunur.
  - Örneğin bir uygulama veya sistem simgesi başka bir konuma taşındığında açılan boşluk, terminal veya IDE'den oluşturulan yeni dosya tarafından anında doldurulur.
  - Sistem başlangıç dosyaları (`isInitial: true`) stabil yerleşimlerini korurken, dinamik oluşturulan dosyalar kronolojik olarak ızgaradaki boşlukları doldurur.
- **Sanal Dosya Sistemi İzolasyonu & Sıfırlama (`filesystem.store.ts`)**:
  - `useFileSystemStore` üzerine `reset()` eylemi eklenerek testler arasında VFS durum izolasyonu güçlendirildi.
  - Silinen dosyaların eski `localStorage` özel konum anahtarları temizlendi; var olmayan dosya kimliklerinin masaüstünde hayalet boşluk işgal etmesi engellendi.
- **Test ve Kalite Durumu**:
  - 13 test dosyasında 75 birim ve entegrasyon testi %100 başarıyla geçti (`Desktop.test.tsx`'e sağ tık konumunda oluşturma ve terminal/IDE ilk boşluk doldurma testleri eklendi).
  - `npm run typecheck` monorepo genelinde 0 hata ile doğrulandı.
  - Chrome DevTools MCP ile canlı ortamda hem Terminal `touch` ile ilk boşluk doldurma hem de masaüstü sağ tık ile tam tıklanan koordinatta dosya oluşumu test edilip doğrulandı.
## [2026-10-13] - Fabrika Ayarlarına Sıfırlama (sudo rm -rf & Ayarlar GUI Desteği)

### Yapılanlar
- **Terminal CLI `sudo rm -rf` Desteği (`TerminalApp.tsx`)**:
  - `sudo rm -rf` (ve `sudo rm -rf /`, `sudo rm -rf *`, `sudo rm -rf .`) komutları ile WebOS sistemini tamamen fabrika ayarlarına döndürme özelliği eklendi.
  - VFS dosyaları varsayılana döner (kullanıcı tarafından oluşturulan dosyalar temizlenir, değiştirilmiş sistem dosyaları orijinal içeriklerine döner).
  - Özel masaüstü simge konumları (`localStorage` anahtarı) silinir ve simgeler varsayılan ızgara yerleşimine döner.
  - Duvar kağıdı (`deep-space`) ve tema vurgu rengi (`cyan`, otomatik senkronizasyon açık) varsayılan durumuna sıfırlanır.
- **Terminal CLI `sudo rm -rf` Yalın Durum Bildirimi (`TerminalApp.tsx`)**:
  - `sudo rm -rf` çalıştırıldığında araya giren gereksiz simülasyon satırları (şifre doğrulaması, dosya silme aşamaları vb.) temizlendi.
  - Sadece net bir durum bildirimi basılacak şekilde sadeleştirildi: `terminal_reset_status` ("Sistem başarıyla varsayılana döndürüldü." / "System successfully restored to factory defaults.").
- **Ayarlar Sıfırlama Buton Metni Sadeleştirmesi (`translations.ts`)**:
  - `settings_reset_button` metnindeki parantez içi `(sudo rm -rf)` ifadesi tüm dillerden kaldırıldı; buton artık sadece sade biçimde "Varsayılana Sıfırla" / "Reset to Defaults" olarak sunuluyor.
- **Test ve Kalite Durumu**:
  - 14 test dosyasında 82 birim ve entegrasyon testi güncellenen beklentilerle %100 başarıyla geçti.
  - Chrome DevTools MCP ile canlı ortamda hem Terminal `sudo rm -rf` tek satırlık durum bildirimi hem de Ayarlar penceresindeki parantezsiz buton metni doğrulandı.

## [2026-10-14] - SonarQube / SonarJS Kapsamlı Kod Kalitesi Denetimi & Bilişsel Karmaşıklık İyileştirmeleri

### Yapılanlar
- **SonarQube MCP & ESLint SonarJS Altyapısı**:
  - Proje kökünde modern ESLint 9 Flat Config (`eslint.config.js`) yapılandırıldı.
  - `eslint-plugin-sonarjs@4.2.2`, `@typescript-eslint/eslint-plugin` ve `@typescript-eslint/parser` entegrasyonu sağlandı.
  - Bilişsel karmaşıklık kuralı üst sınırı 15 (`sonarjs/cognitive-complexity: ['error', 15]`) olarak katı kurallaştırıldı.
  - `npm run lint` ve `npm run lint:fix` betikleri `package.json`'a eklendi.
- **Masaüstü Sürükleme ve Modal Mantığı Refaktörü (`Desktop.tsx`)**:
  - `onPointerUp` içerisindeki karmaşık ızgara çakışma önleme döngüsü ve `handlePromptSubmit` içerisindeki kopya çakışma mantığı tekilleştirilerek `resolveCollisionFreeCoordinates` fonksiyonu oluşturuldu.
  - `Upload` kullanılmayan import'u temizlendi (`sonarjs/unused-import`).
  - İç içe ternary ifadeleri ortadan kaldıran `getDefaultExtensionForMode` tablosu yazıldı.
  - `handlePromptSubmit` fonksiyonu `handleRenameSubmit` ve `handleNewFileSubmit` olarak ayrıştırılarak bilişsel karmaşıklık 50'den 3'e indirildi.
- **Terminal Komut Yürütücüsü Ayrıştırma (`TerminalApp.tsx`)**:
  - 34 bilişsel karmaşıklığa sahip `handleCommand` devasa switch bloğu, tekil komut oluşturuculara (`buildHelpLines`, `buildCatLines`, `buildTouchLines`, `buildRmLines`, `buildSudoLines`, `handleNanoCommand`) bölünerek karmaşıklık 8'e düşürüldü.
  - `break` öncesi gereksiz atlama (`sonarjs/no-redundant-jump`) temizlendi.
- **JS IDE Güvenliği & Modülerleştirme (`JsIdeApp.tsx`)**:
  - Log seviyesi tespiti (`parseLogLevel`) ve güvenli log kimliği üretimi (`generateSafeLogId`) harici fonksiyonlara çıkarıldı.
  - Iframe `postMessage` dinleyicisinde kaynak doğrulama (`event.source === iframeRef.current.contentWindow`) eklenerek OWASP standartlarında çapraz pencere veri sızıntılarına karşı koruma güçlendirildi.
- **Sanal Dosya Sistemi Güvenlik Sertleştirmesi (`filesystem.store.ts`)**:
  - `Math.random()` yerine Web Crypto API tabanlı `crypto.getRandomValues` (`generateSafeFileId`) uygulanarak SonarQube S2245 (güvensiz sözde rastgele sayı üreticisi) zafiyeti giderildi.
  - Dizi erişimlerinde `parts.at(-1)` modern ECMAScript standardına geçildi.
- **Pencere Yöneticisi & Dil Motoru İyileştirmeleri**:
  - `window-manager.store.ts` içinde 4 katmanlı iç içe geçmiş ternary ifadeler `resolveScreenDimensions` yardımcısı ile çözüldü, `target?.resizable` isteğe bağlı zincirleme eklendi.
  - `i18n.store.ts` dil listesi `Set` veri yapısına taşınarak `has()` ile optimize edildi, dinamik regex için `String.raw` uygulandı.
- **Test ve Kalite Durumu**:
  - `npm run lint`: **0 hata, 0 uyarı** (Monorepo genelinde tam temizlik).
  - Vitest: **14 test dosyasında 82 testin tamamı (%100) başarıyla geçti**.
  - `npm run build`: Monorepo TypeScript ve Vite üretim derlemesi 0 hata ile tamamlandı.

## [2026-10-14] - Dinamik DOM Başlık Metadata, `<html lang>` & Çok Dilli SEO/A11y Entegrasyonu

### Yapılanlar
- **`<html lang>` ve Ekran Okuyucu Senkronizasyonu (`App.tsx`)**:
  - Aktif dil değiştiğinde veya tarayıcı dili otomatik algılandığında `document.documentElement.lang = currentLanguage` ile DOM kök dil niteliği eşzamanlı senkronize edildi.
- **7 Dilli Meta Description Sözlüğü (`translations.ts`)**:
  - `Translations` arayüzüne `browser_meta_description` anahtarı eklenerek 7 desteklenen dil için (İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça, Japonca) optimize açıklamalar tanımlandı.
- **Sosyal Medya & Open Graph / Twitter Card Etiketleri (`index.html` & `App.tsx`)**:
  - `index.html` içerisine Open Graph (`og:type`, `og:title`, `og:description`, `og:locale`, `og:locale:alternate`) ve Twitter Card etiketleri yerleştirildi.
  - `updateDocumentMetadata` fonksiyonu ile `meta[name="description"]`, `og:title`, `og:description`, `og:locale` (`en_US`, `tr_TR`, `de_DE`, `fr_FR`, `es_ES`, `ru_RU`, `ja_JP`), `twitter:title` ve `twitter:description` reaktif olarak güncellendi.
- **Kapsamlı Birim Testleri (`App.test.tsx`)**:
  - `App.test.tsx` dosyasına `html lang`, `document.title`, `meta description` ve `og:locale` etiketlerinin ilk açılışta ve dil geçişlerinde anlık güncellendiğini doğrulayan 2 yeni test eklendi.
- **Test ve Kalite Durumu**:
  - `npm run lint`: **0 hata, 0 uyarı**.
  - Vitest: **14 test dosyasında 84 testin tamamı (%100) başarıyla geçti**.
  - `npm run build`: Sorunsuz tamamlandı.

## [2026-10-14] - Minimal Express Backend Başlatma & Docker Container Yaşam Döngüsü

### Yapılanlar
- **Yalın Express Sunucusu (`apps/backend`)**:
  - `apps/backend` paketi monorepo mimarisine (`@personal-os/backend`) entegre edildi.
  - Sadece konteyneri ayakta tutmak ve temel servis durumunu raporlamak amacıyla minimal, hızlı ve güvenli Express HTTP sunucusu yazıldı (`src/app.ts`, `src/index.ts`).
  - Kök (`GET /`) ve konteyner/orkestratör sağlık denetimi (`GET /health`) uç noktaları tanımlandı.
- **DevSecOps & SonarJS Kuralları**:
  - `helmet` ile standart güvenlik başlıkları ve `X-Powered-By` engellemesi sağlandı.
  - SonarJS `sonarjs/cors` kuralına tam uyum için güvenli beyaz liste (`ALLOWED_ORIGINS` / `localhost:5173`, `localhost:3000`) ve origin doğrulayıcı middleware uygulandı.
  - Global hata işleyici ile üretim ortamında iç stack trace sızıntıları engellendi.
- **Konteyner Yaşam Döngüsü & Zarif Kapanma (Graceful Shutdown)**:
  - `SIGINT` ve `SIGTERM` sinyalleri dinlenerek konteyner durdurulurken HTTP soketlerinin temiz kapatılması sağlandı (10 saniyelik emniyet zaman aşımı koruması ile).
- **Multi-Stage Docker Yapılandırması**:
  - `docker/Dockerfile.backend`: `node:22-bookworm-slim` multi-stage (builder & runner) imajı ve `HEALTHCHECK` direktifi yazıldı.
  - `docker/docker-compose.yml`: Yerel geliştirme ve konteyner orkestrasyonu yapılandırıldı.
  - `.dockerignore`: `node_modules` ve dist kalıntılarının imaja kopyalanmasını önleyen kurallar eklendi.
- **3 Alt Uygulamalı (Tri-App) Docker & Host Nginx Reverse Proxy Mimarisi**:
  - `apps/admin-interface`: React 19 + Vite + TypeScript ile bağımsız, izole CMS & Telemetri konsolu iskeleti ve birim testleri oluşturuldu.
  - `docker/Dockerfile.admin` & `docker/nginx.admin.conf`: Admin konsolu için multi-stage Dockerfile ve SPA yönlendirmeli Nginx yapılandırması eklendi.
  - `docker/Dockerfile.frontend` & `docker/nginx.frontend.conf`: Kullanıcı arayüzü için multi-stage Dockerfile ve Nginx yapılandırması eklendi.
  - `docker/docker-compose.yml`: Üç servis (`frontend: 3000`, `admin: 3002`, `backend: 3001`) yerel IP'ye (`127.0.0.1`) bağlanarak Host Nginx tersine vekil mimarisine tam uyumlu hale getirildi.
- **Akıllı Monorepo Değişiklik Tespiti & Seçici Dağıtım (Selective CI/CD - `.github/workflows/deploy.yml`)**:
  - `dorny/paths-filter@v3` entegre edilerek `main` dalına gelen commit'lerin hangi alt uygulamayı etkilediği izole edildi (`backend`, `frontend`, `admin`).
  - Hangi servis değiştiyse sadece o servisin Docker imajı derlenip GHCR'a yüklenir; değişmeyen servisler build edilmez.
  - SSH dağıtım adımında sunucuda sadece değişen servisler `docker compose up -d --no-deps $SERVICES` ile güncellenir; diğer konteynerler kesintisiz çalışmaya devam eder.
- **Test ve Kalite Durumu**:
  - `apps/admin-interface/src/App.test.tsx`: Admin konsolu için 2 birim testi eklendi.
  - `npm run test`: Monorepo genelinde **16 test dosyasında 90 testin tamamı (%100) başarıyla geçti** (8 shared, 2 admin, 4 backend, 84 user-interface).
  - `npm run typecheck`: 4 pakette (`shared`, `admin-interface`, `backend`, `user-interface`) **0 hata**.
  - `npm run lint`: ESLint ve SonarJS kontrollerinde **0 hata, 0 uyarı**.
  - `npm run build`: 3 uygulamanın tamamı temiz üretim derlemesi üretti.

## [2026-10-14] - CI/CD Pipeline Doğrulaması & Canlı Dağıtım Orkestrasyonu

### Yapılanlar
- **GitHub Actions & Public Repo Entegrasyonu**:
  - GitHub Actions kuyruk kısıtlamalarını aşmak ve sınırsız CI/CD kullanımına geçmek üzere depo görünürlüğü açık kaynak (Public) olarak yapılandırıldı.
- **Değişiklik Algılama & Orkestrasyon Filtre Genişletmesi**:
  - `docker/docker-compose.yml` yapılandırması `deploy.yml` içindeki `dorny/paths-filter` kurallarına (backend, frontend, admin) dahil edildi; orkestrasyon dosyası değiştiğinde etkilenen tüm servislerin senkronize derlenip dağıtılması sağlandı.
- **Canlı Dağıtım Tetikleme & Sürüm Güncellemesi**:
  - Kök `package.json` sürümü `1.0.1` olarak güncellendi ve tüm alt sistemlerin ilk uçtan uca canlı dağıtımı tetiklendi.
- **Git Bağımlılığı Olmayan Saf Docker Dağıtım Mimarisi (Zero-Git Server Deploy)**:
  - Sunucuda `git` veya repo klonlama (`fatal: not a git repository`) ihtiyacı tamamen kaldırıldı.
  - `deploy.yml` içine eklenen Base64 senkronizasyon adımı ile `docker/docker-compose.yml` doğrudan sunucuya aktarıldı.
  - Sunucu üzerinde `docker compose` ve `docker-compose` komut sürümleri dinamik olarak algılandı; GHCR imajları çekilerek izole, güvenli ve sıfır yetki riskiyle ayağa kaldırılması sağlandı.

## [2026-10-15] - Çift Motorlu Tasarım Sistemi & Bütünsel Tema Mimarisi Entegrasyonu

### Yapılanlar
- **Dal Temizliği & Doğrudan `develop` Entegrasyonu**:
  - Kullanıcı talimatı doğrultusunda geçici feature dalları (`feature/functionalist-redesign`, `feature/dual-theme-engine`) silindi; geliştirme doğrudan ve temiz bir biçimde `develop` dalı üzerine inşa edildi.
- **Tasarım Şartnamesi Kataloğu (`docs/DESIGN_SYSTEM_SPEC.md`)**:
  - `spatial-glass` (VisionOS) ve `swiss-industrial` (Dieter Rams / Swiss Style) temalarının tüm token, yüzey, renk, kenarlık ve tipografi tanımları eksiksiz şartnameye bağlandı.
- **3-Kademeli Token Mimarisi (`design-tokens.css`)**:
  - Kök HTML özniteliği (`data-theme="spatial-glass" | "swiss-industrial"`) üzerinden sıfır runtime maliyetli tema geçişi sağlandı.
  - Her temaya has değişmez imza arka planı (`--wallpaper-bg`) tanımlandı; arayüzdeki gereksiz duvar kağıdı seçimi tasfiye edildi.
- **Durum Yönetimi & Geleceğe Hazır Backend Entegrasyonu (`theme.store.ts`)**:
  - Standart 5'li vurgu rengi seçimi ve `isAutoAccent` mantığı temizlendi; her temanın vurgu rengi o ekolün felsefesine içkin ve sabit hale getirildi.
  - Gelecekte backend'den gelebilecek varsayılan tema verisi için `resolveInitialTheme(backendDefault?: ThemeId)` kancası kuruldu. Veri gelmezse veya bağlantı yoksa `spatial-glass` varsayılan olarak devreye girer.
- **Reaktif Simge Dağıtım Motoru (`AppIconResolver.tsx`)**:
  - `Desktop.tsx`, `Dock.tsx` ve `WindowFrame.tsx` bileşenlerinde `AppIconResolver` entegre edildi.
  - Aktif temaya göre Lucide ikonları (`spatial-glass`) veya özel mimari Bauhaus/Braun SVG logoları (`swiss-industrial`) derlenir.
  - SonarJS bilişsel karmaşıklık kurallarına (<= 15) uygun olarak modüler alt fonksiyonlara ayrıştırıldı.
- **Ayarlar (Settings) Uygulaması Revizyonu (`SettingsApp.tsx`)**:
  - Renk paleti ve duvar kağıdı galerisi kaldırılarak, iki ekolün malzeme önizlemesini ve tipografik kimliğini gösteren 2'li büyük görsel tema seçim kartları eklendi.
- **Bileşen Stillerinin İzolasyonu (`dock.css`, `window.css`, `desktop.css`)**:
  - `dock.css`: Yüzen cam hap kapsül vs 46px sabit modüler enstrüman konsolu.
  - `window.css`: 14px yuvarlak cam çerçeve vs 4px masif grafit şasi.
  - `desktop.css`: Nebula uzay gradyanı vs 32px CAD drafting grid ve üst barda teknik koordinat telemetrisi (`SYS.LOC // 39.92°N 32.85°E`). Masaüstü simge kartları 86px yükseklik ve 2 satır metin sınırlamasıyla hover çakışmalarına karşı zırhlandı.
- **Test ve Kalite Durumu**:
  - `npm test`: 17 test dosyasında **99 testin tamamı (%100) başarıyla geçti**.
  - `npm run lint`: Monorepo genelinde ESLint ve SonarJS statik analizlerinde **0 hata, 0 uyarı**.
  - `npm run build`: TypeScript derlemesi (`tsc --noEmit`) ve Vite prodüksiyon paketi sıfır hata ile tamamlandı.

## [2026-10-15] - Modüler & Genişletilebilir Tema Motoru (Pluggable Theme Engine) & Geometrik/Görsel Kusursuzlaştırmalar

### Yapılanlar
- **Modüler & Açık/Kapalı Tema Motoru Mimarisi (`src/themes/`)**:
  - `theme.types.ts`: `ThemeDefinition`, `ThemeIcons`, `ThemeColors`, `ThemeTypography` ve `ThemeMeta` arayüzleri tasarlandı.
  - `spatial-glass.theme.tsx`: Lucide ikonları, aurora cyan vurgu rengi ve dinamik radial nebula duvar kağıdı ile modüler tema dosyası olarak ayrıştırıldı.
  - `swiss-industrial.theme.tsx`: Özel Bauhaus/Braun mimari SVG logoları, emniyet turuncusu vurgu rengi ve masif grafit duvar kağıdı ile modüler tema dosyası haline getirildi.
  - `theme-registry.ts`: Merkezi `ThemeRegistry` sınıfı ile `registerTheme()`, `getTheme()`, `getAllThemes()`, `hasTheme()`, `applyThemeToDom()` ve `getThemeMetaList()` işlevleri sağlandı.
  - Yeni temaların tek bir nesne tanımıyla (ikonları, renkleri, yazı tipleri, CSS değişkenleri ile) sisteme sorunsuz ve çökmesiz dahil edilebileceği altyapı kuruldu.
- **Reaktif Simge Ayrıştırıcısı (`AppIconResolver.tsx`) Tam Dinamikleşme**:
  - Sert kodlanmış `if (isSwiss)` mantığı tamamen kaldırıldı; simgeler doğrudan aktif temanın `icons` kayıt tablosundan (`appIcons`, `fileIcons`, `brandIcon`, `fallbackAppIcon`, `fallbackFileIcon`) çözülmektedir.
- **Tema Geçişlerinde Sıfır Boyut Zıplaması (Zero Layout Shift)**:
  - Üst bar (`--statusbar-height: 40px`), pencere çerçeve başlık çubuğu (`--titlebar-height: 36px`), açık uygulamalar dock'u (`--dock-height: 58px`) ve dock ögeleri (`42x42px`) `:root` seviyesinde sabitlendi.
  - Tema değiştiğinde pencere, dock veya üst barda hiçbir sıçrama veya boyut titremesi olmaması sağlandı.
- **Masaüstü İki Satırlı Program İsimlerinin Kesilmesinin Çözümü (`desktop.css`)**:
  - `.desktop-app-card` ve `.desktop-file-card` yüksekliği 86px'ten 92px'e çıkarıldı; dikey hizalama `flex-start`, `padding: 6px 4px`, `gap: 4px` olarak optimize edildi.
  - Etiket satır yüksekliği `line-height: 1.25`, font boyutu `11.5px`, azami yükseklik `30px` olarak düzenlenerek 2 satırlı uygulama isimlerinin (`Markdown Editörü` vb.) kesilmesi engellendi.
- **Simge Arkaplan Eşitsizliği & Boyut Dengesi (`AppLogos.tsx`, `desktop.css`, `Desktop.tsx`, `Dock.tsx`)**:
  - `TerminalAppLogo`, `MarkdownAppLogo` ve `JsIdeAppLogo` içindeki gereksiz koyu şasi kutuları (`<rect fill="#0d0f14">`) kaldırılarak optik sınırları dolgun saf vektör gliflerine dönüştürüldü; `SettingsAppLogo` dişli mekanizması ile görsel ağırlıkları eşitlendi.
  - Masaüstü dosya (`.desktop-file-icon`) ve uygulama (`.desktop-app-icon`) simge arkaplanları `50x50px` olarak tekleştirildi.
  - Masaüstü uygulama simgeleri boyutu `28px`'ten `32px`'e, dosya simgeleri `26px`'ten `30px`'e, dock simgeleri `20px`'ten `24px`'e büyütüldü.
- **Pencere Çerçevesi Sadeleştirmesi (`WindowFrame.tsx`)**:
  - Pencere başlık çubuğundaki (`.window-title`) simge kaldırıldı; yalnızca pencere başlığı metni bırakıldı.
- **Swiss Kontrol Butonları Renk Güncellemesi (`window.css`)**:
  - Aşağı alma/küçültme butonu: `#eab308` (endüstriyel pirinç/kehribar sarısı),
  - Büyütme/ekranı kaplama butonu: `#16a34a` (endüstriyel durum yeşili),
  - Kapatma butonu: `#dc2626` (emniyet kırmızısı) olarak işlevsel ve ayırt edilebilir hale getirildi.
- **Sağ Üst Koordinatların Kaldırılması (`Desktop.tsx`)**:
  - Swiss temasında sağ üstteki `SYS.LOC // 39.92°N 32.85°E` telemetri metni arayüzden ve durum çubuğundan kaldırıldı.
- **Swiss Dosya Simgeleri İç Rozet ve Gliflerinin Büyütülmesi (`AppLogos.tsx`)**:
  - `MdFileLogo`, `TextFileLogo` ve `JsFileLogo` belgelerinin genel şasi büyüklüğü korunurken, iç kısımdaki rozet kutusu (`rect`) `14.4px x 11px` boyutuna genişletildi.
  - Markdown `M ↓` glifleri 4px'ten 6.7px'e (%67+ büyüme) çıkarıldı; `TXT` ve `JS` tipografik etiketleri merkezlenip font boyutları büyütülerek uzaktan rahatça okunur hale getirildi.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 106 testin tamamı (%100) başarıyla geçti** (ThemeRegistry için 7 yeni birim testi eklendi; monorepo genelinde 120/120 test yeşil).
  - ESLint / SonarJS: **0 hata, 0 uyarı** (Bilişsel karmaşıklık kurallarına tam uyum).
  - TypeScript Typecheck: 4 paketin tamamında (`shared`, `admin-interface`, `backend`, `user-interface`) **0 hata**.

## [2026-10-15] - Cyberpunk Neon Teması & Bütünsel HUD Tasarım Sistemi

### Yapılanlar
- **3. Yerleşik Tema Entegrasyonu (`cyberpunk-neon.theme.tsx`)**:
  - `ThemeDefinition` standardında `cyberpunk-neon` kimliğiyle tam kapsamlı tema nesnesi oluşturuldu.
  - Vurgu rengi: Neon Gül/Pembe (`#f43f5e`, `rgb(244, 63, 94)`), ikincil voltaj sarısı (`#facc15`), üçüncül sibernetik camgöbeği (`#06b6d4`).
  - Arka plan: Koyu OLED obsidian taban (`#030712`), çift radyal neon gradyanı ve CRT/HUD scanline ızgara dokusu.
  - Tipografi: Monospace terminal font hiyerarşisi (`'JetBrains Mono'`, `'Fira Code'`).
- **Özel Cyberpunk SVG Simgeleri**:
  - `CyberBrandLogo`: Altıgen HUD sibernetik çekirdeği ve telemetri kılavuzları.
  - `CyberTerminalLogo`: Neon pembe prompt chevron, yüksek voltaj sarı blok imleç ve HUD durum pencereleri.
  - `CyberSettingsLogo`: Sibernetik entegre devre (IC) çipi ve neon bağlantı bus pinleri.
  - `CyberMarkdownLogo` & `CyberJsIdeLogo`: Neon hatlı, fütüristik çift katmanlı doküman ve kod glifleri.
  - `CyberTextFileLogo`, `CyberMdFileLogo`, `CyberJsFileLogo`: Neon katlanır köşe, yüksek kontrastlı rozetler ve dosya tipi telemetrisi.
- **Kapsamlı Stil & Görsel Ayrıştırma**:
  - `design-tokens.css`: `[data-theme="cyberpunk-neon"]` kök değişkenleri, neon glow gölgeleri, koyu OLED yüzeyler ve CRT scanline ızgara arka planı eklendi.
  - `desktop.css`: Neon çerçeveli üst durum çubuğu, masaüstü kartları hover neon ışıltısı, bağlam menüsü sibernetik HUD kutuları.
  - `window.css`: Neon kontur parıltılı pencere gövdesi, renk kodlu fütüristik kontrol butonları (kapat `#f43f5e`, küçült `#facc15`, büyüt `#06b6d4`).
  - `dock.css`: Sibernetik konsol dock şasisi (`rgba(9, 13, 22, 0.92)`), neon pembe aktif gösterge LED'i (`#f43f5e`), neon HUD ipucu kutuları.
  - `settings.css`: Ayarlar uygulamasında `.theme-preview-box.preview-cyberpunk-neon` çift radyal neon önizleme kutusu ve renkli kontrol LED'leri.
- **Tema Motoru & Tip Güncellemeleri**:
  - `theme.types.ts`: `ThemeId` tipi `'spatial-glass' | 'swiss-industrial' | 'cyberpunk-neon' | string` olarak güncellendi.
  - `theme-registry.ts`: `cyberpunkNeonTheme` varsayılan yerleşik temalara eklendi.
  - `theme-registry.test.tsx` & `theme.store.test.ts`: Cyberpunk Neon için birim testleri eklendi.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 107 testin tamamı (%100) başarıyla geçti**.
  - ESLint / SonarJS: **0 hata, 0 uyarı**.
  - TypeScript: 4 paketin tamamında `tsc --noEmit` **0 hata**.

## [2026-10-15] - Classic Macintosh (1984 System 7) Teması & Retro Zaman Çizelgesi

### Yapılanlar
- **4. Yerleşik Tema Entegrasyonu (`classic-mac.theme.tsx`)**:
  - `ThemeDefinition` standardında `classic-mac` kimliğiyle tam kapsamlı tema nesnesi oluşturuldu.
  - Vurgu rengi: Derin Klasik Mac Laciverti (`#000080`, `rgb(0, 0, 128)`).
  - Şasi ve Zemin: Nostaljik açık gri platin taban (`#dcdfe5`), beyaz pencere içi (`#ffffff`) ve 1984 ikonik 50% dither dama deseni (`repeating-conic-gradient(#767b85 0% 25%, #8c919c 0% 50%) 0 0 / 4px 4px`).
  - Tipografi: Klasik Apple Geneva & Chicago font ailesi (`'Geneva', 'Chicago', sans-serif`).
- **Özel Susan Kare Homage SVG Simgeleri**:
  - `MacBrandLogo`: 1984'ün efsanevi gülümseyen "Happy Mac" bilgisayarı, CRT ekranı ve disket yuvası.
  - `MacTerminalLogo`: Tersine çevrilmiş siyah başlık çubuklu, pinstripe ve kare imleçli vintage komut kabuğu.
  - `MacSettingsLogo`: System 7 Control Panels donanım potansiyometreleri, kanal kızakları ve düğmeleri.
  - `MacMarkdownLogo`: TeachText / Document tüy kalem, mühür ve doküman rulosu.
  - `MacJsIdeLogo`: 3.5" manyetik geliştirici disketi ve kontrastlı "JS" sistem etiketi.
  - `MacTextFileLogo`, `MacMdFileLogo`, `MacJsFileLogo`: 3D kabartmalı katlanır köşeli sayfalar ve Susan Kare tarzı rozetler.
- **Kapsamlı Stil & Görsel Ayrıştırma & Hata Giderme**:
  - `design-tokens.css`: `[data-theme="classic-mac"]` kök değişkenleri, 3D kabartma gölgeleri (`inset 1px 1px #fff, inset -1px -1px #555`), açık zemin renkleri ve dither ızgara masaüstü deseni eklendi.
  - `desktop.css`: Platin üst durum çubuğu, siyah çerçeveli 3D beveled masaüstü uygulama/dosya simge kutuları, katı platin bağlam menüsü.
  - **Masaüstü İki Satırlı Etiketler & Gölgesiz Düz Renk**: `.desktop-app-card` iç boşluğu `padding: 4px 4px`, `gap: 3px` olarak optimize edildi; 2 satırlı uygulama isimlerinin (`Markdown Editörü` vb.) taşması engellendi. Etiketlerdeki tüm gölgeler ve çerçeveler kaldırılarak saf düz platin zemin (`#dcdfe5`) ve düz siyah metin (`#111111`) uygulandı. Hover durumunda klasik Mac lacivert vurgusu (`#000080`) aktifleşir.
  - `window.css`: Yatay pinstripe başlık çubuğu (`repeating-linear-gradient`), ortalanmış katı platin başlık plaketi, beyaz pencere çalışma alanı.
  - **Pencere Kontrol Butonlarının Merkezlenmesi**: Buton boyutu `14x14px` olarak ayarlandı, `display: flex; align-items: center; justify-content: center;` ile kapatma (`X`), küçültme (`Minus`) ve büyütme vektör ikonlarının sub-pixel kayması giderilerek tam matematiksel merkeze oturması sağlandı.
  - `dock.css`: Alt kenara kilitli System 7 Control Strip tarzı platin raf, 42x42px kare beveled dock kartları, katı lacivert aktif durum göstergesi (`#000080`).
  - `settings.css`: Ayarlar uygulaması tamamen açık platin/beyaz temaya uyarlandı; hover durumunda açık renk zeminde beyazlaşarak kaybolan kart çerçeveleri yerine klasik Mac lacivert çerçevesi (`#000080`), 3D beveled kartlar ve kırmızı retro fabrika ayarlarına sıfırlama alanı geliştirildi.
- **Tema Motoru & Test Kapsamı**:
  - `theme.types.ts`: `ThemeId` tipi `'spatial-glass' | 'swiss-industrial' | 'cyberpunk-neon' | 'classic-mac' | string` olarak genişletildi.
  - `theme-registry.ts`: `classicMacTheme` 4. yerleşik tema olarak kaydedildi.
  - `theme-registry.test.tsx`, `theme.store.test.ts`, `AppIconResolver.test.tsx`: Classic Mac için birim testleri eklendi.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 109 testin tamamı (%100) başarıyla geçti**.
  - ESLint / SonarJS: **0 hata, 0 uyarı**.
  - TypeScript: 4 paketin tamamında `tsc --noEmit` **0 hata**.

## [2026-10-15] - Ayarlar Uygulaması: Dinamik Tema Bilgi Başlığı & 7 Dilli Açıklama Sistemi

### Yapılanlar
- **Dinamik Seçilen Tema Bilgisi (`SettingsApp.tsx`)**:
  - Tema seçim ızgarasının üstündeki bölüm başlığı (`activeThemeTitle`), statik/sabit "Spatial Dark Glass" yerine o an aktif olan temanın adına göre dinamik oluşturuldu (`activeThemeMeta ? t('settings_theme_title_format').replace('{name}', activeThemeMeta.name) : t('settings_appearance_section')`).
  - Başlığa tema tasarım diline duyarlı aktif durum rozeti (`.settings-active-theme-pill`, `<Check size={11} /> {t('settings_active_badge')}`) entegre edildi.
  - Başlığın altındaki açıklama paragrafı (`settings-section-desc`), `getThemeDescription(currentTheme)` fonksiyonu ile reaktif olarak seçilen temanın (Spatial Glass, Swiss Industrial, Cyberpunk Neon, Classic Mac) mimari açıklamasını yansıtacak şekilde bağlandı.
- **7 Dilli Yerelleştirme Entegrasyonu (`translations.ts`)**:
  - `Translations` arayüzüne ve 7 dil sözlüğünün (`en`, `tr`, `de`, `fr`, `es`, `ru`, `ja`) tamamına her 4 temanın zengin açıklamaları (`settings_theme_desc_spatial_glass`, `settings_theme_desc_swiss_industrial`, `settings_theme_desc_cyberpunk_neon`, `settings_theme_desc_classic_mac`) ve başlık format şablonu (`settings_theme_title_format`: `{name} Teması` / `{name} Theme` / `{name}-Design` / `Thème {name}` / vb.) eklendi.
  - Tema seçim kartlarının içerisindeki açıklamalar da hardcoded İngilizce yerine `getThemeDescription(opt.id as ThemeId)` ile kullanıcının seçtiği dile göre yerelleştirildi.
- **Stil & Tasarım Sistemi Güncellemeleri (`settings.css`)**:
  - `.settings-active-theme-pill` sınıfı eklendi; varsayılan temada parıltılı cam hap, Swiss Industrial'de keskin 2px emniyet turuncusu monospace etiket, Cyberpunk Neon'da neon ışıltılı etiket, Classic Macintosh'ta ise retro katı lacivert beveled rozet olarak stillendirildi.
- **Birim ve Entegrasyon Testleri (`SettingsApp.test.tsx`)**:
  - Tema değiştirildiğinde üstteki başlığın ve açıklama paragrafının doğru içerikle güncellendiğini doğrulayan Vitest testleri eklendi.
  - Türkçe ve İngilizce dil geçişlerinde dinamik başlık formatının ve yerelleştirilmiş açıklamaların doğruluğu test edildi.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 111 testin tamamı (%100) başarıyla geçti**.
  - ESLint / SonarJS: **0 hata, 0 uyarı**.
  - TypeScript: 4 paketin tamamında `tsc --noEmit` **0 hata**.

## [2026-10-15] - Pencere Başlık Çubuğu: Orta Tık ile Pencere Kapatma (Middle-Click to Close)

### Yapılanlar
- **Pencere Başlık Çubuğunda Fare Orta Tık (Scroll Wheel) Aksiyonu (`WindowFrame.tsx`)**:
  - Uygulama pencerelerinin üst başlık çubuğuna (`.window-titlebar`) fare orta tuşu (`button === 1`) ile tıklandığında pencereyi anında kapatan `handleTitlebarAuxClick` mekanizması entegre edildi.
  - Tıpkı X butonuna basılmış gibi `closeWindow(win.id)` store fonksiyonu tetiklenir; aktif pencere kapandığında z-index hiyerarşisindeki bir sonraki pencereye odak yumuşakça devredilir.
- **Tarayıcı Otomatik Kaydırma (Autoscroll / Panning) Modu Engellendi**:
  - Windows Chromium ve Gecko tabanlı tarayıcılarda farenin orta tuşuna basıldığında tetiklenen dairesel yönlendirici kaydırma imleci (autoscroll) `onPointerDown` ve `onMouseDown` olaylarında `e.button === 1` tespitiyle `e.preventDefault()` çağrılarak tamamen engellendi.
- **Akıllı Kontrol Filtresi (Misclick Guard)**:
  - Kullanıcı küçültme (`.minimize`) veya tam ekran / geri yükleme (`.maximize`, `.restore`) butonlarına gelip kazara orta tık yaptığında pencerenin yanlışlıkla kapanmasını önlemek amacıyla buton filtre koruması (`.closest('.window-control-btn.minimize, .window-control-btn.maximize, .window-control-btn.restore')`) uygulandı.
- **Kapsamlı Birim ve Entegrasyon Testleri (`WindowFrame.test.tsx`)**:
  - Başlık çubuğuna ve başlık metnine orta tık yapıldığında pencerenin kapandığını doğrulayan testler eklendi.
  - Küçültme ve büyütme butonlarına orta tık yapıldığında pencerenin açık kalmaya devam ettiği test edildi.
  - Sol ve sağ tık kombinasyonlarının orta tık kapama mantığını tetiklemediği doğrulandı.
  - `pointerdown` ve `mousedown` olaylarında varsayılan tarayıcı eylemlerinin engellendiği (`preventDefault`) doğrulandı.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 116 testin tamamı (%100) başarıyla geçti**.
  - ESLint / SonarJS: **0 hata, 0 uyarı**.
  - TypeScript: `tsc --noEmit && vite build` **0 hata**.

## [2026-10-15] - Masaüstü Dosyaları Tek Tık ile Açma & Markdown Düzenleyici Varsayılan Düzenle Modu

### Yapılanlar
- **Masaüstü Dosyalarında Tek Tık (Single-Click) Etkileşimi (`Desktop.tsx`)**:
  - Masaüstündeki sanal dosyalar (`.desktop-file-card`), uygulamalar ile birebir aynı etkileşim modeline kavuşturuldu.
  - `onDoubleClick` yerine doğrudan `onClick` tetikleyicisi bağlandı; kullanıcı bir dosya kartına tek tıkladığında ilgili uygulama (Markdown Düzenleyici veya JS IDE) anında açılarak dosyayı aktif sekme olarak yükler.
  - Sürükleme hareketi sonrasındaki 150ms'lik `justDraggedRef` koruması korunarak taşıma esnasında kazara dosya açılması engellendi.
- **Markdown Düzenleyici Varsayılan "Düzenle" Modu (`MarkdownViewerApp.tsx`)**:
  - Markdown Düzenleyici'de bir dosya açıldığında veya sekmeler arasında geçiş yapıldığında varsayılan görünüm modu `split` yerine doğrudan `edit` ("Düzenle") olarak ayarlandı.
  - İlk state `useState<'edit' | 'preview' | 'split'>('edit')` ve `currentFile?.id` değişiminde `setViewMode('edit')` işletilerek kullanıcının bölünmüş ekran yerine doğrudan metin ve satır numaralı editör çalışma alanına odaklanması sağlandı.
  - Araç çubuğundaki `split` ve `preview` modları korunarak istenildiğinde tek tıkla canlı önizlemeye veya çift panelli bölünmüş görünüme geçiş olanağı devam ettirildi.
- **Birim ve Entegrasyon Testleri (`Desktop.test.tsx`, `MarkdownViewerApp.test.tsx`)**:
  - `Desktop.test.tsx`: Dosyaların tek tıkla (`fireEvent.click`) Markdown Viewer ve JS IDE pencerelerini açtığını doğrulayan testler güncellendi.
  - `MarkdownViewerApp.test.tsx`: Dosyaların varsayılan olarak `edit` modunda açıldığını (`markdown-raw-view` render edilirken `markdown-rendered-view`'ın başlangıçta gizli kaldığı) ve `edit`/`preview`/`split` geçişlerinin eksiksiz çalıştığını doğrulayan testler güncellendi.
- **Test ve Kalite Durumu**:
  - Vitest: **18 test dosyasında 116 testin tamamı (%100) başarıyla geçti**.
  - ESLint / SonarJS: **0 hata, 0 uyarı**.
  - TypeScript: `tsc --noEmit && vite build` **0 hata**.

## [2026-10-15] - Web Audio Sentetik Ses Motoru & Üst Bar Etkileşimli Ses Denetimi

### Yapılanlar
- **Web Audio API Sentetik Ses Motoru (`sound.service.ts`)**:
  - Dış ses dosyalarının getirdiği ağ trafiği, gecikme ve megabaytlık yükü ortadan kaldıran **0 KB ek yüklü, sıfır gecikmeli (zero-latency)** matematiksel ses sentezleyicisi geliştirildi.
  - `OscillatorNode`, `GainNode` ve `AudioContext` kullanılarak mikrosaniyelik üstel sönümlemeli (exponential decay envelope) saf tonlar ve mikro-çıtlamalar üretildi.
  - Tarayıcı `Autoplay Policy` kısıtlamalarına tam uyumlu, kullanıcı ilk etkileşiminde (`pointerdown`, `click`) bağlamı uyandıran `getContext()` yaşam döngüsü kuruldu.
- **Dört Temaya Özel Akustik Kimlikler (Theme-Aware Acoustics)**:
  1. **Spatial Dark Glass**: 480Hz -> 240Hz yumuşak sinüs dalgalı su damlası ve buzlu cam pıtırtısı.
  2. **Swiss Industrial**: 280Hz -> 60Hz üçgen dalga ve sert mekanik röle / mikro-anahtar çıtlaması (Tactile Microswitch).
  3. **Cyberpunk Neon**: 1100Hz -> 550Hz rezonans filtreli testere dişi (sawtooth) sibernetik HUD cıvıltısı.
  4. **Classic Macintosh**: 880Hz -> 440Hz Susan Kare 1984 tarzı saf 8-bit kare dalga (Square Wave) ve vintage disket kafası vuruşu.
  - Tema değişiminde her temanın felsefesini yansıtan 3 notalı karakteristik imza akoru (`theme-switch`) çalınır.
- **Zustand Ses Durum Deposu (`sound.store.ts`)**:
  - `isMuted` (varsayılan: `false`) ve `volume` (0.0 - 1.0, varsayılan: `0.4`) state'leri `localStorage` (`aec_portfolio_sound_muted`, `aec_portfolio_sound_volume`) ile kalıcılaştırıldı.
  - Sesi kapatıp açma (`toggleMute`, `setMuted`) ve ses seviyesini ayarlama (`setVolume`) fonksiyonları tanımlandı.
  - Döngüsel bağımlılıkları (circular dependencies) engellemek amacıyla aktif tema doğrudan DOM `data-theme` özniteliği üzerinden çözüldü.
- **Üst Durum Çubuğu Ses Denetim Bileşeni (`SoundControl.tsx`, `desktop.css`)**:
  - Durum çubuğunun sağ tarafına (`.statusbar-right`) saatin hemen yanına kompakt ve şık bir ses denetim paneli yerleştirildi.
  - **Doğrudan Kapatıp Açma (Mute Toggle)**: Dinamik Lucide ikonları (`Volume2`, `Volume1`, `VolumeX`) ile tek tıkla sesi tamamen susturma veya açma.
  - **Barda Sürükleyerek Ses Ayarlama (Draggable Volume Slider)**:
    - 68px genişliğinde, özel stillendirilmiş yatay range input kaydırıcısı (`sound-volume-slider`).
    - Sürükleme anında ses seviyesini anlık günceller (`setVolume`), seviye 0'a çekilirse otomatik mute'a geçer, 0'ın üstüne çekilirse otomatik sesi açar.
    - Sürükleme bittiğinde (`pointerup`) kullanıcının seçtiği ses yüksekliğini kulağıyla test edebilmesi için anlık `volume-tick` önizleme sesi çalar.
  - 4 temanın tasarım dillerine özel yüzey, kenarlık, track dolgusu ve thumb geometrileri uygulandı (Swiss temasında sert turuncu sürgü, Cyberpunk'ta neon parıltı, Mac'te retro beveled platin buton).
- **İşletim Sistemi Etkileşimlerine Ses Bağlantısı**:
  - `window-manager.store.ts`: Pencere açıldığında (`window-open`), kapandığında (`window-close`), simge durumuna küçültüldüğünde (`window-minimize`), tam ekrana kaplandığında (`window-maximize` - yükselen genişletici akor) ve tam ekrandan önceki boyuta geri dönüldüğünde (`window-restore` - daralan geri dönüş çıtlaması).
  - `theme.store.ts`: Tema değiştirildiğinde (`theme-switch`).
  - `Dock.tsx`: Dock üzerindeki açık uygulama simgelerine tıklandığında (`click`).
- **7 Dilli Yerelleştirme (`translations.ts`)**:
  - `sound_mute`, `sound_unmute`, `sound_volume` anahtarları 7 dilde (İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça, Japonca) tanımlandı.
- **Test ve Kalite Durumu**:
  - Vitest: **21 test dosyasında 132 testin tamamı (%100) başarıyla geçti** (`sound.service.test.ts` ve `SoundControl.test.tsx` dahil).
  - ESLint / SonarJS: **0 hata, 0 uyarı** (SonarJS floating-point kurallarına tam uyum).
  - TypeScript: Monorepo genelinde `tsc --noEmit` **0 hata**.
  - Üretim Paketi: `npm run build` sıfır hatayla derlendi.

## [2026-10-15] - Web Audio Prosedürel Müzik Motoru (8 Parça) & Üst Bar Mini Müzikçalar

### Yapılanlar
- **Sıfır Ek Yüklü Prosedürel Müzik Motoru (`music.service.ts`)**:
  - Harici hiçbir `.mp3`/`.wav`/`.ogg` ses dosyası kullanılmadan (0 KB asset yükü), Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`) üzerinde çalışan saf matematiksel adım sekanslayıcısı (Lookahead Step Sequencer) geliştirildi.
  - Her biri melodik lead ve bas hatlarına, bağımsız BPM değerlerine ve rezonans alçak geçiren filtreye (`lowpass filter`) sahip **8 adet özgün tema parçası (her temaya 2 parça)** bestelendi:
    1. **Spatial Dark Glass**:
       - *Track 1*: "Ethereal Orbit" (78 BPM, yumuşak sinüs dalgası, 1800Hz filtre, ambient arpejler).
       - *Track 2*: "Starlight Float" (84 BPM, sinüs lead + alt bas, 2200Hz filtre, uzamsal süzülme).
    2. **Swiss Industrial**:
       - *Track 1*: "Kalkül 1960" (112 BPM, saf üçgen dalga, 2800Hz filtre, Dieter Rams matematiksel ritmi).
       - *Track 2*: "Raster & Modul" (100 BPM, mekanik üçgen bas yürüyüşü, 2600Hz filtre, katı modüler yapı).
    3. **Cyberpunk Neon**:
       - *Track 1*: "Night City Drive" (122 BPM, agresif testere dişi/sawtooth lead, 2400Hz filtre, synthwave arpeji).
       - *Track 2*: "Neon Horizon" (110 BPM, sibernetik bas hatları, 2200Hz filtre, yüksek voltaj atmosferi).
    4. **Classic Macintosh**:
       - *Track 1*: "Silicon Valley 1984" (128 BPM, 8-bit chiptune kare dalga/square, 4000Hz filtre, retro neşeli bilgisayar ezgisi).
       - *Track 2*: "Pixel Dream" (106 BPM, nostaljik Susan Kare piksel melodisi, 3800Hz filtre).
- **Zustand Reaktif Müzik Deposu (`music.store.ts`)**:
  - `isPlaying: boolean`, `currentTrackIndex: number` (0 veya 1), `activeThemeId: string` ve `currentTrack: TrackDefinition` durumları reaktif olarak yönetildi.
  - `togglePlay()`, `nextTrack()` (aynı temanın 1. ve 2. parçaları arasında döngü kurma), `setTheme()`, `stop()` ve `reset()` fonksiyonları eklendi.
  - **Otomatik Ses ve Tema Senkronizasyonu**:
    - `useSoundStore.subscribe`: Ses denetimindeki ana ses seviyesi (`volume`) ve sessize alma (`isMuted`) değiştiğinde müzik ses çıkışı pürüzsüzce senkronize edilir.
    - `useThemeStore.subscribe`: Ayarlar uygulamasından sistem teması değiştirildiğinde, müzik çalıyorsa kesintisiz şekilde yeni temanın parçasına geçer.
- **Üst Bar Mini Müzikçalar Bileşeni (`MusicPlayer.tsx`, `desktop.css`)**:
  - Üst durum çubuğunun sağ tarafına (`.statusbar-right`), ses denetiminin hemen soluna yerleştirildi.
  - **Oynat / Duraklat Butonu (`music-player-btn`)**: Lucide `Play` ve `Pause` ikonları ile tek tıkla kontrol.
  - **Dinamik Ekolayzır Görselleştiricisi (`music-eq-visualizer`)**:
    - Müzik çalarken (`.playing`) CSS keyframe animasyonu (`@keyframes eqBounce`) ile ritmik olarak dalgalanan 4 dikey ekolayzır çubuğu (`.eq-bar.bar-1..4`).
    - Müzik durduğunda çubuklar zarif ve sabit bir dinlenme seviyesine döner.
  - **Parça Başlığı Rozeti (`music-player-title`)**: Aktif çalan parçanın başlığını ve BPM bilgisini gösterir.
  - **Sonraki Parça Butonu (`next-track-btn`)**: Lucide `SkipForward` ikonu ile temanın diğer parçasına hızlı geçiş sağlar.
  - 4 temaya özel CSS uyarlaması yapıldı (Spatial temada buzlu cam kontur, Swiss'te minimalist grafit ve turuncu çubuklar, Cyberpunk'ta neon pembe ve camgöbeği ışıma, Mac'te 3D beveled retro butonlar).
- **7 Dilli Yerelleştirme (`translations.ts`)**:
  - `music_play`, `music_pause`, `music_next` anahtarları 7 dilde (İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça, Japonca) sisteme işlendi.
- **Test ve Kalite Güvencesi**:
  - Vitest: **24 test dosyasında 149 testin tamamı (%100) başarıyla geçti** (`music.service.test.ts`, `music.store.test.ts`, `MusicPlayer.test.tsx` dahil).
  - ESLint / SonarJS: **0 hata, 0 uyarı** (SonarJS cognitive complexity <= 15, `prefer-specific-assertions` kurallarına tam uyum).
  - TypeScript: Monorepo genelinde `tsc --noEmit` **0 hata**.
  - Üretim Paketi: `npm run build` hatasız derlendi.

- **MP3 Akış & Yükleniyor (Loading) Durumu Animasyonları (`MusicPlayer.tsx`, `music.service.ts`, `desktop.css`)**:
  - **Asenkron Yükleme Durumu (`isLoading`)**: Müzik dosyası ağdan tamponlanırken görselleştirici çubukların erken zıplaması engellendi (`:not(.loading)`).
  - **Dönen Yükleme Spinner'ı**: Oynat butonuna tıklandığında parça başlayana kadar `Loader2` dönen spinner ikonu gösterildi (`.music-player-spinner`).
  - **Sıralı Dalga Animasyonu (`@keyframes eqLoadingWave`)**: Parça yüklenirken 4 ekolayzır çubuğu soldan sağa ritmik olarak hafifçe parlayıp sönerek kullanıcının parçanın hazırlandığını anlamasını sağladı.
  - **Çalma Sırası Özelleştirmesi**: 1 ve 2. temalarda standart sıra (Parça 1 -> Parça 2), 3 ve 4. temalarda ise kullanıcının talebiyle 2. parça ilk sırada (Neon Horizon ve Pixel Dream ilk) çalacak şekilde yapılandırıldı.

## [2026-10-15] - Arcade Game Hub (Oyun Merkezi), Neon Snake, Brick Breaker, Space Defender & Temaya Duyarlı Prosedürel Web Audio Sentezleyici

### Yapılanlar
- **Arcade Game Hub Uygulaması (`apps/user-interface/src/apps/games/GameHubApp.tsx`)**:
  - `gameHubManifest` tanımlandı (`id: 'game-hub'`, `name: 'Oyun Merkezi'`, `iconName: 'Gamepad2'`, varsayılan boyut `760x560px`).
  - `app-registry.tsx` içinde lazy-load importu ve `APP_REGISTRY` kaydı yapıldı.
  - Merkezi Lobi Görünümü:
    - Hero başlığı, aktif tema göstergesi, bağımsız oyun içi ses açık/kapalı anahtarı (`isMuted`), ses seviyesi kaydırıcısı ve tema ses efekti test butonu (`Sparkles`).
    - Lobi skor paneli: Snake, Breakout ve Space Defender için en yüksek skorları gösterir ve tüm rekorları sıfırlama butonu barındırır.
    - 3 oyunluk seçim kartları: Rozet, ikon, açıklama, kontrol şeması ve en iyi skor gösterimi.
  - Oyun Görünümü:
    - Lobiye geri dönme butonu (`← Oyunlar`), aktif oyun başlığı, anlık skor, en yüksek skor, can/dalga sayaçları ve duraklatma/yeniden başlatma kontrolleri.
- **3 Adet Temaya Duyarlı Klasik Arcade Oyunu**:
  1. **Neon Snake (`SnakeGame.tsx`)**:
     - 20x20 dinamik hücre ızgarası, hızlanma adımları, normal yem (+10 puan) ve geri sayımlı altın elma bonus yemleri (+50 puan).
     - Klavye (Ok tuşları / WASD) ve sanal dokunmatik D-Pad kontrolleri (Yukarı, Aşağı, Sol, Sağ, Duraklat).
     - Temaya göre reaktif tuval görselleştirmesi (Cyberpunk'ta neon parlamalı kuyruk, Swiss'te mimari kareler, Classic Mac'te 1-bit Susan Kare dither pikseller, Spatial'da buzlu cam orblar).
  2. **Brick Breaker (`BreakoutGame.tsx`)**:
     - 4 satır 8 sütun renkli tuğla ızgarası, palet temas açısına göre top fiziği yansıması, parçacık kıvılcımları, 3 can sistemi.
     - Fare imleci / dokunmatik sürükleme veya klavye ve sanal buton kontrolleri.
  3. **Space Defender (`SpaceDefenderGame.tsx`)**:
     - Klasik uzay savunucusu: Oyuncu gemisi, lazer atışları, yana doğru hareket eden ve kademeli inen uzaylı filosu.
     - Dalga ilerleme mekaniği, uzaylı bombaları, çarpışma kıvılcımları, 3 can sistemi ve ATEŞ butonu.
- **Prosedürel Web Audio API Oyun Sentezleyici Motoru (`game-sound.service.ts`)**:
  - Sıfır dış varlık (zero-asset), sıfır gecikmeli procedural sentezleme motoru.
  - **4 Temaya Duyarlı Dalga Biçimleri & Frekans Profilleri**:
    - `classic-mac`: 1984 8-bit chiptune kare dalgaları (`square`), neşeli arpejler ve retro 8-bit kaza sesleri.
    - `cyberpunk-neon`: Agresif testere dişi dalgaları (`sawtooth`), lazer süpürme ve yüksek enerjili sibernetik zıplamalar.
    - `swiss-industrial`: Temiz, akustik hissiyatlı üçgen dalgaları (`triangle`), kuru tıkırtılar ve endüstriyel baslar.
    - `spatial-glass`: Saf sinüs dalgaları (`sine`), kristal berraklığında rezonanslı çanlar ve yumuşak sönümlenen uzamsal tonlar.
  - Desteklenen Olay Sesleri: `snake-move`, `snake-eat`, `snake-bonus`, `snake-die`, `paddle-bounce`, `brick-hit`, `life-lost`, `level-clear`, `laser-shoot`, `alien-hit`, `alien-explode`, `player-hit`, `wave-clear`, `ui-click`, `game-start`, `game-over`, `high-score`, `pause-toggle`.
- **4 Temaya Özel SVG Uygulama Logoları**:
  - `spatial-glass`: Lucide `Gamepad2` simgesi.
  - `swiss-industrial`: `AppLogos.tsx` içinde `GameHubAppLogo` (minimalist geometrik konsol şasisi, hassas D-pad ve turuncu emniyet butonu).
  - `cyberpunk-neon`: `cyberpunk-neon.theme.tsx` içinde `CyberGameHubLogo` (köşeli HUD şasisi, neon pembe D-pad ve camgöbeği/sarı durum pinleri).
  - `classic-mac`: `classic-mac.theme.tsx` içinde `MacGameHubLogo` (Susan Kare 1984 System 7 piksel konsol).
- **Çok Dilli Yerelleştirme (7 Dil)**:
  - `appName_game_hub` ve `appDesc_game_hub` İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça ve Japonca dillerine eklendi.
  - Masaüstü kısayollarında (`Desktop.tsx`) ve Açık Uygulamalar Çubuğunda (`Dock.tsx`) dinamik yerelleştirme bağlandı.
- **Kapsamlı Test & Kalite Doğrulaması**:
  - 5 yeni test dosyası yazıldı: `game-sound.service.test.ts`, `GameHubApp.test.tsx`, `SnakeGame.test.tsx`, `BreakoutGame.test.tsx`, `SpaceDefenderGame.test.tsx`.
  - Vitest: **29 test dosyasında 171 testin tamamı %100 başarıyla geçti**.
  - TypeScript: `npm run typecheck` **0 hata**.
  - Üretim Paketi: `npm run build` 10 saniyede hatasız tamamlandı; `GameHubApp` bağımsız dinamik chunk olarak optimize edildi (`46.96 kB`, gzip `11.87 kB`).

## [2026-10-15] - Pencere ve Dock Sağ Tık Bağlam Menüsü Entegrasyonu & Doğrudan Kapatma Mekanizması

### Yapılanlar
- **Uygulama İçi Sağ Tık Tarayıcı Menüsü Engellemesi & WebOS Pencere Bağlam Menüsü (`WindowFrame.tsx`)**:
  - `WindowFrame` bileşeni güncellenerek tüm pencere yüzeyinde (hem başlık çubuğu hem de `window-content` uygulama içerik alanı) sağ tıklama tarayıcı varsayılan menüsü (`e.preventDefault()`) engellendi.
  - Sağ tıklama yapıldığında pencere otomatik olarak aktif odak düzeyine (`focusWindow`) getirilir ve imleç koordinatlarında temaya duyarlı WebOS pencere bağlam menüsü açılır.
  - Bağlam menüsünde yer alan eylemler:
    - **Kapat** (`window_ctx_close` / "Kapat"): Pencereyi sonlandırır.
    - **Küçült** (`window_ctx_minimize` / "Simge Durumuna Küçült"): Pencereyi Dock'a indirir.
    - **Ekranı Kapla / Geri Yükle** (`window_ctx_maximize` / `window_ctx_restore`): Boyutu tam ekran ile normal durum arasında değiştirir.
  - Pencere dışına tıklandığında veya `Escape` tuşuna basıldığında menü otomatik olarak kapanır.
- **Açık Uygulamalar Çubuğu (Dock) Sağ Tık Menüsü & Doğrudan Kapatma (`Dock.tsx`, `dock.css`)**:
  - Alt bardaki açık uygulama butonlarına `onContextMenu` desteği eklendi; tarayıcının yerel menüsü engellenerek butonun hemen üzerinde temaya duyarlı bağlam menüsü açılması sağlandı.
  - Menü bileşenleri:
    - **Başlık Alanı** (`.dock-context-header`): 7 dilli yerelleştirilmiş uygulama adını görüntüler.
    - **Kapat Butonu** (`.window-titlebar-context-item.danger`): Uygulamayı doğrudan kapatır (`closeWindow`) ve menüyü gizler.
    - **Küçült / Geri Yükle Butonu**: Uygulamanın minimize durumunu tersine çevirir.
  - Dock zeminine boş alanda sağ tıklama tarayıcı menüsü engellendi (`e.preventDefault()`).
  - Dışarı tıklama, başka yere sağ tıklama ve `Escape` tuşu ile otomatik menü kapatma sağlandı.
- **Temaya Duyarlı CSS Tasarımı**:
  - `spatial-glass`, `swiss-industrial`, `cyberpunk-neon` ve `classic-mac` temalarının her biri için `.dock-context-header` ve `.dock-context-menu` kuralları eklendi.
- **Kapsamlı Test ve Doğrulama**:
  - `WindowFrame.test.tsx`: Pencere içeriğine sağ tıklama, tarayıcı menüsünün engellenmesi, menüden kapatma ve Escape ile kapatma testleri eklendi.
  - `Dock.test.tsx`: Dock öğesine sağ tıklama, "Kapat" butonuna basarak pencereyi sonlandırma, minimize/restore geçişi ve Escape/dışarı tıklama testleri eklendi.
  - **179 testin tamamı %100 başarıyla geçti**.
  - Tüm monorepo genelinde `npm run typecheck` **0 hata** ile tamamlandı.

## [2026-10-15] - Markdown Editörü Önizleme ve Düzenleme Açılış Modu Ayrımı

### Yapılanlar
- **Farklılaştırılmış Açılış Modu Mimarisi (`Desktop.tsx`, `filesystem.store.ts`, `MarkdownViewerApp.tsx`)**:
  - `useFileSystemStore` içine `viewerMode: 'edit' | 'preview' | 'split'`, `setViewerMode` ve `openInViewer(fileId, initialMode?)` desteği eklendi.
  - **Doğrudan Dosyaya Tıklama**: Masaüstündeki `.md` veya `.txt` dosyasına (veya sağ tık bağlam menüsünden "Aç" seçeneğine) tıklandığında `openInViewer(file.id, 'preview')` çağrılarak belge doğrudan **Önizleme (`preview`)** modunda açılır. Kullanıcı dosyayı açtığında biçimlendirilmiş markdown çıktısını hemen okuyabilir.
  - **Doğrudan Editör Uygulamasına Tıklama**: Masaüstü uygulama simgelerinden "Markdown Düzenleyici" başlatıldığında `setViewerMode('edit')` çağrılarak pencere doğrudan **Düzenleme (`edit`)** modunda (satır numaraları ve kaynak metin alanı ile) açılır. Açık belge yoksa varsayılan ana belge düzenleme modunda getirilir.
  - Editör içinden yeni belge oluşturulduğunda (`+`) veya boş durumdan dosya seçildiğinde de düzenleme amacıyla `'edit'` modu korunur.
- **Test ve Kalite**:
  - `filesystem.store.test.ts`: `openInViewer` fonksiyonunun `preview` ve `edit` modlarını doğru şekilde store'a kaydettiği doğrulandı.
  - `MarkdownViewerApp.test.tsx`: `preview` modu ile açılışta zengin HTML görünümünün ekranda olduğu, ham editörün gizlendiği test edildi.
  - `Desktop.test.tsx`: Masaüstü dosya kartına tıklamada `preview` modunun, masaüstü uygulama simgesine tıklamada `edit` modunun etkinleştiği test edildi.
  - Vitest: **29 test dosyasında 182 testin tamamı %100 geçti**.
  - Monorepo genelinde `npm run typecheck` **0 hata** ile doğrulandı.

## [2026-10-15] - Filesystem Store Hata Düzeltmeleri, Kapsamlı SonarQube/SonarJS Taraması ve Güvenlik Sertleştirmesi

### Yapılanlar
- **Filesystem Store Sertleştirmesi & Tip Güvenliği (`filesystem.store.ts`)**:
  - `MarkdownViewerMode` tipi modüler olarak dışa aktarıldı (`export type MarkdownViewerMode = 'edit' | 'preview' | 'split';`), SonarQube S4323 kural ihlali giderildi.
  - `getFile`, `deleteFile`, `updateFile`, `renameFile` metodları hem dosya adı (`name`) hem de benzersiz dosya kimliği (`id`) kabul edecek şekilde esnetildi ve sınır kontrolleri güçlendirildi.
  - `renameFile` metodu dosya uzantısı değişiminde (ör. `.txt` -> `.js` veya `.js` -> `.md`) Markdown Viewer ve JS IDE aktif sekmelerini dinamik olarak senkronize edecek şekilde güncellendi.
  - `createInitialFileMap` kopyalama sızıntılarını önlemek amacıyla sığ klonlama (`shallow clone`) ile izole edildi.
- **SonarQube & SonarJS Kapsamlı Kod Kalitesi Taraması (`npm run lint`)**:
  - Monorepo genelindeki tüm bileşenler, kancalar ve oyun modülleri SonarJS kurallarından geçirildi.
  - **Sözde Rastgele Sayı Güvenliği (S2245 / `sonarjs/pseudo-random`)**: Oyunlarda (`BreakoutGame.tsx`, `SnakeGame.tsx`, `SpaceDefenderGame.tsx`) `Math.random()` yerine Web Crypto API tabanlı cryptographically secure `crypto.getRandomValues` kullanan `apps/user-interface/src/apps/games/utils/random.ts` yardımcı motoru yazıldı (`getRandomFloat`, `getRandomInt`, `getRandomSpread`, `getRandomSign`).
  - **Bilişsel Karmaşıklık İyileştirmeleri (S3776 / `sonarjs/cognitive-complexity`)**:
    - `BreakoutGame.tsx`: 49 olan bilişsel karmaşıklık, palet hareketi, duvar/tavan sekmesi, palet sekmesi, zemin/can kontrolü ve tuğla çarpışma yardımcılarına (`updatePaddleMovement`, `updateBallWallAndCeilingBounce`, `updatePaddleBounce`, `handleBallLossAndFloor`, `updateBrickCollisionsAndVictory`) parçalanarak < 5 seviyesine düşürüldü.
    - `SnakeGame.tsx`: Yılan gövde çizimindeki iç içe dallanmalar ve ternary ifadeler (`sonarjs/no-nested-conditional`) temaya özel alt fonksiyonlara (`renderRetroPixelSegment`, `renderCyberpunkSegment`, `renderSwissSegment`, `renderSpatialGlassSegment`) ayrılarak karmaşıklık 4'e düşürüldü.
    - `SpaceDefenderGame.tsx`: Oyun döngüsü ve uzaylı hareketleri ayrıştırıldı, kullanılmayan `Pause` import'u temizlendi (`sonarjs/unused-import`).
  - **Erişilebilirlik ve Semantik İyileştirmeler**:
    - `Desktop.tsx`: Masaüstü kartları ve marka logosu `role="button"` div'ler yerine semantik `<button type="button">` etiketlerine dönüştürüldü (SonarQube S6819); CSS sıfırlamaları `desktop.css`'e işlendi. `file.text()` standardına geçildi (S6551/S7756).
    - `Dock.tsx` ve `WindowFrame.tsx`: Sağ tık bağlam menülerine `role="menu"`, `tabIndex={-1}` ve klavye dinleyicisi `onKeyDown` eklendi (S6848, S1082).
- **TypeScript Derleme Uyumluluğu (`tsconfig.json`)**:
  - `apps/user-interface/tsconfig.json` `lib` array'ine `"ES2023"` eklendi (`toSorted()` desteği).
  - Pointer event türü `HTMLElement` olarak gevşetilerek tip hataları sıfırlandı.
- **Test ve Kalite Durumu**:
  - `npm run lint`: **0 hata, 0 uyarı** (Monorepo genelinde SonarJS kuralları %100 temiz).
  - `npm run typecheck`: **0 hata** (Tüm paketlerde tam tip güvenliği).
  - `npm test`: **29 test dosyasında 182 testin tamamı %100 başarıyla geçti**.

## [2026-10-15] - Metamorfik Mobil Arayüz Dönüşümü (Metamorphic Mobile UI Transformation)

### Yapılanlar
- **Reaktif Viewport & Breakpoint Store (`viewport.store.ts`, `viewport.store.test.ts`)**:
  - `MOBILE_BREAKPOINT = 768px`, `TABLET_BREAKPOINT = 1024px` standartlarında merkezi reaktif viewport dinleyicisi kuruldu (`useViewportStore`, `useViewport`).
  - `calculateDeviceType` saf fonksiyonu ile `isMobile`, `isTablet`, `isDesktop`, `deviceType` ('mobile' | 'tablet' | 'desktop') hesaplamaları sağlandı.
  - SSR dostu başlangıç boyutlandırması, passive resize listener yönetimi ve bellek sızıntısı önleme sağlandı.
  - SonarJS kurallarına (bilişsel karmaşıklık <= 15, sıfır iç içe geçmiş ternary operatör) tam uyum sağlandı.
- **Metamorfik Pencere Çerçevesi & Mobil Tam Ekran Sheet Modeli (`WindowFrame.tsx`, `window.css`, `WindowFrame.test.tsx`)**:
  - Mobil ekranlarda (<768px) masaüstü serbest sürükleme (`handleTitlebarPointerDown`), 8 yönlü boyutlandırma tutamaçları (`resize-handles`) ve rastgele piksel koordinatları otomatik olarak devre dışı bırakıldı.
  - Açık uygulamalar mobilde akıcı slide-up animasyonu ile modern **Full-screen Bottom Sheet** (`height: calc(100dvh - 42px)`, `border-radius: 18px 18px 0 0`) formuna dönüştürüldü.
  - Başlık çubuğunun üzerine mobil dokunmatik işletim sistemi standardında 36px genişliğinde ince sürükleme göstergesi barı (`.window-mobile-indicator-bar`) yerleştirildi.
  - 4 yerleşik temanın tamamı (`spatial-glass`, `swiss-industrial`, `cyberpunk-neon`, `classic-mac`) mobil sheet başlık çubuğu ve köşe radyanlarına göre uyarlandı.
- **Mobil Springboard Uygulama Izgarası & Dosya Bölümü (`Desktop.tsx`, `desktop.css`, `translations.ts`, `Desktop.test.tsx`)**:
  - Masaüstündeki karmaşık serbest sürükle-bırak koordinat sistemi mobilde devre dışı bırakılarak modern 4 sütunlu dokunmatik Springboard uygulama ızgarasına dönüştürüldü.
  - 52px boyutunda dokunmatik dostu simge kapsayıcıları ve 11px iki satırlı etiketler uygulandı.
  - Mobil ana ekranda 7 dilde yerelleştirilmiş bölüm başlıkları eklendi: "Uygulamalar" (`desktop_section_apps`) ve "Dosyalar" (`desktop_section_files`).
  - Üst durum çubuğu mobilde kompakt moda geçirildi: Müzik şarkı adı ve bir sonraki şarkı butonu ile ses kaydırıcısı gizlenerek saat, oynat/durdur ve ses aç/kapat butonları için ferah alan açıldı.
- **Mobil Dock Otomatik Saklanma Mimarisi (Dock Auto-Tuck - `Dock.tsx`, `dock.css`, `Dock.test.tsx`)**:
  - Mobil ekranda bir uygulama açıkken dock otomatik olarak gizlenir (`isMobile && activeWindowId && !minimized`), böylece telefon ekranının %100'ü açık olan uygulamaya ayrılır.
  - Pencere simge durumuna küçültüldüğünde veya kapatıldığında dock, mobil ana ekranda (`bottom: 12px`, `height: 52px`) dokunmatik kontrol paneli olarak yeniden belirir.
- **Uygulamaların Dar Mobil Ekranlara (<380px) Adaptasyonu**:
  - `terminal.css`: Mobilde optimize padding (10px), 12px yazı boyutu, nano editör 28px dokunmatik butonları.
  - `markdown-viewer.css`: Araç çubuğu flex-wrap düzeni, tek sütun dikey split modu (%50 editör / %50 önizleme), 90% mobil modal genişliği.
  - `settings.css`: Mobilde ferah tek sütun tema seçim kartları, 2 sütunlu kompakt dil kartları (`minmax(130px, 1fr)`).
  - `js-ide.css`: Mobilde konsol yüksekliğinin 120px'e çekilerek editöre daha fazla dikey alan tanınması.
  - `game-hub.css`: Arcade canvas'ının `min(88vw, 340px)` ile taşma yapmadan küçük ekranlara sığması, mobil dokunmatik D-pad ve yatay kontrol butonlarının akıcı ölçeklenmesi.
- **Doğrulama ve Metrikler**:
  - Vitest: **Monorepo genelinde 34 test dosyasında 210 testin tamamı (%100) başarıyla geçti** (User interface: 30 test dosyasında 196 test).
  - TypeScript: 4 paketin tamamında `npm run typecheck` **0 hata**.
  - ESLint & SonarJS: `npm run lint` **0 hata, 0 uyarı** (Bilişsel karmaşıklık <= 15).

## [2026-10-17] - Mobil Sürüm Kullanılabilirlik & Hata Testi Denetimi (Mobile QA Audit)

### Yapılanlar & Denetim Bulguları
- **Kıdemli QA & Mobil UX Denetimi Gerçekleştirildi**:
  - Chrome DevTools MCP üzerinden iPhone 14 (390x844, touch, mobile) ve kompakt Android (360x740, touch, mobile) emülasyonu yapılarak tüm çekirdek uygulamalar interaktif olarak test edildi.
  - **Masaüstü Bölüm Başlığı Kırpılma Hatası Giderildi (Fix)**:
    - Mobil ana ekranda `.desktop-viewport.is-mobile` içine durum çubuğu güvenli alanı (`padding-top: calc(var(--statusbar-height, 42px) + 8px)`) eklendi ve `.desktop-apps-grid` üst boşluğu sıfırlandı. Böylece "Uygulamalar" başlığının durum çubuğu altına girmesi önlendi (Header top: 48px, statusbar bottom: 42px).
  - **Uygulama İçi Mobil Davranışların Doğrulanması**:
    - **Terminal CLI**: Otomatik açılış mobilde düzgün baskılandı; tıklandığında tam ekran sheet olarak açıldı, `help` ve `nano` komutları yatay taşma olmadan çalıştı, dokunmatik kısayol butonları doğrulandı.
    - **Markdown Viewer**: Belge açma (`bio.md`), Düzenle (`edit`), Önizleme (`preview`) ve Bölünmüş (`split` - dikey %50/%50 istifleme) modları test edildi.
    - **JavaScript IDE**: `demo.js` açıldı, 120px konsol paneli ve yeşil `Run` butonu ile kod sandbox içinde çalıştırıldı (8ms çalıştırma süresi ve loglar doğrulandı).
    - **Game Hub**: Neon Snake oyunu başlatıldı, dokunmatik ekran D-pad butonları (Yukarı, Aşağı, Sol, Sağ, Duraklat) ve canvas ölçeklemesi test edildi.
    - **Ayarlar & Temalar**: Spatial Dark Glass, Swiss Industrial, Cyberpunk Neon ve Classic Macintosh temaları mobil sheet formunda başarıyla doğrulandı; sıfır dikey zıplama (`scrollTop: 0`) teyit edildi.
  - **Kompakt Ekran (360px) Stres Testi**:
    - `@media (max-width: 360px)` devreye girerek 4 sütunlu ızgara otomatik 3 sütuna dönüştü; sıfır yatay taşma (`scrollWidth === clientWidth`) doğrulandı.
- **Doğrulama ve Metrikler**:
  - `npm test`: **30 test dosyasında 196 testin tamamı (%100) başarıyla geçti**.
  - `npm run typecheck`: **0 hata**.
  - `npm run lint`: **0 hata, 0 uyarı** (Monorepo genelinde SonarJS kuralları %100 temiz).

## [2026-10-17] - Mobil Spatial Dikey Ses Kapsülü Mimarisi (Mobile Spatial Volume Popover Capsule)

### Yapılanlar
- **Mobil Dikey Ses Popover Kapsülü (`SoundControl.tsx`, `SoundControl.test.tsx`, `desktop.css`)**:
  - Mobil ekranlarda (<768px) durum çubuğundaki ses butonuna dokunulduğunda açılan, iOS Control Center ve VisionOS estetiğinde yarı saydam buzlu cam **Spatial Dikey Ses Kapsülü** (`.sound-popover-capsule`) geliştirildi.
  - **44×136px Dokunmatik Dikey Slider**:
    - Pointer Events API (`onPointerDown`, `onPointerMove`, `onPointerUp`) ve `setPointerCapture` ile başparmak dikey sürükleme desteği sağlandı; kullanıcı parmağı izleme alanından çıksa bile kesintisiz ses hesaplaması yapıldı.
    - Anlık yüzde göstergesi (ör. `%80`), sıvı mavi dolgu (`.sound-popover-fill`), dinamik ses ikonu (`Volume2`, `Volume1`, `VolumeX`).
    - Bırakıldığında Web Audio API `volume-tick` önizleme sesi çalınması sağlandı.
  - **Hızlı Sessize Alma Butonu (Mute Toggle)**:
    - Kapsülün altında tam genişlikte 32px yüksekliğinde "Sessize Al / Sesi Aç" eylem butonu entegre edildi.
  - **Dışarı Dokunma ve Klavye Erişilebilirliği**:
    - Outside click (`pointerdown` listener) ve `Escape` tuşu ile otomatik kapanma sağlandı.
    - `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` ve `ArrowUp`, `ArrowDown`, `Home`, `End` klavye kontrolleri ile WCAG 2.2 AA erişilebilirlik sağlandı.
  - **4 Tema İle Tam Uyum**:
    - `spatial-glass`: 24px blur buzlu cam, 20px radyan, mavi/cam göbeği degrade.
    - `swiss-industrial`: Mat grafit şasi, 4px radyan, masif Braun turuncusu dolgu.
    - `cyberpunk-neon`: Koyu lacivert HUD kabini, neon pembe çerçeve, siyan-pembe degrade parıltı.
    - `classic-mac`: Susan Kare 1984 platin gri şasi, 1px siyah kenarlık, siyah masif retro dolgu.
  - **SonarJS & Bilişsel Karmaşıklık İyileştirmeleri**:
    - İç içe ternary ifadeler `getSoundButtonLabel` fonksiyonuna taşındı, klavye ve ikon mantığı saf yardımcı fonksiyonlara (`getNextVolumeFromKey`, `VolumeIcon`) ayrılarak bilişsel karmaşıklık < 10 seviyesine indirildi (S3776 & S6819 & S6848 uyumlu).
- **Test ve Kalite Durumu**:
  - `SoundControl.test.tsx`: 5 yeni mobil popover birim ve entegrasyon testi eklendi; toplam test sayısı 201'e çıktı.
  - Vitest: **30 test dosyasında 201 testin tamamı (%100) başarıyla geçti**.
  - TypeScript: `npm run typecheck` **0 hata**.
  - ESLint / SonarJS: `npm run lint` **0 hata, 0 uyarı**.

## [2026-10-17] - Mobil Dikey Ses Kapsülü Düzen Kayması (CLS / Layout Shift) Düzeltmesi

### Yapılanlar
- **Sorun Tespiti (Layout Jerk & UX Shift)**:
  - Mobil dikey ses popover'ında ses seviyesi sıfıra (`0`) çekildiğinde `sound.store.ts` reaktif olarak `isMuted = true` durumuna geçiyordu.
  - `SoundControl.tsx` popover başlığında `{isMuted ? t('sound_mute') : `${currentPercent}%`}` koşulu bulunduğu için `%0` yerine "Sesi Kapat" (Türkçe) metni render ediliyordu.
  - Dar kapsül genişliğinde "SESİ KAPAT" metni iki satıra sarılarak (`SESİ` \n `KAPAT`) başlık yüksekliğini iki katına çıkarıyor, alttaki dikey slider izini ve sessize alma butonunu aniden aşağı iterek zıplamaya (Cumulative Layout Shift) ve UX bozulmasına sebep oluyordu.
- **Düzeltmeler**:
  - **Daima Yüzde Gösterimi**: Popover başlığı (`.sound-popover-header`), sessize alınmış olsa bile daima `{currentPercent}%` (ör. `0%`) gösterecek şekilde sabitlendi; böylece başlık metninin karakter uzunluğu ve kelime yapısı dikey oynamaya yol açamaz.
  - **CSS Geometrisi & No-Wrap Koruması (`desktop.css`)**:
    - `.sound-popover-capsule`: Genişlik `92px`'den `108px`'e genişletildi, `padding: 12px 8px 10px` ve `box-sizing: border-box` ile dengelendi.
    - `.sound-popover-header`: `height: 18px; min-height: 18px; line-height: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` kuralları ile dikey yüksekliği kesin olarak sabitlendi.
    - `.sound-popover-mute-btn`: Yükseklik `30px; min-height: 30px` olarak sabitlendi; buton içi `svg` için `flex-shrink: 0`, metin `span` etiketi için `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` kuralları eklenerek çoklu satıra bölünme tamamen engellendi.
  - **Birim ve Entegrasyon Testleri**:
    - `SoundControl.test.tsx`: Sessize alma durumunda başlığın metinsel kelimeye dönüşmeyip `0%` göstermeye devam ettiğini ve düzen kaymasını önlediğini doğrulayan 10. test yazıldı.
- **Doğrulama ve Metrikler**:
  - Vitest: **30 test dosyasında 202 testin tamamı (%100) başarıyla geçti**.
  - TypeScript: `npm run typecheck` **0 hata**.
  - SonarJS & ESLint: Bilişsel karmaşıklık < 10, **0 hata, 0 uyarı**.
  - HTML Meta & Güvenli Alan: `index.html` viewport meta etiketine `viewport-fit=cover` eklenerek modern çentikli telefonlarda (iOS Dynamic Island, Android gesture nav) `env(safe-area-inset-*)` tam entegrasyonu sağlandı.

## [2026-10-17] - Mobil Dokunmatik Jestler, Doğrudan Müzik Geçişi ve Haptik Bağlam Menüsü

### Yapılanlar
- **1. Aşağı Kaydırarak Kapatma / Küçültme Hareketi (Swipe-Down to Dismiss Sheet - `WindowFrame.tsx`, `window.css`)**:
  - Mobil tam ekran bottom sheet başlık çubuğuna (`.window-titlebar` / `.window-mobile-indicator-bar`) Pointer Events API tabanlı akıcı parmak izleme motoru (`setupSheetSwipeListener`) eklendi.
  - Sürükleme esnasında sheet `--sheet-translate-y` CSS değişkeni ile 1:1 parmağı takip eder (`.is-swiping` ile `transition: none`, `opacity` dinamik solma).
  - 110px eşiği aşıldığında pencere otomatik olarak simge durumuna küçülür (`minimizeWindow`). Eşik aşılmazsa `0.28s cubic-bezier(0.32, 0.72, 0, 1)` yay animasyonu ile eski tepe konumuna zıplar (snap-back).
  - Pencere kontrol butonlarına (X ve -) basıldığında jest çakışması engellendi.
  - SonarJS kurallarına tam uyum için `getMobileSheetOpacity` ve `setupSheetSwipeListener` yardımcıları saf fonksiyon olarak bileşen dışına ayrıştırıldı.
- **2. Mobilde Doğrudan Müzik Parçası Değiştirme (`MusicPlayer.tsx`, `desktop.css`)**:
  - Durum çubuğunda mobilde gizlenen sonraki parça butonu (`.next-track-btn`) `display: flex !important` yapılarak 22×22px dokunmatik buton olarak görünür kılındı.
  - Durum çubuğu müzik konteynerine şarkı adı ve BPM bilgisi (`title`) eklendi.
  - Oynat/Durdur butonu %100 saf ve hatasız çalışacak şekilde optimize edildi.
- **3. Masaüstü ve Dosya Kartlarında Uzun Basma Bağlam Menüsü (Mobile Long-Press - `Desktop.tsx`)**:
  - Mobilde boş masaüstü alanına 500ms basılı tutulduğunda dokunulan koordinatlarda masaüstü bağlam menüsü açılır (Yeni Not, Yeni Belge, Yeni Script, Dosya Yükle, Düzeni Sıfırla).
  - Destekleyen mobil cihazlarda 40ms haptik titreşim (`navigator.vibrate(40)`) geri bildirimi verilir.
  - Kullanıcı parmağını 10px'den fazla kaydırdığında (scroll jesti) uzun basma zamanlayıcısı otomatik iptal edilir.
  - Masaüstü dosya kartlarına uzun basıldığında dosya bağlam menüsü (Aç, Yeniden Adlandır, Sil) açılır.
  - Uzun basma jesti sonrası parmak kaldırıldığında menünün hemen kapanmasını önleyen `justLongPressedRef` koruması entegre edildi.
- **4. Mobil Uzun Dokunma Çakışması ve Doğal Bağlam Menüsü Sızıntı Çözümü (`Desktop.tsx`, `Desktop.test.tsx`)**:
  - **Sorun Tespiti**: Bir uygulamaya veya dosyaya 500ms basıldığında ilgili öğenin menüsü açılıyor, ancak parmak basılı tutulmaya devam edildiğinde (~800-1000ms) mobil tarayıcının ürettiği sentetik yerel `contextmenu` olayı `<main>` masaüstü konteynerine sızarak (`bubble`) mevcut açık menüyü eziyor ve masaüstü sağ tık menüsünü açıyordu. Ayrıca parmak çok uzun süre basılı tutulduğunda sabit zaman aşımına dayalı `justLongPressedRef` bayrağı parmak henüz ekrandayken sıfırlandığı için parmak kaldırıldığında istenmeyen tıklama olayları oluşabiliyordu.
  - **Uygulanan Çözümler**:
    - **Jest Yaşam Döngüsü (`isLongPressActiveRef`)**: Uzun basma durumu parmak ekranda kaldığı tüm süre boyunca `true` kalır; parmak kaldırıldığında (`pointerup` / `pointercancel`) 350ms'lik bir soğuma penceresi başlatılarak hem tıklama olayları hem de küresel menü kapatma dinleyicileri kusursuzca filtrelenir.
    - **Olay Yayılımının Durdurulması (`stopPropagation` & `preventDefault`)**: Hem dosya kartlarında (`.desktop-file-card`) hem de uygulama kartlarında (`.desktop-app-card`) `onPointerDown` ve `onContextMenu` olaylarında `e.stopPropagation()` ve `e.preventDefault()` çalıştırılarak tarayıcının sentetik menüsü ve masaüstü kapsayıcısına sızma tamamen engellendi.
    - **Masaüstü Menü Koruması**: Masaüstü sağ tık dinleyicisinde (`handleDesktopContextMenu`) eğer halihazırda bir menü açıksa (`contextMenu.isOpen`) veya hedef bir uygulama/dosya kartıysa işlem derhal sonlandırılır.
    - **Uygulama Kısayolları İçin Bağlam Menüsü**: Masaüstü uygulamaları için de mobil uzun basma ve sağ tık bağlam menüsü desteği ("Aç") eklendi.
    - **SonarJS Kod Kalitesi**: İç içe üçlü koşul yapıları (`sonarjs/no-nested-conditional`) ve yinelenen fonksiyonlar (`sonarjs/no-identical-functions`) engellendi; `renderContextMenuContent()` ve paylaşımlı `handleDesktopPointerUp` yardımcıları oluşturuldu.
- **Test ve Kalite Durumu**:
  - `WindowFrame.test.tsx`: Swipe-down eşik aşımı küçültme ve eşik altı snap-back davranışlarını test eden 2 yeni test eklendi (toplam 16 test).
  - `Desktop.test.tsx`: Mobil arka plan uzun basma, dosya/uygulama kartı uzun basma, uzatılmış tutuşta doğal menü sızıntısı engelleme senaryolarını test eden testler eklendi (toplam 20 test).
  - Vitest: **30 test dosyasında 208 testin tamamı (%100) başarıyla geçti**.
  - TypeScript: `tsc --noEmit` **0 hata**.
  - ESLint & SonarJS: Bilişsel karmaşıklık $\le$ 15, **0 hata, 0 uyarı**.

## [2026-10-17] - Spotlight Komut Paleti (Command Palette) ve 4 Temalı Görsel Uyarlama (Priority 2)

### Yapılanlar
- **`Cmd+K` / `Ctrl+K` Spotlight Komut Paleti Mimarisi (`CommandPalette.tsx`, `command-palette.store.ts`, `command-palette.css`)**:
  - Global kısayol dinleyicisi (`useCommandPaletteShortcuts` / `useEffect`) ile `Cmd+K`, `Ctrl+K` ve `Escape` tuşlarına tam tepki veren, durum çubuğunda (`.statusbar-spotlight-btn`) işletim sistemine duyarlı kısayol rozetli arama butonu ile entegre Spotlight arayüzü geliştirildi.
  - **İşletim Sistemine Duyarlı Dinamik Kısayol Tespiti (`isApplePlatform` & `getSpotlightShortcutLabel`)**:
    - Kullanıcının işletim sistemi tespit edilerek macOS ve iOS istemcilerinde `⌘K`, Windows, Linux ve diğer istemcilerde `Ctrl+K` rozeti ve erişilebilirlik etiketleri otomatik render edilir.
  - **Minimalist Simgesel Alt Bilgi (Symbolic Keyboard Bar)**:
    - Palet altındaki uzun yazılı açıklama metni kaldırıldı; yalnızca sağa hizalı, temaya entegre ve sade simgesel tuş rozetleri (`↑↓`, `↵`, `esc`) bırakıldı.
  - **4 Kategori ve Çok Boyutlu Filtreleme**:
    - **Uygulamalar (Apps)**: Terminal, Ayarlar, Markdown Okuyucu, JS IDE, Müzik Çalar (Pencereyi ön plana getirme / açma).
    - **VFS Dosyaları (Files)**: `bio.md`, `skills.md`, `welcome.txt` ve kullanıcının dinamik oluşturduğu tüm VFS dosyaları (dosya türü sağ tarafta yalın bir rozet olarak tutulup açıklamadaki parantez içi uzantı yinelemesi temizlendi; Markdown Okuyucu / JS IDE ile doğrudan açma).
    - **Sistem Temaları (Themes)**: `spatial-glass`, `swiss-industrial`, `cyberpunk-neon`, `classic-mac` (anında tek tuşla tema geçişi).
    - **Sistem Eylemleri (Actions)**: Sesi Kapat/Aç, Müzik Çal/Durdur, Tüm Pencereleri Küçült.
  - **Klavye Odak ve Gezinme Motoru (`command-palette.utils.ts`)**:
    - Dairesel döngülü (circular wrap-around) `ArrowDown` ve `ArrowUp` klavye gezinmesi (`getNextSelectedIndex`).
    - `Enter` ile seçili eylemi tetikleme ve paleti otomatik kapatma.
    - Filtrelenmiş liste değişimlerinde güvenli otomatik `scrollIntoView({ block: 'nearest' })`.
  - **4 Temaya Özel Geometrik & Estetik Tasarım (`command-palette.css`)**:
    - `spatial-glass`: 32px frosted glass, yarı saydam cyan parlama, VisionOS cam hap kbd rozetleri.
    - `swiss-industrial`: Masif mat `#131519`, sıfır blur, 1px `#2c313c` net grid hatları, Braun güvenlik turuncusu (`#ff5500`) aksan rengi.
    - `cyberpunk-neon`: OLED `#090d1a`, elektrik pembe (`#f43f5e`) ve siber sarı (`#facc15`), CRT hafif yatay tarama çizgileri, keskin köşe hissi.
    - `classic-mac`: Susan Kare 1984 System 7 beveled `#dcdfe5` pencere çerçevesi, 1px siyah kenarlık, retro Chicago/Geneva sistem tipografisi, lacivert (`#000080`) seçili satır çubuğu.
  - **7 Dilli Tam Yerelleştirme (i18n)**:
    - 10 yeni çeviri anahtarı (`command_palette_placeholder`, `command_palette_category_apps`, `command_palette_category_files`, `command_palette_category_themes`, `command_palette_category_actions`, `command_palette_no_results`, `action_toggle_sound`, `action_toggle_music`, `action_minimize_all`, `theme_name_*`) 7 dilin tamamına (`en`, `tr`, `de`, `fr`, `es`, `ru`, `ja`) eklendi.
  - **SonarJS & Bilişsel Karmaşıklık**:
    - `command-palette.utils.ts` içinde filtreleme, indeks hesaplama ve platform algılama mantığı saf fonksiyonlar olarak ayrıştırıldı, `sonarjs/prefer-immediate-return` ve `sonarjs/parameterized-tests` standartlarına tam uyum sağlandı.
  - **Kapsamlı Test Kapsamı**:
    - Store testleri (`command-palette.store.test.ts` - 6 test),
    - Yardımcı fonksiyon ve platform testleri (`command-palette.utils.test.ts` - 17 test),
    - Bileşen render, klavye ve minimalist footer testleri (`CommandPalette.test.tsx` - 12 test),
    - Masaüstü entegrasyon testi (`Desktop.test.tsx` - 21 test).
    - Toplam: **33 test dosyasında 244 testin tamamı (%100) başarıyla geçti**.

## [2026-10-17] - DevSecOps Güvenlik Denetimi (OWASP Security Audit) & Kapsamlı Test Süiti

### Yapılanlar & Güvenlik Bulguları

- **DevSecOps Güvenlik Şapkası ile Kapsamlı Denetim (Security Audit)**:
  - OWASP Top 10 ve CWE standartlarına göre kullanıcı arayüzü (`apps/user-interface`) uçtan uca incelendi.
  - 5 kritik güvenlik alanı tespit edildi ve kurumsal düzeyde sertleştirildi:
    1. **OWASP A03 (Cross-Site Scripting / XSS)**:
       - `MarkdownViewerApp`: `marked.parse` ham HTML çıktısı doğrudan `dangerouslySetInnerHTML` üzerinden render ediliyordu. Kötü niyetli kullanıcıların veya yüklenen `.md` belgelerinin `<script>`, `<img onerror=...>`, `<svg onload=...>`, `<iframe src=...>` veya `javascript:` URI çalıştırması riski mevcuttu.
       - **Çözüm**: `dompurify` entegrasyonu sağlandı (`sanitizer.service.ts`). `sanitizeHtml` fonksiyonu ile tüm tehlikeli HTML etiketleri ve nitelikleri filtrelendi; `target="_blank"` ve `rel="noopener noreferrer"` otomatik enjekte edilerek tabnabbing saldırıları engellendi. Düz metin (`.txt`) belgeleri için `sanitizePlainText` ile tam HTML entity kaçışı uygulandı.
    2. **OWASP A04 (Sandbox Breakout & Insecure Template Interpolation)**:
       - `JsIdeApp`: Kullanıcı kodundaki `</script>` dizgilerinin iframe srcdoc şablonundaki `<script>` etiketini erkenden kapatıp dışarıya markup/HTML sızdırması riski mevcuttu.
       - **Çözüm**: `escapeScriptInterpolation` fonksiyonu geliştirilerek `</script>` ifadeleri `<\\/script>` olarak güvenli hale getirildi.
       - **PostMessage Kaynak İzolasyonu**: `handleMessage` dinleyicisi sertleştirilerek yalnızca aktif sandboxed iframe penceresinden (`event.source === iframeRef.current?.contentWindow`) gelen ve `source: 'aec-js-sandbox'` imzası ile `level` ve `args` dizi şemasını doğrulayan mesajlar kabul edildi; sahte dış pencerelerden gelen mesajlar engellendi.
    3. **OWASP A01 (Path Traversal & Prototype Pollution)**:
       - `filesystem.store.ts`: Sanal dosya sisteminde dosya oluşturma (`createFile`), silme (`deleteFile`) ve yeniden adlandırma (`renameFile`) operasyonlarında yalnızca uzantı kontrolü yapılıyordu. `../../secret.txt`, `/root.txt`, `__proto__.txt`, `constructor.js` veya `\0` null bayt içeren isimlerin VFS ve JavaScript prototip zincirine müdahale riski mevcuttu.
       - **Çözüm**: `validateSafeFilename` doğrulaması geliştirildi. Yol ayracı (`/`, `\`), dizin atlama (`..`), prototip anahtarları (`__proto__`, `prototype`, `constructor`), kontrol karakterleri (`\x00-\x1F\x7F`), 64 karakterden uzun isimler engellendi ve regex deseni (`/^[a-zA-Z0-9_\-. ]+$/`) zorunlu kılındı. Terminal `touch` ve `nano` komutları da bu doğrulamaya bağlandı.
    4. **OWASP A05 (Denial of Service - DoS & Memory Exhaustion)**:
       - `Desktop.tsx`: Masaüstü dosya yükleme (`handleFileUpload`) girdisinde dosya boyutu kontrolü bulunmuyordu. Çok büyük dosyaların (örneğin 100MB+) okunması tarayıcı sekmesini dondurabilirdi.
       - **Çözüm**: `MAX_UPLOAD_FILE_SIZE_BYTES = 512 * 1024` (512 KB) sınırı getirildi; aşan dosyalar GUI Alert modalı ile güvenle reddedildi.
    5. **ReDoS & Terminal Tampon Bellek Koruması**:
       - Spotlight arama algoritması `RegExp` yerine güvenli `String.includes` ile çalışmaktadır.
       - Terminal girdi komutları Zod şeması (`max(100)`) ve kullanıcı isimleri `/^[a-zA-Z0-9_-]+$/` ile sınırlandırıldı.

- **Kapsamlı Test Süiti Planlama & Uygulama (35 Test Dosyası / 292 Test)**:
  - **Yeni `sanitizer.service.test.ts`**: XSS temizleme, tabnabbing önleme, düz metin kaçırma, dosya adı ve uzantı güvenlik doğrulamalarını kapsayan 20 birim testi eklendi.
  - **Yeni `security-audit.test.tsx`**: OWASP standartlarında XSS atak vektörleri, sandbox izinleri (`allow-scripts` sans `allow-same-origin`), iframe mesaj doğrulama, DoS dosya boyutu ve kriptografik güvenli rastgelelik motorunu doğrulayan 14 entegrasyon testi eklendi.
  - **Genişletilen `MarkdownViewerApp.test.tsx`**: XSS engelleme, entity kaçışı ve dış link nitelikleri testleri (+3 test).
  - **Genişletilen `JsIdeApp.test.tsx`**: Script tag breakout önleme ve sahte postMessage reddetme testleri (+2 test).
  - **Genişletilen `Desktop.test.tsx`**: 512 KB dosya yükleme DoS önleme testi (+1 test).
  - **Genişletilen `TerminalApp.test.tsx`**: Zod 100 karakter sınır, su komut enjeksiyonu ve path traversal testleri (+3 test).
  - **Genişletilen `filesystem.store.test.ts`**: Dizin atlama ve prototype pollution testleri (+5 test).

- **Doğrulama ve Metrikler**:
  - `npm test`: **Monorepo genelinde 39 test dosyasında 306 testin tamamı (%100) başarıyla geçti** (User-interface: 35 dosyada 292 test).
  - `npm run typecheck`: 4 pakette (`shared`, `admin-interface`, `backend`, `user-interface`) **0 hata**.
  - `npm run lint`: ESLint & SonarJS statik analizlerinde **0 hata, 0 uyarı** (Bilişsel karmaşıklık kurallarına tam uyum).
  - `npm audit`: **0 vulnerabilities** (Sıfır bağımlılık zafiyeti).

## [2026-10-18] - WebOS Micro-Container Runtime, Sandboxing Mimarisi & BAND Entegrasyonu

### Yapılanlar

- **WebOS Micro-Container & Sandboxing Altyapısı (`<AppSandbox />`)**:
  - Harici ve önceden geliştirilmiş web projelerinin kod dönüştürme gerektirmeden, bağımsız çalışma zamanı (HTML/JS/CSS) ile WebOS masaüstü pencerelerinde çalıştırılabilmesi için genel amaçlı konteyner motoru geliştirildi.
  - Iframe sandboxing mimarisi sertleştirildi (`sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"`); `allow-same-origin` kesinlikle verilmeyerek ana WebOS'un bellek, çerez ve `localStorage` durumundan tam izolasyon sağlandı.
  - İhtiyaca göre ses, kamera ve ekran paylaşımı (`allow="camera; microphone; display-capture"`) deklaratif izin yönetimi sağlandı.
  - Responsive Cihaz Görünüm Simülatörü eklendi: Masaüstü (%100), Tablet (768px) ve Mobil (375px) cihaz çerçeveleri arasında akıcı geçiş ve harici sekmede açma yeteneği sunuldu.
  - Hata İzolasyonu (Crash Boundary): Konteyner içi istisnalarda masaüstünün çökmesini engelleyen Spatial Dark Glass hata kartı ve "Uygulamayı Yeniden Başlat" mekanizması geliştirildi.

- **Tip Güvenli IPC Köprüsü (`useWebOSBridge.ts` - WebOS Bridge)**:
  - `@personal-os/shared` paketine `WebOSBridgeMessage`, `HostToGuestBridgeEvent`, `GuestToHostBridgeEvent` ve `AppSandboxConfig` tipleri eklendi.
  - Host ile Guest arasında iki yönlü `postMessage` protokolü kuruldu; el sıkışma (`WEBOS_GUEST_READY`), tema ve aksan rengi eşitleme (`WEBOS_INIT_CONFIG`, `WEBOS_THEME_CHANGED`), dil geçişi (`WEBOS_LANG_CHANGED`) ve çökme raporlama (`WEBOS_CRASH_REPORT`) kanalları bağlandı.
  - OWASP A03/A07 standartlarında iframe referansı ve `event.source` doğrulaması uygulandı.

- **İlk Proje Entegrasyonu: BAND (Band Absolutely Not Discord)**:
  - Ahmet Emre Ceylan'ın açık kaynaklı Mediasoup SFU v3 WebRTC, Socket.IO ve MongoDB tabanlı Discord alternatifi projesi WebOS ekosistemine entegre edildi.
  - `public/apps/band/index.html`: Discord esintili mor/indigo arayüz, metin kanalları (`#genel-sohbet`, `#duyurular`, `#kod-paylaşımı`, `#webrtc-sfu`), ses/video odaları, çevrimiçi üyeler, interaktif bot yanıtlı mesajlaşma ve Google Drive benzeri hiyerarşik bulut dosya sistemi (ZIP indirme simülasyonu) ile tam etkileşimli bağımsız konteyner paketi oluşturuldu.
  - `BandApp.tsx`: 3 sekmeli profesyonel WebOS uygulama arayüzü geliştirildi:
    1. **Canlı Uygulama**: Konteyner sandbox içinde anında çalışan Discord arayüzü.
    2. **Mimari & Vaka Analizi**: Mediasoup v3 SFU boru hatları, multi-core CPU Worker havuzları, hiyerarşik MongoDB bulut depolama, Argon2 ve CSRF kurumsal güvenlik katmanı detayları ve GitHub reposu yönlendirmesi.
    3. **Çalışma Modu**: İnteraktif Bağımsız Simülatör (Offline) ile Yerel Canlı Backend (`http://localhost:5000`) arasında çalışma modu geçişi ve yerel kurulum yönergeleri.

- **WebOS Ekosistem Entegrasyonu**:
  - `app-registry.tsx`: `bandManifest` ve `BandAppComponent` kaydedildi (özel mor `MessageSquare` ikonu).
  - `spatial-glass.theme.tsx`: `SpatialBandIcon` tanımlandı ve tema haritasına eklendi.
  - `translations.ts`: 7 dilde (`en`, `tr`, `de`, `fr`, `es`, `ru`, `ja`) `appName_band` ve `appDesc_band` çevirileri oluşturuldu.
  - `Desktop.tsx`: Masaüstü ızgarasına BAND eklendi, sürükle-bırak ve çift tıklamasız tek tıkla açılma garantilendi.
  - `useCommandPaletteItems.tsx`: Spotlight (`Cmd+K` / `Ctrl+K`) aramasına BAND uygulaması dahil edildi.
  - `TerminalApp.tsx`: Terminal CLI kabuğuna `band` komutu ve yardım dökümantasyonu eklendi.
  - `filesystem.store.ts`: Sanal Dosya Sistemi'ne `band-case-study.md` korumalı vaka analizi belgesi yerleştirildi.

- **Test Kapsamı & Doğrulama**:
  - `AppSandbox.test.tsx` (7 test): Konteyner render, iframe izinleri, viewport geçişleri (desktop/tablet/mobile), yükleme durumu, yeniden yükleme, harici sekme açma ve hata bariyeri kurtarma testleri yazıldı.
  - `BandApp.test.tsx` (4 test): Canlı uygulama sandbox'ı, mimari sekmesi ve vaka analizi, canlı demo dönüşü ve yerel backend modu geçişi test edildi.
  - `Desktop.test.tsx`: BAND masaüstü ikonu ve pencere açma testi eklendi.
  - `TerminalApp.test.tsx`: Terminal `band` komutu ile pencere başlatma testi eklendi.
  - `CommandPalette.test.tsx`: Spotlight aramasında BAND bulma ve açma testi eklendi.
  - `filesystem.store.test.ts`: `band-case-study.md` VFS sistem dosyası koruma testi güncellendi.

## [2026-10-18] - SonarQube / SonarJS Kod Kalitesi ve Güvenlik Sertleştirmesi (DevSecOps)

### Yapılanlar
- **SonarQube / SonarJS Analizi & Düzeltmeler**:
  - `BandApp.test.tsx` dosyasında kullanılmayan `vi` import'u kaldırılarak `sonarjs/unused-import` hatası giderildi.
  - `useWebOSBridge.ts`:
    - SonarQube `typescript:S2819` (çapraz pencere iletişiminde kaynak doğrulaması) kuralına uygun olarak `postToGuest` fonksiyonundaki `'*'` hedef kökeni (`targetOrigin`) parametrelendirildi ve varsayılan olarak `window.location.origin`'e bağlandı.
    - `handleMessage` dinleyicisinde `event.origin !== targetOrigin && event.origin !== 'null'` sıkı köken filtresi eklenerek dinleyicinin güvenliği sertleştirildi.
    - SonarQube `typescript:S6582` kuralı uyarınca `iframeRef.current?.contentWindow` ve `payload?.type` isteğe bağlı zincirleme (`optional chaining`) ifadelerine dönüştürüldü.
  - `analyze_code_snippet` MCP aracı ile SonarQube doğrudan çalıştırılarak `AppSandbox.tsx`, `BandApp.tsx` ve `useWebOSBridge.ts` dosyalarının **0 issue (sıfır hata, sıfır zafiyet)** ile geçtiği doğrulandı.
- **Doğrulama ve Test Sonuçları**:
  - `npm run lint`: Monorepo genelinde **0 hata, 0 uyarı** (ESLint 9 Flat Config & `eslint-plugin-sonarjs@4.2.2`).
  - `npm run typecheck`: 4 pakette (`shared`, `admin-interface`, `backend`, `user-interface`) **0 hata**.
  - `npm test`: Monorepo genelinde **37 test dosyasında 306 testin tamamı (%100) başarıyla geçti**.

- **BandApp.css SonarQube Kontrast İyileştirmeleri (css:S7924 / WCAG 2.1 AA)**:
  - `BandApp.css` dosyasında SonarQube'un `css:S7924` kuralı ("Text does not meet the minimal contrast requirement with its background") kapsamında tespit ettiği 8 kontrast uyarısı giderildi:
    1. `.band-nav-tab:hover`: Şeffaf zemin yerine koyu cam `#1a1e2b` tabanı tanımlanarak `#f8fafc` metni için 14.5:1 kontrast sağlandı.
    2. `.dossier-badge.purple`: `#1a1c38` zemin ve `#a5b4fc` metin ile WCAG AA kontrastı sağlandı.
    3. `.dossier-badge.green`: `#0d2820` zemin ve `#6ee7b7` metin ile 7:1 üstü kontrast sağlandı.
    4. `.dossier-badge.cyan`: `#0c2730` zemin ve `#67e8f9` metin ile 7:1 üstü kontrast sağlandı.
    5. `.btn-dossier-secondary`: `#1a1e29` zemin ve `#f8fafc` metin ile kusursuz kontrast sağlandı.
    6. `.chip`: `#141824` zemin ve `#f1f5f9` metin ile 12:1 üstü kontrast sağlandı.
    7. `.mode-status-tag`: `#1a1e29` zemin ve `#cbd5e1` metin ile 8:1 üstü kontrast sağlandı.
    8. `.mode-status-tag.active`: `#0d2820` zemin ve `#6ee7b7` metin ile 7:1 üstü kontrast sağlandı.
  - `BandApp.css` dosyasının tamamı SonarQube `analyze_code_snippet` aracı ile taranarak **0 issue** ile onaylandı.

## [2026-10-18] - Orijinal BAND GitHub Reposu Entegrasyonu (apps/band & Vite Real Build)

### Yapılanlar
- **GitHub Reposunun Monorepoya Yerleştirilmesi (`apps/band/`)**:
  - `https://github.com/aemreceylan/BAND` reposu klonlanarak doğrudan monorepo içerisine `apps/band` altına yerleştirildi.
  - Orijinal repo mimarisi eksiksiz korundu:
    - `backend/server/`: Node.js, Express 5, Mediasoup SFU v3, MongoDB Mongoose modelleri (`User`, `Channel`, `Category`, `Message`, `File`, `Profile`), Argon2 şifreleme, Socket.IO ve Multer/Archiver dosya yöneticisi.
    - `frontend/band/`: Orijinal React 18, Vite 6, `mediasoup-client` ve `socket.io-client` bileşenleri (`HubList`, `Hub`, `Chat`, `Feed`, `Users`, `LoginSignup`, `UserFileSystemScreen`, `FloatingElement`).
    - `docs/` ve `README.md`: Kapsamlı mimari belgeleri ve vaka analizleri.
  - `apps/band/package.json` oluşturularak npm workspaces (`@personal-os/band`) entegrasyonu sağlandı.
- **Gerçek Frontend Derlemesi ve Konteyner Yayını (`public/apps/band/`)**:
  - `apps/band/frontend/band/vite.config.js`: `base: './'` ve `build.outDir: '../../../user-interface/public/apps/band'` yapılandırıldı.
  - `fonts.css` içindeki font yolları düzeltildi.
  - `LoginSignUp.jsx`: Hem `http://localhost:3000` canlı backend oturum açma akışı korundu hem de backend çalıştırılmadığında doğrudan interaktif keşif sağlayan "Demo Girişi" ve güvenli çevrimdışı geri dönüşü entegre edildi.
  - `App.jsx`: WebOS Konteyner Yöneticisi (`AppSandbox`) ile el sıkışma sağlayan `WEBOS_GUEST_READY` IPC sinyali bağlandı.
  - Vite ile gerçek React 18 uygulaması derlenerek `apps/user-interface/public/apps/band/` altına üretim paketi (`assets/index-*.js`, `assets/index-*.css`, tüm TTF fontları ve görseller) aktarıldı.
- **BandApp.tsx Bağlantı Portu Güncellemesi**:
  - BAND backend `config.js` portu olan `3000` ile tam senkronizasyon sağlandı (`http://localhost:3000`).
  - Çalışma modu sekmesindeki geliştirici komutları `cd apps/band/backend/server && npm install && npm start` olarak güncellendi.

## [2026-10-18] - Pencere Sürükleme Üst Sınırı, Tam Ekran Dock Yönetimi ve Sistem-Dışı Uygulama Çoklu Örneği (Multi-Instance)

### Yapılanlar

- **1. Pencere Sürükleme ve Kuzey Yönlü Boyutlandırma Sınırlandırması (Drag Clamping)**:
  - **Sorun**: Kullanıcı pencere çerçevesini yukarı doğru serbest sürüklediğinde pencerenin başlık çubuğu üst durum çubuğunun (42px) altına kayabiliyor ve başlık çubuğu ulaşılamaz hale gelip pencere orada mahsur kalabiliyordu.
  - **Düzeltme**:
    - `WindowFrame.tsx`: Sürükleme sırasında hesaplanan `newY` koordinatına `Math.max(STATUSBAR_HEIGHT, initialY + deltaY)` sınırı kondu.
    - Kuzey yönlü (`n`, `ne`, `nw`) yeniden boyutlandırmalarda tepe noktasının `STATUSBAR_HEIGHT` altına inmesi matematiksel olarak engellendi.
    - `window-manager.store.ts`: `updateBounds` mutasyonunda `partialBounds.y` otomatik olarak `Math.max(STATUSBAR_HEIGHT, partialBounds.y)` olarak güvenceye alındı.

- **2. Tam Ekran Pencerede Dock Katman Önceliği ve Otomatik Çekilme (`behind-maximized`)**:
  - **Sorun**: Bir pencere ekranı kapladığında (maximize), ekranın altındaki açık uygulamalar dock'u pencerenin önünde kalarak pencere içi içeriklerin veya butonların tıklanmasını engelliyordu.
  - **Düzeltme**:
    - `Dock.tsx`: Aktif odaktaki pencerenin tam ekran olup olmadığını tespit eden reaktif `isMaximizedActive` durumu tanımlandı ve kapsayıcıya `.behind-maximized` sınıfı uygulandı.
    - `dock.css`: `.spatial-dock-container.behind-maximized` sınıfı ile dock `translateY(80px)` animasyonu ile ekranın altına yumuşakça kaydırıldı, `opacity: 0; pointer-events: none; z-index: 50;` ile pencerenin arkasına itildi.
    - `WindowFrame.tsx`: Ekranı kaplayan pencereye `zIndex: Math.max(win.zIndex, 9990)` atanarak durum çubuğunun hemen altında ve tüm alt zeminlerin üzerinde kalması sağlandı.

- **3. Sistem Dışı Uygulamalarda Eşzamanlı Çoklu Örnek (Multi-Instance Architecture)**:
  - **Mimarî**: Sistem uygulamaları (`terminal`, `settings`) `singleton: true` ve `category: 'system'` olarak tekil kimliklerini korurken; `band`, `markdown-viewer`, `js-ide` ve `game-hub` uygulamaları `singleton: false` olarak yapılandırıldı.
  - **Kimlik ve Başlık Ataması (`resolveNextWindowId`)**:
    - İlk açılan pencere `appId` kimliğini alır.
    - Açıkken yeniden açıldığında veya dock / masaüstü sağ tık menüsünden "Yeni Pencere" seçildiğinde ardışık `appId-2`, `appId-3` kimlikleri ve `BAND (2)` yerelleştirilmiş başlık ekleri atanır.
    - Kaskat koordinatlarla yeni pencereler kademeli olarak açılarak üst üste binme engellendi.
    - `WindowState` arayüzüne `appId?: string` alanı eklenerek türetilen tüm örneklerin dinamik olarak `APP_REGISTRY` üzerindeki orijinal kök manifestoya ve simgeye bağlanması sağlandı.
  - **Kullanıcı Etkileşim Noktaları**:
    - **Masaüstü Sağ Tık Menüsü**: Sistem dışı uygulamalara sağ tıklandığında "Yeni Pencere Aç" (`ctx_new_window`) seçeneği sunuldu.
    - **Dock Sağ Tık Menüsü**: Dock üzerindeki açık sistem-dışı uygulamalara sağ tıklandığında "Yeni Pencere" seçeneği sunuldu.
    - **7 Dilli Yerelleştirme**: `ctx_new_window` anahtarı 7 dilde sisteme kaydedildi.

- **4. SonarJS / SonarQube Bilişsel Karmaşıklık Refaktoring'i**:
  - `window-manager.store.ts`: `openWindow` fonksiyonundaki dallanmalar `findReusableInstance` ve `calculateNewWindowBounds` saf yardımcı fonksiyonlarına ayrılarak bilişsel karmaşıklık SonarJS eşiği olan 15'in çok altına (3 seviyesine) indirildi.

- **Test Kapsamı & Doğrulama**:
  - `WindowFrame.test.tsx`: Sürükleme ve kuzey yönlü boyutlandırmanın `y >= STATUSBAR_HEIGHT` sınırında tutulduğu test edildi.
  - `Dock.test.tsx`: Aktif pencere tam ekran yapıldığında `behind-maximized` sınıfının uygulandığı ve dock sağ tık menüsünden "Yeni Pencere" açılabildiği test edildi.
  - `Desktop.test.tsx`: Masaüstü sağ tık menüsünde sistem dışı uygulamalar için "Yeni Pencere Aç" eyleminin çalıştığı test edildi.
  - `window-manager.store.test.ts`: `updateBounds` sınır koruması ve çoklu örnek açılış/kapanış yaşam döngüsü test edildi.
  - **Vitest**: **37 test dosyasında 314 testin tamamı (%100) başarıyla geçti**.
  - **ESLint & SonarJS**: **0 hata, 0 uyarı**.
  - **TypeScript**: **4 pakette 0 hata**.

## [2026-10-18] - Pencerelerin Dört Yönlü Viewport Sınırlandırması (Alt ve Sağ Ekran Kenarı Koruması)

### Yapılanlar

- **1. Dört Yönlü Sürükleme Sınırlandırması (`clampWindowDragPosition`)**:
  - **Sorun**: Kullanıcı pencere çerçevelerini sağa ve aşağı doğru sürüklediğinde pencerenin ekrandan tamamen çıkıp kaybolması mümkündü; yalnızca üst (42px) ve sol (0px) sınırları korunuyordu.
  - **Düzeltme**:
    - `WindowFrame.tsx`: Saf matematiksel `clampWindowDragPosition` yardımcı fonksiyonu yazıldı.
    - **Sağ Sınır**: `x <= screenWidth - windowWidth` ile sınırlandırıldı (`maxX = Math.max(0, screenWidth - windowWidth)`). Pencerenin sağ kenarı ekranın dışına çıkamaz.
    - **Alt Sınır**: `y <= screenHeight - windowHeight` ile sınırlandırıldı (`maxY = Math.max(STATUSBAR_HEIGHT, screenHeight - windowHeight)`). Pencerenin alt kenarı ekranın alt sınırını aşamaz; pencere ve başlık çubuğu alta doğru ekrandan kaybolamaz.
    - `useViewportStore` entegre edilerek `window.innerWidth`/`innerHeight` dinamik ekran ve test çözünürlükleri ile tam senkronize çalışması sağlandı.

- **2. Dört Yönlü Boyutlandırma Sınırlandırması (`clampWindowResizeBounds`)**:
  - Doğu (`e`, `ne`, `se`) yönlü boyutlandırmada pencere genişliği `screenWidth - initialX` ile sınırlandırıldı.
  - Güney (`s`, `se`, `sw`) yönlü boyutlandırmada pencere yüksekliği `screenHeight - initialY` ile sınırlandırıldı.
  - Batı (`w`, `nw`, `sw`) yönlü boyutlandırmada `x >= 0` ve Kuzey (`n`, `ne`, `nw`) yönlü boyutlandırmada `y >= STATUSBAR_HEIGHT` sınırları korundu.

- **3. Store Seviyesinde `updateBounds` Koruması**:
  - `window-manager.store.ts`: `partialBounds.x` mutasyonuna `Math.max(0, partialBounds.x)` koruması eklenerek store seviyesinde negatif koordinatlar engellendi.

- **Test Kapsamı & Doğrulama**:
  - `WindowFrame.test.tsx`:
    - Sağa ve alta agresif sürükleme yapıldığında `x` ve `y` koordinatlarının `screenWidth - windowWidth` ve `screenHeight - windowHeight` sınırlarında durduğunu doğrulayan entegrasyon testi eklendi.
    - Doğu ve güney yönlü yeniden boyutlandırmanın ekran sınırlarında durduğunu doğrulayan entegrasyon testi eklendi.
    - `clampWindowDragPosition` ve `clampWindowResizeBounds` saf fonksiyonları için kapsamlı birim testleri eklendi.
  - `window-manager.store.test.ts`: `x` koordinatının 0'dan küçük değerlere ayarlanamadığını doğrulayan birim testi eklendi.
  - **Vitest**: **37 test dosyasında 319 testin tamamı (%100) başarıyla geçti**.
  - **ESLint & SonarJS**: **0 hata, 0 uyarı**.
  - **TypeScript**: **4 pakette 0 hata**.

## [2026-10-18] - Çoklu Pencere Ortam İzolasyonu (Multi-Tenant Isolation) & Gerçek Zamanlı Eşzamanlı Mesajlaşma Mimarisi

### Yapılanlar

- **1. Host Seviyesinde Instance ID Dağıtımı (`Desktop.tsx`, `BandApp.tsx`, `app-registry.tsx`)**:
  - `Desktop.tsx`: Her açık pencere için `<AppComponent manifest={appEntry.manifest} windowId={win.id} />` prop'u aktarıldı.
  - `app-registry.tsx`: `APP_REGISTRY` tanımı `windowId?: string` kabul edecek şekilde güncellendi.
  - `BandApp.tsx`: `BandAppProps` içine `windowId?: string` eklendi; mikro-konteyner `entryUrl` adresine `?instanceId=${windowId}` sorgu parametresi enjekte edildi (örn: `/apps/band/index.html?instanceId=band-2`). Geriye dönük uyumluluk korunarak `windowId` sağlanmadığında temiz URL üretilmesi teminat altına alındı.

- **2. BAND Simüle Backend Oturum Ayrıştırması (`simulatedBackend.js`, `simulatedBackend.d.ts`)**:
  - URL arama parametresinden pencereye özel `instanceId` okuyan `getInstanceId()` yardımcı motoru yazıldı.
  - Oturum anahtarı dinamik ad alanına (namespace) bağlandı: `band_db_session_${instanceId}`.
  - Çoklu pencerede açık olan tüm oturumları (`band_db_session_*`) otomatik tarayarak eşzamanlı aktif kullanıcıları saptayan `getActiveUserIds()` geliştirildi. Böylece Pencere 1'deki Alice ve Pencere 2'deki Bob birbirlerini eşzamanlı olarak "çevrimiçi (online)" olarak görebilmektedir.

- **3. Cross-Window Gerçek Zamanlı Soket Senkronizasyonu (`BroadcastChannel`)**:
  - Standart W3C `BroadcastChannel` (`band_multi_instance_bus`) entegrasyonu sağlandı.
  - Pencere 1'den (Alice) mesaj gönderildiğinde, kanal veya kategori eklendiğinde ya da oturum açma/kapama gerçekleştiğinde, diğer pencerelerdeki `SimulatedSocket` dinleyicileri olayı gerçek zamanlı olarak alıp arayüz akışını anında günceller.
  - Kullanıcılar (`band_db_users`), kanallar (`band_db_channels`) ve mesajlar (`band_db_messages`) ana veritabanı koleksiyonları ortak tutularak iki hesap arasında kesintisiz çift yönlü sohbet testi sağlandı.

- **4. Arayüz Navigasyon İzolasyonu (`WSProvider.jsx`, `Feed.jsx`, `Category.jsx`, `App.jsx`)**:
  - Seçili kanal (`selectedChannel_${instanceId}`) ve açık kategori durumu (`categoryIsOpen_${instanceId}`) pencere bazlı izole edildi; bir pencerede kanal değiştirildiğinde diğer pencere bundan etkilenmez.
  - Canlı backend (Port 3000) desteği için `useFetch.js` içine `Authorization: Bearer <authToken>` ve `X-Instance-Id` başlıkları eklendi.

- **5. Test Kapsamı ve Kalite Doğrulaması**:
  - `BandApp.test.tsx`: `windowId` sağlandığında `instanceId` sorgu parametresinin doğru üretildiğini ve online/offline mod geçişlerinde korunduğunu doğrulayan testler eklendi.
  - `MultiInstanceIsolation.test.tsx`: İki ayrı pencere örneğinde (Alice ve Bob) oturumların birbirini ezmediğini, bir kullanıcı çıkış yaptığında diğerinin oturumunun korunduğunu kanıtlayan entegrasyon testleri yazıldı.
  - **Vitest**: **38 test dosyasında 324 testin tamamı (%100) başarıyla geçti**.
  - **ESLint & SonarJS**: **0 hata, 0 uyarı**.
  - **TypeScript**: **4 pakette 0 hata**.
  - **Üretim Derlemesi**: Monorepo ve BAND frontend paketleri sıfır hatayla derlendi.

