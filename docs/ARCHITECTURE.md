# NovaOS / AEC Portfolio — Mimari & Konsept Belgesi

## 1. Vizyon ve Tasarım Felsefesi
Bu proje, klasik statik portfolyo sitelerinin ötesine geçen, modern bir bilgisayar mühendisinin yeteneklerini, sistem düşüncesini ve kod kalitesini sergileyen **Spatial Dark Glass (VisionOS & Linear esintili)** bir masaüstü web deneyimidir (**AEC Portfolyo**).

* **Marka / Kimlik**: Fiktif OS yerine doğrudan geliştirici kimliği: **AEC** (Ahmet).
* **Estetik**: Derin koyu tonlar (`#060709`, `#0a0c10`), katmanlı buzlu cam (`backdrop-filter: blur(24px)`), aurora ışık huzmeleri ve mikro-interaksiyonlar.
* **İşlevsel Sadelik**: Yalnızca çalışan ve amaca hizmet eden arayüz elemanları; sahte/dekoratif widget'lar (wifi, pil vb.) kaldırılmıştır.
* **Aktif Uygulama Kapsamı**: Sistem 4 kararlı ve amaca odaklı çekirdek uygulama içerir:
  - **Terminal (`terminal`)**: Linux CLI (`ls`, `cat`, `touch`, `rm`, `su`, `exit`), VFS entegrasyonu ve tam ekran GNU nano editörü.
  - **Ayarlar (`settings`)**: Sistem tercihleri, 7 dilli yerelleştirme, 4 koyu spatial duvar kağıdı ve dinamik akıcı tema rengi motoru.
  - **Markdown Okuyucu (`markdown-viewer`)**: `marked` motoru ile zengin HTML derleme, sekme yönetimi, canlı Önizleme ve Ham Kaynak Kodu modları.
  - **JavaScript IDE (`js-ide`)**: Satır numaralı kod stüdyosu, izole iframe sandbox çalıştırma ve gerçek zamanlı konsol günlüğü.
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

## 7. Sanal Dosya Sistemi (VFS) & GNU nano Mimarisi

* **VFS Katmanı (`filesystem.store.ts`)**:
  - WebOS genelinde paylaşılan, bellek içi reaktif sanal dosya sistemi.
  - **Uzantı Kısıtlaması**: Zod ve tip koruması ile yalnızca `.txt`, `.md`, `.js` uzantılı dosyalar oluşturulabilir.
  - **Sistem Dosyaları Koruması**: `bio.md`, `skills.md`, `contact.md`, `welcome.txt` dosyaları `isSystem: true` olarak işaretlenmiştir ve silinemez.
  - **Hata Ayrıştırması (Terminal vs GUI)**:
    - Terminal komut satırından silme denemesinde doğrudan terminal içi hata çıktısı verilir (`rm: cannot remove '...': Protected system file`).
    - Grafik arayüzden (Desktop veya buton) silme denemesinde ise Spatial Dark Glass Alert Modal dialog gösterilir.
* **Terminal Geçmişi Değişmezliği (Static Terminal Buffer)**:
  - `ls` komutu çalıştırıldığında o anki dosya listesini terminal satırlarına statik metin olarak ekler.
  - Arayüzden dosya eklenip silinse bile geçmiş `ls` çıktıları asla geriye dönük mutasyona uğramaz; yalnızca yeni `ls` komutu girildiğinde güncel durum yazdırılır.
* **GNU nano Editörü**:
  - `nano <dosya>` komutu terminal pencerisini anında nano moduna geçirir (`GNU nano 7.2`).
  - `^O WriteOut` (`Ctrl+O` / `Ctrl+S`) ile VFS dosyası kaydedilir, `^X Exit` (`Ctrl+X` / `Esc`) ile terminal kabuğuna dönülür.

---

## 8. Güvenlik, Zod & DevSecOps İzolasyonu

* **JavaScript Sandboxed Runner Güvenliği**:
  - `js-ide` içindeki kod çalıştırma mantığı, OWASP standartlarına uygun olarak `<iframe sandbox="allow-scripts" srcDoc={...} />` yapısı ile izole edilir.
  - `allow-same-origin` kesinlikle **verilmez**. Bu sayede kullanıcı kodunun ana pencereye, çerezlere, `localStorage`'a veya DOM'a erişmesi imkansızdır.
  - `window.parent.postMessage` köprüsü üzerinden sadece `console.log`, `warn`, `error` ve çalışma süreleri ana uygulamaya güvenli iletilir.
* **Çalışma Zamanı Güvenliği**: Terminal komutları, argümanları ve kullanıcı isimleri (`su <user>`) Zod şemaları ile doğrulanır.
* **DevSecOps Standardı**: `npm audit` sıfır zafiyet garantisi ile denetlenir.

---

## 9. Masaüstü Sağ Tık Menüsü, JS IDE Hata Tanılama & Vektör Bayrak Motoru

* **Masaüstü Sağ Tık (Context Menu) Mimarisi**:
  - Masaüstü boşlukları ve dosya kartları üzerinde fare sağ tıklama eylemleri yakalanır (`onContextMenu`).
  - Dosya kartları üzerindeki doğrudan hover silme butonları kaldırılarak tüm dosya operasyonları (Aç, Yeniden Adlandır, Sil, Yeni Dosya, Dosya Yükle) bağlamsal menüye taşınmıştır.
  - Korumalı sistem dosyaları (`bio.md`, `skills.md`, `contact.md`, `welcome.txt`) sağ tık menüsünden silinmek istendiğinde Spatial Alert güvenlik uyarısı tetiklenir.
  - Yerel diskten dosya yükleme `FileReader` API ile okunarak VFS deposuna dinamik olarak yazılır.
* **JavaScript IDE Çoklu Dosya & Hata Tanılama Mimarisi**:
  - `JsIdeApp` sekme sistemi VFS store ile senkronize dinamik bir betik yöneticisi içerir. `+` butonu ile yeni `.js` dosyaları oluşturulabilir.
  - **İki Katmanlı Hata Yakalama**:
    1. **Pre-execution Syntax Validation**: Kod çalıştırılmadan önce `new Function(code)` denetiminden geçer. Hatalı sözdiziminde (örn. eksik parantez, yanlış belirteç) kod çalıştırma engellenir; toolbar üzerinde kırmızı `🚨 Sözdizimi Hatası` göstergesi ve konsolda satır içi hata basılır.
    2. **Runtime Error Sandboxing**: İframe sandbox içinde `window.onerror` ve `window.onunhandledrejection` dinleyicileri çalışarak çalışma zamanı istisnalarını güvenle ana ekrana aktarır.
* **Vektör SVG Bayrak Motoru (`LanguageFlag`)**:
  - İşletim sistemine (özellikle Windows Segoe UI Emoji) bağımlı emoji gliflerinin ülke kısaltmalarına dönüşmesi ve dil kodlarıyla yinelenmesi engellenmiştir.
  - 7 ulusal bayrak saf SVG geometrileri ve resmi renk kodlarıyla `LanguageFlag` bileşeninde render edilir.
* **Tema ve Başlık Çubuğu Renk Senkronizasyonu**:
  - Masaüstü duvar kağıtları `var(--wallpaper-bg)` dinamik değişkeni ile 0.6s akıcı bezier geçişiyle değişir.
  - Pencere başlık çubuğu (`.window-titlebar`) seçili aksan rengine göre `rgba(var(--accent-rgb), ...)` ile dinamik gradyan ve kenarlık parıltısı kazanır.

---

## 10. Pencere Sağ Tık İzolasyonu, Gerçek IDE Sekme Mimarisi & İki Yönlü Markdown Düzenleyicisi

* **Pencere & Masaüstü Sağ Tık Olay Yayılımı İzolasyonu**:
  - Masaüstü bağlam menüsü yalnızca doğrudan masaüstü arka planına tıklandığında tetiklenir; pencerelerin çerçevelerine veya içeriklerine sağ tıklandığında masaüstü menüsünün açılması `.window-container` ve `.dock-container` kontrolleri ile kesin olarak engellenir.
  - **Pencere Başlık Çubuğu Menüsü (`WindowFrame.tsx`)**: `.window-titlebar` üzerine sağ tıklandığında pencereye özgü işletim sistemi menüsü (`Kapat`, `Simge Durumuna Küçült`, `Ekranı Kapla / Önceki Boyuta Getir`) görüntülenir.
  - **Uygulama İçi Doğal Tarayıcı Menüsü**: `.window-content` kapsayıcısında `onContextMenu` üzerinde `e.stopPropagation()` uygulanırken `preventDefault()` çağrılmaz; böylece masaüstü menüsü engellenirken tarayıcının yerel metin kopyalama, yapıştırma ve inceleme sağ tık menüsü doğal biçimde kullanıcıya sunulur.
* **Gerçek IDE Sekme & Boş Çalışma Alanı Yaşam Döngüsü**:
  - Markdown Editörü ve JavaScript IDE başlangıçta önceden seçilmiş bir dosya olmaksızın temiz boş çalışma alanı (`Empty Workspace - No Open Files`) ile açılır.
  - Sanal dosya sistemindeki tüm dosyalar üstte peşinen listelenmez.
  - Yalnızca kullanıcının açtığı dosyalar sekme çubuğuna eklenir (`openViewerFileIds`, `openIdeFileIds`).
  - Her sekme bireysel bir `X` kapatma butonu barındırır; kapatılan sekme aktif sekme ise komşu sekmeye veya boş ekrana geri dönülür.
* **İki Yönlü Markdown Editörü (`MarkdownViewerApp.tsx`)**:
  - Uygulama sadece okuyucu olmaktan çıkarılarak tam bir düzenleyiciye dönüştürülmüştür.
  - `edit`, `preview` ve `split` (bölünmüş ekran) görüntüleme modları sunulur.
  - Düzenleme panelinde satır numaralı metin alanı ve araç çubuğunda `Kaydet` butonu (`Ctrl+S` / `Cmd+S`) ile VFS (`updateFile`) anlık kaydedilir; sekmede kaydedilmemiş değişiklikler için `md-dirty-dot` gösterilir.
* **Dinamik & Yerelleştirilmiş Tarayıcı Sekme Başlığı (`document.title`)**:
  - Sayfa başlığı aktif seçilen dile göre dinamik senkronize edilir: Türkçe için `AEC — Uygulama Portfolyosu`, İngilizce için `AEC — Application Portfolio` ve diğer 5 dilde eksiksiz yerelleştirme sağlanır.

---

## 11. Portal Tabanlı Başlık Menüsü, Dinamik Sütun Sarma & Sürüklenebilir Masaüstü Izgarası

* **Portal Tabanlı Pencere Başlık Bağlam Menüsü (`WindowFrame.tsx`)**:
  - `handleTitlebarPointerDown` fonksiyonunda sol tık filtresi (`e.button === 0`) uygulanarak, farenin sağ tuşu ile tıklandığında tarayıcının `contextmenu` olayını yutan `setPointerCapture` mekanizması devre dışı bırakılmıştır.
  - Pencere başlık çubuğu sağ tık menüsü (`.window-titlebar-context-menu`) `createPortal` aracılığıyla doğrudan `document.body` üzerine render edilir. Bu mimari karar sayesinde pencere çerçevesindeki `translate3d` CSS transform koordinat bozulmaları ve konteyner kırpılmaları tamamen önlenir.
  - Menü yerelleştirilmiş `Kapat`, `Simge Durumuna Küçült`, `Ekranı Kapla / Normal Boyuta Dön` aksiyonlarını içerir.
* **JS IDE Değişiklik Bildirimi & Yerelleştirilmiş Kaydetme (`JsIdeApp.tsx`)**:
  - Kaydet butonu sabit İngilizce yerine yerelleştirilmiş `t('editor_saved')` ("Kaydedildi") ve yeşil onay simgesi (`Check`) ile güncellenmiştir.
  - Kaydedilmemiş değişiklik olduğunda (`code !== currentFile.content`) dosya sekmesinde turuncu `js-dirty-dot` uyarı noktası görüntülenir. Kaydedildiğinde veya `Ctrl+S` ile kaydedildiğinde nokta anında kaybolur.
* **Masaüstü Çoklu Sütunlu Yukarıdan Aşağıya Sarma Düzeni (`Desktop.tsx`)**:
  - Statik tek sütunlu veya yatay ızgara yerine dinamik yükseklik tabanlı sütunlama algoritması uygulanmıştır:
    `maxRows = Math.max(1, Math.floor((viewportHeight - START_Y - DOCK_MARGIN) / CELL_HEIGHT))`
  - Çok sayıda dosya ve uygulama eklendiğinde simgeler ilk sütunu yukarıdan aşağıya doldurur, alt bar (Dock) sınırına ulaştığında otomatik olarak sağdaki sonraki sütuna (Sütun 1, Sütun 2, ...) sararak dikey taşma ve örtüşmeleri tamamen engeller.
* **Sürüklenebilir & Konumlandırılabilir Masaüstü Simgeleri (Draggable Grid Icons)**:
  - Masaüstündeki tüm uygulama ve dosya kartları fareyle sürüklenerek serbestçe yeniden konumlandırılabilir.
  - `window.addEventListener('pointermove' / 'pointerup')` ile kesintisiz global hareket takibi sağlanır.
  - Bırakılan simge matematiksel olarak en yakın ızgara hücresine kenetlenir (`grid snap`) ve konumlar `localStorage` üzerinde (`aec-desktop-icon-positions`) kalıcı olarak saklanır.
  - Sürükleme bittiğinde istem dışı dosya veya uygulama açılmasını engellemek için `justDraggedRef` koruması devreye girer.
* **Masaüstü Simgelerinde Çakışma Önleme & Boş Hücreye Kenetlenme (Collision Resolution Engine)**:
  - Bir simge başka bir simgenin bulunduğu dolu bir ızgara hücresine bırakılmaya çalışıldığında `occupiedKeysByOthers` seti ile çakışma anında algılanır.
  - Dolu hücreye bırakılan simge asla diğer simgenin üzerine bindirilmez; bırakılan imleç koordinatlarına Öklid mesafesi (`Math.hypot`) açısından en yakın boş ızgara hücresine yönlendirilerek kenetlenir.
  - `layoutPositions` memoized motoru sayesinde özel konumu olmayan simgeler de özel konumu olan simgelerin hücrelerini atlayarak sonraki boş hücrelere akar. Bu sayede masaüstünde hiçbir iki simge asla üst üste binemez.

---

## 12. Masaüstü Sağ Tık Konumlandırma & İlk Boşluk Otomatik Yerleşim Mimarisi

* **Sağ Tıklanan Koordinatta Doğrudan Dosya Oluşturma (`Desktop.tsx`)**:
  - Masaüstünde boş alana sağ tıklandığında imlecin ham ekran koordinatları (`rawX, rawY`) kaydedilir ve oluşturma modalı durumuna (`promptModal.targetCoords`) taşınır.
  - Modal formundan dosya oluşturulduğunda (`createFile`), hedef koordinat masaüstü ızgara indeksine dönüştürülür:
    `targetCol = Math.round((targetCoords.x - START_X) / CELL_WIDTH)`
    `targetRow = Math.round((targetCoords.y - START_Y) / CELL_HEIGHT)`
  - Eğer hedeflenen ızgara hücresi boşsa dosya tam olarak oraya yerleştirilir (`customPositions`). Dolu ise Öklid mesafesi en yakın boş hücreye kenetlenir ve `localStorage`'a kaydedilir.
* **Terminal ve IDE'den Dosya Oluşturmada İlk Boşluğu Doldurma Algoritması**:
  - Terminal (`touch`, `nano`) veya JavaScript IDE üzerinden dosya oluşturulduğunda `targetCoords` bulunmaz.
  - `layoutPositions` motoru dinamik dosyalar için ızgarayı en baştan (`c = 0, r = 0`) tarar (`findNextFreeCell(0, 0)`).
  - Masaüstünde daha önce bir simgenin başka yere sürüklenmesiyle veya dosya silinmesiyle oluşan ilk boş delik/hücre tespit edilir ve yeni dosya doğrudan bu boşluğa yerleştirilir.
  - Sistem başlangıç dosyaları (`isInitial: true`) stabil dizilimlerini korurken, dinamik dosyalar sıralı biçimde açık boşlukları doldurur.
* **VFS ve Yaşam Döngüsü İzolasyonu (`filesystem.store.ts`)**:
  - `reset()` eylemi eklenerek test ortamlarında ve oturum yenilemelerinde temiz dosya haritasına dönülmesi garanti altına alınmıştır.
  - Silinen dosyaların `localStorage` özel konum anahtarları derhal kaldırılarak ızgarada hayalet dolu alan kalması önlenir.

---

## 13. Fabrika Ayarlarına Sıfırlama & Olay Tabanlı Senkronizasyon (Factory Reset Architecture)

WebOS platformunun bütünsel sistem durumunu ilk kurulum haline döndürmek için CLI (`sudo rm -rf`) ve GUI (Ayarlar Tehlike Bölgesi) entegrasyonu sağlanmıştır:

* **Merkezi Sıfırlama Servisi (`performSystemReset` - `system-reset.ts`)**:
  - **VFS Sıfırlama**: `useFileSystemStore.getState().reset()` çağrılır; kullanıcı tarafından oluşturulmuş tüm dinamik dosyalar temizlenir, sistem başlangıç dosyaları (`bio.md`, `skills.md`, `contact.md`, `welcome.txt`) orijinal metinleriyle yeniden oluşturulur, açık IDE ve okuyucu sekmeleri sıfırlanır.
  - **Görsel Tema Sıfırlama**: `useThemeStore.getState().reset()` çağrılır; duvar kağıdı `'deep-space'`, vurgu rengi `'cyan'` yapılır, dinamik renk senkronizasyonu (`isAutoAccent: true`) açılır ve `aec_portfolio_theme` `localStorage` kaydı silinir.
  - **Masaüstü Izgara Konumları**: `localStorage.removeItem('aec-desktop-icon-positions')` ile kullanıcı tarafından sürüklenmiş veya sağ tıkla oluşturulmuş özel koordinatlar sıfırlanır.
  - **Geniş Yayın (CustomEvent Broadcast)**: `window.dispatchEvent(new CustomEvent('aec-system-reset'))` tetiklenir. `Desktop.tsx` bu olayı dinleyerek dahili `customPositions` state'ini temizler; sayfayı yeniden yüklemeden (zero-reload) tüm masaüstü simgeleri akıcı bir şekilde varsayılan ızgara düzenine döner.
* **Terminal CLI `sudo rm -rf` ve Yalın Durum Bildirimi (`TerminalApp.tsx`)**:
  - `rm -rf /` root silme komutu standart `guest` yetkisiyle çalıştırıldığında işletim sistemi güvenlik kuralı simüle edilir: `Permission denied. Try "sudo rm -rf /"`.
  - `sudo rm -rf` (veya `sudo rm -rf /`, `sudo rm -rf *`) girildiğinde araya gereksiz işlem basamakları girmeden doğrudan `performSystemReset()` çalıştırılır, aktif kullanıcı `guest` olarak sıfırlanır ve terminale yalnızca yalın durum bildirimi (`terminal_reset_status`: "Sistem başarıyla varsayılana döndürüldü.") basılır.
* **Ayarlar (Settings) Uygulaması İki Aşamalı Doğrulama**:
  - Kazara veri kayıplarını önlemek için satır içi onay kartı (`Inline Confirmation Card`) deseni uygulanmıştır.
  - Buton metni sadeleştirilmiştir ("Varsayılana Sıfırla" / "Reset to Defaults").
  - İlk tıklamada uyarı ve onay kutusu (`İptal` / `Evet, Sistemi Sıfırla`) açılır; onay verildiğinde işlem yürütülür ve 4 saniye süreli otomatik kaybolan başarı bildirimi sunulur.

---

## 14. SonarQube / SonarJS Statik Kod Kalitesi & Bilişsel Karmaşıklık (Cognitive Complexity) Mimarisi

Sistem genelinde yazılım mühendisliği disiplini ve SonarQube / SonarJS kalite standartlarına tam uyum (`GEMINI.md` ve `project-quality-workflow`) sağlanmıştır:

* **Sıfır Hata ve Sıfır Uyarı Politikası (Zero Warnings / Zero Code Smells)**:
  - ESLint 9 Flat Config altyapısına `eslint-plugin-sonarjs@4.2.2`, `@typescript-eslint` ve native kurallar entegre edilmiştir.
  - Kod tabanındaki tüm fonksiyonlar için bilişsel karmaşıklık üst sınırı kesin olarak 15 (`sonarjs/cognitive-complexity: ['error', 15]`) olarak belirlenmiştir.
* **Fonksiyonel Parçalama & Modüler Ayrıştırma (Decomposition)**:
  - **Masaüstü Motoru (`Desktop.tsx`)**:
    - Sürükle-bırak sonlandırma (`onPointerUp`) ve modal dosya yerleşimi (`handlePromptSubmit`) içerisindeki yinelenen ızgara çakışma önleme algoritmaları tekil `resolveCollisionFreeCoordinates` yardımcısına çıkarılmıştır.
    - İç içe geçmiş koşullu ifadeler (nested ternaries) `getDefaultExtensionForMode` tablosuna aktarılarak kaldırılmıştır.
    - `handlePromptSubmit` fonksiyonu `handleRenameSubmit` ve `handleNewFileSubmit` olarak iki bağımsız fonksiyona bölünmüş; bilişsel karmaşıklık 50'den 3'e düşürülmüştür.
    - Kullanılmayan import (`Upload`) temizlenmiştir.
  - **Terminal Uygulaması (`TerminalApp.tsx`)**:
    - 34 bilişsel karmaşıklığa sahip devasa komut ayrıştırıcı (`handleCommand`), modüler yanıt oluşturuculara (`buildHelpLines`, `buildCatLines`, `buildTouchLines`, `buildRmLines`, `buildSudoLines`, `handleNanoCommand`) parçalanmış; karmaşıklık 8'e düşürülmüştür.
  - **JavaScript IDE (`JsIdeApp.tsx`)**:
    - Günlük seviyesi ayrıştırma (`parseLogLevel`) ve kriptografik kimlik üretimi (`generateSafeLogId`) bileşen dışına taşınmıştır.
    - Sandbox `postMessage` dinleyicisine hedef `iframeRef.current.contentWindow` kaynak doğrulaması eklenerek izole güvenlik pekiştirilmiştir.
  - **Pencere Yöneticisi (`window-manager.store.ts`)**:
    - `openWindow` ve `updateWindowSize` içindeki 4 katmanlı iç içe geçmiş ternary ifadeler `resolveScreenDimensions` yardımcı fonksiyonu ile sadeleştirilmiş, isteğe bağlı zincirleme (`target?.resizable`) uygulanmıştır.
  - **Sanal Dosya Sistemi (`filesystem.store.ts`)**:
    - Güvenli olmayan `Math.random().toString(36)` kimlik üretimi, Web Crypto API tabanlı `crypto.getRandomValues` (`generateSafeFileId`) ile kriptografik olarak güvenli hale getirilmiştir.
    - Eski dizi erişimleri modern ECMAScript `parts.at(-1)` standardına geçirilmiştir.
  - **Çoklu Dil Motoru (`i18n.store.ts`)**:
    - Dil arama dizisi `Set<LanguageCode>` veri yapısına dönüştürülerek O(1) `has()` sorgusuna geçirilmiştir.
    - Dinamik RegExp şablonlarında kaçış karakteri hatalarını önlemek için `String.raw` standartlaştırılmıştır.
* **DevSecOps ve Kalite Doğrulaması**:
  - `npm run lint` tüm monorepo genelinde sıfır hata ve sıfır uyarı vermektedir.
  - 14 test dosyasında 82 birim ve entegrasyon testinin tamamı (%100) Vitest üzerinde başarıyla çalışmaktadır.
  - Üretim derlemesi (`npm run build`) eksiksiz ve optimize şekilde tamamlanmaktadır.

---

## 15. Dinamik DOM Başlık Metadata & Çok Dilli A11y / SEO Mimarisi

Çok dilli tek sayfa uygulaması (SPA) yapısında erişilebilirlik (A11y) standartları ve arama motoru optimizasyonu (SEO) gereksinimleri dinamik başlık senkronizasyonu ile güvenceye alınmıştır:

* **`<html lang="...">` ve Ekran Okuyucu Senkronizasyonu (`App.tsx`)**:
  - `index.html` dosyasındaki statik kök dil tanımı, kullanıcının aktif olarak seçtiği dile göre `document.documentElement.lang = currentLanguage` ile eşzamanlı güncellenir.
  - Bu mimari adım, ekran okuyucu yazılımların (NVDA, VoiceOver, JAWS) metinleri yanlış dilde telaffuz etmesini önler ve tarayıcı otomatik çeviri motorlarına (Chrome Translate) doğru dil sinyali iletir.
* **Dinamik Meta Açıklama & Sosyal Medya Etiketleri (Open Graph & Twitter Card)**:
  - `updateDocumentMetadata` yardımcı fonksiyonu ile 7 dil için özelleştirilmiş `browser_meta_description` sözlük anahtarları devreye alınmıştır.
  - Dil değişiminde `meta[name="description"]`, `og:title`, `og:description`, `og:locale` (`tr_TR`, `en_US`, `de_DE`, `fr_FR`, `es_ES`, `ru_RU`, `ja_JP`), `twitter:title` ve `twitter:description` anında reaktif olarak güncellenir.
* **SPA SEO ve Hreflang Standartları Uyumu**:
  - Tek URL (`/`) üzerinde çalışan ve dil tercihini yerel depolama / tarayıcı tespit mekanizmasıyla yöneten SPA mimarisinde, farklı bağımsız URL'lere sahip olmadan statik `hreflang` linkleri tanımlamak Google Webmaster yönergelerine göre çakışma (duplicate content conflict) yaratacağından ötürü; sayfa içi meta ve DOM dil etiketlerinin dinamik senkronizasyonu modeli benimsenmiştir.
