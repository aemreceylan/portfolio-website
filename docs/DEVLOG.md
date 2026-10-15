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











