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
- **GitHub Actions CI/CD & GHCR Entegrasyonu (`.github/workflows/deploy.yml`)**:
  - `main` dalına push yapıldığında GitHub runner üzerinde Docker Buildx ile derleme yapan ve `ghcr.io/aemreceylan/portfolio-website/backend:latest` imajını GHCR'a yükleyen iş akışı yazıldı.
  - İkinci aşamada sunucuya SSH bağlantısı kurarak sadece `docker compose pull backend` ve `docker compose up -d backend` çalıştıran, sunucuyu derleme yükünden kurtaran dağıtım mimarisi kuruldu.
  - `docker/docker-compose.yml` dosyasına `image: ghcr.io/aemreceylan/portfolio-website/backend:latest` tanımı eklendi.
- **Test ve Kalite Durumu**:
  - `apps/backend/src/app.test.ts`: Ephemeral port üzerinde çalışan 4 birim ve entegrasyon testi eklendi.
  - `npm run test`: Monorepo genelinde **15 test dosyasında 88 testin tamamı (%100) başarıyla geçti** (8 shared, 4 backend, 84 user-interface).
  - `npm run typecheck`: Monorepo genelinde 0 hata.
  - `npm run lint`: ESLint ve SonarJS kontrollerinde **0 hata, 0 uyarı**.
  - `npm run build`: `@personal-os/backend` ve `@personal-os/user-interface` sorunsuz derlendi.





