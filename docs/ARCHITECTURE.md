# NovaOS / AEC Portfolio — Mimari & Konsept Belgesi

## 1. Vizyon ve Tasarım Felsefesi
Bu proje, klasik statik portfolyo sitelerinin ötesine geçen, modern bir bilgisayar mühendisinin yeteneklerini, sistem düşüncesini ve kod kalitesini sergileyen **Spatial Dark Glass (VisionOS & Linear esintili)** bir masaüstü web deneyimidir (**AEC Portfolyo**).

* **Marka / Kimlik**: Fiktif OS yerine doğrudan geliştirici kimliği: **AEC** (Ahmet).
* **Estetik**: Derin koyu tonlar (`#060709`, `#0a0c10`), katmanlı buzlu cam (`backdrop-filter: blur(24px)`), aurora ışık huzmeleri ve mikro-interaksiyonlar.
* **İşlevsel Sadelik**: Yalnızca çalışan ve amaca hizmet eden arayüz elemanları; sahte/dekoratif widget'lar (wifi, pil vb.) kaldırılmıştır.
* **Aktif Uygulama Kapsamı**: Sistem 4 kararlı ve amaca odaklı çekirdek uygulama içerir:
  - **Terminal (`terminal`)**: Linux CLI (`ls`, `cat`, `touch`, `rm`, `su`, `exit`), VFS entegrasyonu ve tam ekran GNU nano editörü.
  - **Ayarlar (`settings`)**: Sistem tercihleri, 7 dilli yerelleştirme, 4 koyu spatial duvar kağıdı ve dinamik akıcı tema rengi motoru.
  - **Markdown Okuyucu & Düzenleyici (`markdown-viewer`)**: `marked` motoru ile zengin HTML derleme, sekme yönetimi, canlı Önizleme ve Ham Kaynak Kodu modları. Doğrudan masaüstündeki bir belgeye tıklandığında belge **Önizleme (`preview`)** modunda açılır; masaüstü uygulama simgesine basıldığında ise doğrudan **Düzenleme (`edit`)** modunda açılır.
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
  - **Başlık Çubuğuna Orta Tıklama (Middle-Click / Scroll Wheel)**: Pencereyi kapatır ve tarayıcının otomatik kaydırma davranışını engeller.
  - **Uygulama İçi & Başlık Çubuğu Sağ Tık Bağlam Menüsü (Window Context Menu)**:
    - Pencerenin hem başlık çubuğuna hem de uygulama içeriğine (`window-content`) sağ tıklandığında tarayıcının yerel menüsü engellenir (`preventDefault`), pencere odağa getirilir ve WebOS pencere bağlam menüsü açılır.
    - Menü eylemleri: **Kapat** (`Close`), **Simge Durumuna Küçült** (`Minimize`), **Ekranı Kapla / Geri Yükle** (`Maximize / Restore`).
    - Dışarı tıklandığında veya `Escape` tuşuna basıldığında menü otomatik olarak kapanır.

---

## 4. Dinamik Açık Uygulamalar Çubuğu (Dock / Taskbar)

* **Sadece Çalışan Uygulamalar**: Alt bar artık tüm statik uygulamaları değil; **yalnızca o an açık veya simge durumunda olan uygulamaları** listeler.
* **Taşmasız Hover Efekti**: Dock butonları büyüdüğünde (`scale(1.12) translateY(-2px)`) dock sınırlarını taşmayacak şekilde dikey boşluklar ve esnek çerçeve yapılandırılmıştır.
* **Etkileşim**:
  - Aktif pencereye tıklandığında simge durumuna küçülür.
  - Simge durumundaki veya arkadaki pencereye tıklandığında öne gelir ve odaklanır.
  - Pencere kapatıldığında alt bardan otomatik olarak ayrılır.
* **Sağ Tık Bağlam Menüsü (Dock Context Menu & Direct Close)**:
  - Dock üzerindeki herhangi bir açık uygulama simgesine sağ tıklandığında tarayıcının yerel menüsü engellenir ve dock simgesinin hemen üzerinde temaya duyarlı bağlam menüsü açılır.
  - Menü, uygulamanın yerelleştirilmiş adını, pencereyi doğrudan sonlandıran **Kapat** (`Close`) seçeneğini ve **Küçült / Geri Yükle** kontrolünü sunar.
  - "Kapat" tıklandığında pencere kapatılır, dock'tan kaldırılır ve menü kapatılır. Dışarı tıklandığında veya `Escape` tuşuna basıldığında menü kapanır.

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
│   └── backend/            # Node.js 22 + Express (Minimal HTTP & Healthcheck Sunucusu, Docker Container Yaşam Döngüsü)
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
  - **Başlık Çubuğu Orta Tık ile Kapatma (Middle-Click to Close)**: `.window-titlebar` üzerine fare orta tuşu (scroll wheel / button 1) ile tıklandığında (`auxclick`) pencere kapatma eylemi (`closeWindow`) doğrudan tetiklenir (X butonuna basılmış gibi). Tarayıcının varsayılan otomatik kaydırma (autoscroll / panning) modunu engellemek amacıyla `pointerdown` ve `mousedown` olaylarında `e.button === 1` için `preventDefault()` çağrılır. Küçültme veya tam ekran butonlarına (`.window-control-btn.minimize`, `.maximize`, `.restore`) yapılan kazara orta tıklamalar filtre edilerek kullanıcı hatalarına karşı korunur.
  - **Uygulama İçi Doğal Tarayıcı Menüsü**: `.window-content` kapsayıcısında `onContextMenu` üzerinde `e.stopPropagation()` uygulanırken `preventDefault()` çağrılmaz; böylece masaüstü menüsü engellenirken tarayıcının yerel metin kopyalama, yapıştırma ve inceleme sağ tık menüsü doğal biçimde kullanıcıya sunulur.
* **Gerçek IDE Sekme & Boş Çalışma Alanı Yaşam Döngüsü**:
  - Markdown Editörü ve JavaScript IDE başlangıçta önceden seçilmiş bir dosya olmaksızın temiz boş çalışma alanı (`Empty Workspace - No Open Files`) ile açılır.
  - Sanal dosya sistemindeki tüm dosyalar üstte peşinen listelenmez.
  - Yalnızca kullanıcının açtığı dosyalar sekme çubuğuna eklenir (`openViewerFileIds`, `openIdeFileIds`).
  - Her sekme bireysel bir `X` kapatma butonu barındırır; kapatılan sekme aktif sekme ise komşu sekmeye veya boş ekrana geri dönülür.
* **İki Yönlü Markdown Editörü (`MarkdownViewerApp.tsx`)**:
  - Uygulama sadece okuyucu olmaktan çıkarılarak tam bir düzenleyiciye dönüştürülmüştür.
  - `edit`, `preview` ve `split` (bölünmüş ekran) görüntüleme modları sunulur.
  - Bir dosya açıldığında veya sekmeler arasında geçiş yapıldığında sistem varsayılan olarak **Düzenle (`edit`)** modunda açılır; böylece kullanıcı bölünmüş ekran yerine doğrudan metin ve satır numaralı düzenleme alanına odaklanır. İstenildiğinde üst araç çubuğundan `split` veya `preview` moduna geçiş yapılabilir.
  - Düzenleme panelinde satır numaralı metin alanı ve araç çubuğunda `Kaydet` butonu (`Ctrl+S` / `Cmd+S`) ile VFS (`updateFile`) anlık kaydedilir; sekmede kaydedilmemiş değişiklikler için `md-dirty-dot` gösterilir.
* **Birleşik Masaüstü Tek Tık (Single-Click) Etkileşim Modeli (`Desktop.tsx`)**:
  - Masaüstündeki sanal dosyalar (`.desktop-file-card`), uygulama kısayolları (`.desktop-app-card`) ile tam uyumlu hale getirilerek çift tıklama (`onDoubleClick`) yerine doğrudan **tek tıklama (`onClick`)** ile ilgili uygulamada açılacak şekilde yapılandırılmıştır.
  - Simge taşıma ve serbest konumlandırma esnasında yanlışlıkla dosya veya uygulama açılmasını engelleyen `justDraggedRef` güvenlik bariyeri masaüstü dosyalarında da tam koruma sağlar.
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

---

## 16. Minimal Express Backend & Docker Container Yaşam Döngüsü

Docker ortamında orkestrasyonun ve konteynerin ayakta kalmasını (keep-alive) temin eden yalın, modern ve güvenli Node.js 22 + Express tabanlı bir backend servisi devreye alınmıştır:

* **Amaç ve Sorumluluk**:
  - Konteynerin başlangıçta hemen kapanmasını engellemek ve sürekli bir HTTP dinleyicisi ile konteyner yaşam döngüsünü canlı tutmak.
  - İleride eklenecek API, telemetri veya yetkilendirme servisleri için temiz ve ölçeklenebilir bir başlangıç iskeleti sunmak.
* **Güvenlik & DevSecOps Standartları (SonarJS / OWASP)**:
  - **`helmet`**: Standart güvenlik başlıkları (X-Content-Type-Options, DNS prefetch, frameguard vb.) etkinleştirilmiş, `X-Powered-By` sızıntısı engellenmiştir.
  - **Kısıtlı & Güvenli CORS**: SonarJS `sonarjs/cors` kuralına tam uyumlu biçimde joker (`*`) yerine beyaz liste (`ALLOWED_ORIGINS` / `localhost:5173`, `localhost:3000`) ve origin doğrulama mekanizması ile yapılandırılmıştır.
  - **Merkezi Hata Yakalama**: Beklenmeyen 500 hatalarında üretim ortamında dahili hata ayrıntısı istemciye sızdırılmaz.
* **Uç Noktalar (Endpoints)**:
  - `GET /`: Servis adı, sürüm ve durum döndüren kök bilgi uç noktası.
  - `GET /health`: Docker `HEALTHCHECK` ve orkestratör probları için `status: "healthy"` ve `uptime` döndüren sağlık denetim noktası.
  - `404 Handler`: Eşleşmeyen tüm rotalar için JSON formatında standartlaştırılmış hata cevabı.
* **Zarif Kapanma (Graceful Shutdown)**:
  - Docker tarafından gönderilen `SIGINT` ve `SIGTERM` sinyalleri yakalanarak aktif HTTP bağlantıları boşaltılır ve konteyner güvenli bir şekilde kapatılır (10 saniyelik emniyet zaman aşımı koruması ile).
* **Multi-Stage Docker Mimarisi**:
  - `docker/Dockerfile.backend`: `node:22-bookworm-slim` temelinde iki aşamalı (builder & runner) optimize imaj. Root kullanıcı yerine `node` kullanıcısı ile çalıştırılarak container güvenliği pekiştirilmiştir.
  - `docker/Dockerfile.frontend`: `node:22-bookworm-slim` ile Vite derlemesi alıp `nginx:alpine` ile sunan yüksek performanslı hafif statik sunucu imajı.
  - `docker/nginx.frontend.conf`: SPA routing (`try_files`), gzip sıkıştırması ve statik varlık önbellek kurallarını içeren konteyner içi Nginx yapılandırması.
  - `docker/docker-compose.yml`: Frontend (`127.0.0.1:3000:80`) ve Backend (`127.0.0.1:3001:3001`) servislerini izole biçimde ayağa kaldıran standart yerel/sunucu orkestrasyonu.

---

## 17. Tam Yığın (Full-Stack) Docker, Host Nginx Reverse Proxy & GHCR Dağıtım Hattı

Üretim sunucusunda derleme yükü (CPU/RAM darboğazı) oluşturmadan, her `main` dalı güncellemesinde hem frontend hem de backend konteynerlerini sıfır kesintiyle güncellemek için **GitHub Container Registry (GHCR)** tabanlı modern CI/CD boru hattı kurulmuştur (`.github/workflows/deploy.yml`):

* **Host Nginx Tersine Vekil (Reverse Proxy) Mimarisi (3 Alt Uygulama)**:
  - **`frontend` (Kullanıcı Arayüzü)**: `127.0.0.1:3000:80` portunda çalışır. Host Nginx `location /` isteklerini yönlendirir.
  - **`admin` (Yönetim & Telemetri Paneli)**: `127.0.0.1:3002:80` portunda çalışır. Host Nginx `location /admin/` isteklerini yönlendirir.
  - **`backend` (Express API Servisi)**: `127.0.0.1:3001:3001` portunda çalışır. Host Nginx `location /api/` isteklerini yönlendirir.
  - Tüm konteyner portları yerel döngüye (`127.0.0.1`) kilitli olup dış internete kapalıdır.
* **Akıllı Monorepo Değişiklik Tespiti & Seçici Dağıtım (Selective CI/CD)**:
  - `dorny/paths-filter@v3` ile commit'teki dosya yolları taranır:
    - Yalnızca `apps/backend/**` etkilendiyse, sadece `backend` imajı inşa edilir ve sunucuda sadece `backend` servisi yenilenir (`docker compose up -d --no-deps backend`).
    - Yalnızca `apps/user-interface/**` etkilendiyse, sadece `frontend` servisi güncellenir.
    - Yalnızca `apps/admin-interface/**` etkilendiyse, sadece `admin` servisi güncellenir.
    - `packages/shared/**` değiştiğinde bağımlı tüm servisler derlenip güncellenir.
  - Değişmeyen servisler asla yeniden derlenmez veya yeniden başlatılmaz; sıfır kesinti ve maksimum hız elde edilir.
* **Sunucu Tarafında Git Bağımsızlığı (Zero-Git Server Deployment)**:
  - Sunucu üzerinde `git` kurulu olma veya depoyu sunucuya klonlama gereksinimi tamamen ortadan kaldırılmıştır.
  - `docker/docker-compose.yml` orkestrasyon dosyası GitHub Actions tarafından Base64 formatında doğrudan sunucuya iletilir.
  - Sunucu yalnızca bir Docker hostu olarak davranır; `docker compose` ve `docker-compose` komutlarını dinamik olarak destekler, GitHub Container Registry'den imajları çeker ve ayağa kaldırır. Bu yaklaşım sunucunun ele geçirilmesi durumunda kaynak koda veya GitHub hesabına erişim riskini sıfıra indirir.

---

## 18. Çift Motorlu Tasarım Sistemi & Bütünsel Tema Mimarisi (Dual-Engine Theme System)

Kullanıcı arayüzünde yüzeysel renk veya arka plan gradyanı değişiklikleri yerine, işletim sisteminin tüm görsel, geometrik, tipografik ve duyusal katmanlarını dönüştüren **Çift Motorlu Tasarım Sistemi** hayata geçirilmiştir:

* **İki Bağımsız Tasarım Felsefesi**:
  1. **Spatial Dark Glass (`spatial-glass`) [Varsayılan]**:
     - Apple VisionOS ve modern spatial tasarım dili.
     - 24px katmanlı buzlu cam (`backdrop-filter: blur(24px)`), elektrik aurora camgöbeği (`#38bdf8`) vurgu ışıltısı, 14px yuvarlatılmış pencere köşeleri.
     - 9999px yüzen cam kapsül dock ve akıcı hover sıçramaları (`scale(1.12)`).
     - Orijinal derin uzay nebula gradyanı ve standart çağdaş Lucide vektör simgeleri.
  2. **Swiss Industrial (`swiss-industrial`)**:
     - Dieter Rams ("Weniger, aber besser"), Braun & Leica ve Bauhaus işlevsel grafik tasarım ekolü.
     - Masif, mat, monolitik grafit/arduvaz şasi (`blur: 0px`, `#131519`), sıfır süsleme, 4px deterministik pencere köşeleri.
     - 46px modüler enstrüman konsolu (alt kenara kilitli, sıfır zıplama/bounce, mekanik durum LED'i).
     - Braun/Leica tekil fonksiyonel emniyet turuncusu (`#ff5500`) vurgusu.
     - 32px teknik CAD çizim ızgarası (`drafting grid`) ve üst barda teknik koordinat telemetrisi (`SYS.LOC // 39.92°N 32.85°E`).
     - Özel geometrik Bauhaus mimari SVG logoları (`AppLogos.tsx`).
* **Sabit İmza Duvar Kağıtları & Renk Seçiminin Tasfiyesi**:
  - Her temanın felsefesine uygun tekil ve değişmez bir imza arka planı atanmış; kullanıcı arayüzündeki manuel duvar kağıdı seçimi kaldırılmıştır.
  - Standart 5'li vurgu rengi seçimi ve `isAutoAccent` arayüzden ve store'dan tamamen temizlenmiştir; her temanın vurgu rengi o ekolün ruhuna içkin ve sabittir.
* **Reaktif Simge Ayrıştırıcısı (`AppIconResolver.tsx`)**:
  - `Desktop.tsx`, `Dock.tsx` ve `WindowFrame.tsx` içerisinde kod karmaşasını önlemek amacıyla simge çözümleyici bileşen geliştirilmiştir.
  - Bilişsel karmaşıklığı (`cognitive-complexity`) 15 limitinin çok altında tutmak üzere modüler alt fonksiyonlara (`renderSwissAppIcon`, `renderSpatialAppIcon`, `renderFileIcon`, `renderBrandIcon`) ayrıştırılmıştır.
  - `spatial-glass` aktifken Lucide glifleri, `swiss-industrial` aktifken özel mimari SVG logoları derlenir.
* **Geleceğe Hazır Backend Varsayılan Tema Entegrasyonu (`theme.store.ts`)**:
  - Varsayılan tema `develop` dalı standardı olan `spatial-glass`'tır.
  - `resolveInitialTheme(backendDefault?: ThemeId)` fonksiyonu ile 3 aşamalı hiyerarşi kurulmuştur:
    1. Kullanıcının yerel tercihi (`localStorage.getItem('aec_portfolio_active_theme')`),
    2. Backend API'sinden gelebilecek varsayılan konfigürasyon (`backendDefault`),
    3. Güvenli geri dönüş varsayılanı (`DEFAULT_THEME = 'spatial-glass'`).
* **Ayrıntılı Tasarım Şartnamesi**:
  - Tüm CSS token'ları, renk kodları, yüzey haritaları ve simge kılavuzları [DESIGN_SYSTEM_SPEC.md](file:///docs/DESIGN_SYSTEM_SPEC.md) belgesinde tescillenmiştir.

---

## 19. Modüler & Genişletilebilir Tema Motoru (Pluggable Theme Engine) & Geometrik Bütünlük

Kullanıcı arayüzünde tema ekleme ve tema değiştirme deneyimini endüstri standardı seviyesine çıkarmak amacıyla, sert kodlanmış `if (isSwiss)` mantıkları tamamen tasfiye edilerek **Açık/Kapalı Prensibi'ne (Open/Closed Principle)** dayalı dinamik bir tema motoru (`apps/user-interface/src/themes/`) geliştirilmiştir:

* **Tema Kayıt Defteri & Motoru (`theme-registry.ts` & `theme.types.ts`)**:
  - `ThemeDefinition` arayüzü ile bir temanın sahip olması gereken tüm kimlik (`id`, `name`, `subtitle`, `description`), renk/arka plan (`colors`), tipografi (`typography`) ve simge haritası (`icons`) kurallara bağlanmıştır.
  - `ThemeRegistry` sınıfı; `registerTheme()`, `getTheme()`, `getAllThemes()`, `hasTheme()`, `applyThemeToDom()` ve `getThemeMetaList()` metodları ile merkezi kontrol sağlar.
  - Sistem başlangıcında `spatialGlassTheme` ve `swissIndustrialTheme` motor tarafından otomatik kaydedilir.
  - Yeni bir tema eklemek için tek yapılması gereken `my-theme.theme.tsx` tanımını oluşturup `registerTheme(myTheme)` çağırmaktır; Ayarlar arayüzü, simge çözümleyiciler ve DOM değişkenleri hiçbir if/else koşulu yazılmadan anında çalışır.
* **Tema Değişiminde Sıfır Boyut Zıplaması (Zero Layout Jumping)**:
  - Tema değiştiğinde bileşen boyutlarının titremesini/zıplamasını engellemek için geometrik ölçüler `:root` seviyesinde tekleştirilmiştir:
    - **Üst Bar (Status Bar)**: Her iki temada da tam `40px` (`--statusbar-height: 40px`).
    - **Pencere Çerçeve Barı (Titlebar)**: Her iki temada da ince ve zarif `36px` (`--titlebar-height: 36px`).
    - **Açık Uygulamalar Çubuğu (Dock)**: Her iki temada da `58px` (`--dock-height: 58px`), dock ögeleri ise `42x42px` boyutundadır.
    - **Masaüstü Uygulama ve Dosya Kartları**: Her iki temada da `88px x 92px` boyutunda, `50x50px` simge kapsayıcısına ve `11.5px` (satır yüksekliği `1.25`, azami `30px`) iki satırlı taşmayan etiketlere sahiptir.
* **Görsel & Geometrik Kusursuzlaştırmalar**:
  - **Masaüstü İki Satırlı Program İsimleri**: Kart yüksekliği 86px'ten 92px'e çıkarılmış, dikey hizalama `flex-start` ve `padding: 6px 4px` olarak ayarlanmış; iki satırlı etiketlerin kesilmesi (`text truncation/clipping`) tamamen çözülmüştür.
  - **Simge Arkaplan Eşitsizliğinin Çözümü & Optik Denge**:
    - `TerminalAppLogo`, `MarkdownAppLogo` ve `JsIdeAppLogo` içindeki kutu-içinde-kutu küçülmesine yol açan dahili koyu şasi dikdörtgenleri (`<rect fill="#0d0f14">`) kaldırılmıştır.
    - Tüm uygulama logoları 24x24 viewBox içinde optik sınırları (~20x18) dolgun, saf yüksek kontrastlı vektör gliflerine dönüştürülmüştür.
    - Masaüstündeki dosya ve uygulama simgeleri `50x50px` dış çerçeveye eşitlenmiş; `welcome.md` ve `markdown-viewer` arka planları birebir aynı boyuta getirilmiştir.
    - Swiss temasında simge boyutu masaüstünde 32px'e, dock'ta 24px'e çıkarılarak net ve belirgin hale getirilmiştir.
  - **Pencere Çerçeve Barı Sadeleştirmesi**: Çerçeve üst barındaki küçük uygulama logosu kaldırılmış, sadece pencere başlığı metni bırakılmıştır.
  - **Swiss Kontrol Tuşları Renkleri**: Endüstriyel makine gösterge standartlarına uygun olarak küçültme/aşağı alma tuşu sarı/kehribar (`#eab308`), büyütme/ekranı kaplama tuşu yeşil (`#16a34a`), kapatma tuşu kırmızı (`#dc2626`) olarak güncellenmiştir.
  - **Sağ Üst Koordinatların Temizlenmesi**: Kullanıcı talebi doğrultusunda Swiss temasında sağ üstteki `SYS.LOC` telemetri metni kaldırılmıştır.
  - **3. Yerleşik Tema: Cyberpunk Neon (`cyberpunk-neon`)**:
    - **Tasarım Felsefesi**: Night City & Synthwave HUD estetiği. Koyu OLED siyah zemin (`#030712`), çift radyal neon gradyanı, CRT/HUD scanline ızgara dokusu.
    - **Renk Paleti**: Neon Gül/Pembe (`#f43f5e`, `rgb(244, 63, 94)`), Yüksek Voltaj Sarı (`#facc15`), Sibernetik Camgöbeği (`#06b6d4`).
    - **Pencere & Dock Geometrisi**: 4px fütüristik köşe radyanı, `rgba(244, 63, 94, 0.45)` neon kontur ışıltısı, renk kodlu pencere kontrol butonları (kapat `#f43f5e`, küçült `#facc15`, büyüt `#06b6d4`).
    - **Özel Cyberpunk SVG Simgeleri (`cyberpunk-neon.theme.tsx`)**:
      - `CyberBrandLogo`: Altıgen sibernetik HUD çekirdeği ve telemetri kılavuzları.
      - `CyberTerminalLogo`: Neon pembe prompt chevron, yüksek voltaj sarı blok imleç ve HUD durum LED'leri.
      - `CyberSettingsLogo`: Sibernetik devre/çip çekirdeği ve neon bağlantı pinleri.
      - `CyberMarkdownLogo` & `CyberJsIdeLogo`: Neon çerçeveli, çift katmanlı fütüristik kod ve belge glifleri.
      - Dosya Simgeleri (`txt`, `md`, `js`): Neon katlanır köşe, yüksek kontrastlı rozetler ve dosya tipi telemetrisi.
    - **Sıfır Boyut Zıplaması**: Üst bar (40px), dock (58px), kart boyutları (88x92px) ve simge kapsayıcıları (50x50px) birebir korunmuştur.
  - **4. Yerleşik Tema: Classic Macintosh (`classic-mac`)**:
    - **Tasarım Felsefesi**: 1984 Apple Macintosh System 7 & Susan Kare retro piksel GUI estetiği. Koyu/gece temalarından tamamen ayrılan nostaljik açık gri platin şasi (`#dcdfe5`), ikonik 1-bit dithered masaüstü dokusu ve 3D kabartmalı (`beveled`) buton geometrisi.
    - **Tarihsel GUI Zaman Çizelgesi**: Sistem artık arayüz tasarım tarihini 4 farklı çağ ile simgeler:
      1. 1960: **Swiss Industrial** (Dieter Rams / Bauhaus Fonksiyonalizmi)
      2. 1984: **Classic Macintosh** (Susan Kare / Erken Dönem Kişisel Bilgisayar Devrimi)
      3. 2024: **Spatial Dark Glass** (Apple VisionOS / Çağdaş Buzlu Cam & Uzamsal Bilişim)
      4. 2077: **Cyberpunk Neon** (Night City / Sibernetik HUD & Fütüristik Yüksek Voltaj)
    - **Pencere & Dock Geometrisi**: 2px köşeli platin pencere kasası, yatay pinstripe başlık çubuğu, ortalanmış katı platin başlık plaketi, 14x14px kare beveled kontrol butonları (mükemmel ortalanmış vektör ikonları) ve Control Strip tarzı alt dock rafı.
    - **Masaüstü Etiketleri & İki Satırlı İsimler**: İki satırlı uygulama isimlerinin taşmaması için kart iç boşluğu (padding 4px, gap 3px) optimize edildi; etiketlerdeki tüm gölgeler ve çerçeveler kaldırılarak saf düz platin arka plan ve net siyah metin uygulandı. Hover durumunda klasik Mac lacivert vurgusu (`#000080`) aktifleşir.
    - **Ayarlar (Settings) Uygulaması Uyarlaması**: Açık renk zemin ile uyumlu, hover durumunda kaybolmayan koyu lacivert çerçeveler (`#000080`), 3D platin kartlar, klasik butonlar ve tema uyumlu kırmızı sıfırlama alanı geliştirildi.
    - **Özel Susan Kare Homage SVG Simgeleri (`classic-mac.theme.tsx`)**:
      - `MacBrandLogo`: İkonik gülümseyen "Happy Mac" CRT bilgisayar ve disket yuvası.
      - `MacTerminalLogo`: Tersine çevrilmiş siyah başlık çubuklu retro komut kutusu, pinstripe ve kare imleç.
      - `MacSettingsLogo`: System 7 Control Panels donanım potansiyometreleri ve sürgülü ayar kolları.
      - `MacMarkdownLogo`: TeachText / Document tüy kalem ve metin rulosu.
      - `MacJsIdeLogo`: 3.5 inçlik manyetik geliştirici disketi ve "JS" sistem etiketi.
      - Dosya Simgeleri (`txt`, `md`, `js`): Katlanır köşeli kağıt dokümanlar ve klasik piksel rozetler.
    - **Sıfır Boyut Zıplaması**: Üst bar (40px), dock (58px), kart boyutları (88x92px) ve simge kutuları (50x50px) birebir muhafaza edilmiştir.
  - **Ayarlar Uygulamasında Dinamik Tema Bilgi Başlığı ve Çok Dilli Açıklamalar**:
    - **Dinamik Başlık & Rozet**: Tema seçim ızgarasının üzerindeki bölüm başlığı (`activeThemeTitle`), aktif temanın adına ve kullanıcının seçtiği dile göre dinamik olarak güncellenir (`{name} Teması`, `{name} Theme`, `{name}-Design`, `Thème {name}` vb.). Başlığın yanında o temanın tasarım diliyle uyumlu aktif durum rozeti (`.settings-active-theme-pill`) yer alır.
    - **Dinamik Açıklama Paragrafı**: Başlığın altındaki açıklama metni (`activeThemeDescription`), seçilen temanın tasarım felsefesini (buzlu cam, Rams fonksiyonalizmi, sibernetik telemetre veya Susan Kare retro piksel estetiği) 7 desteklenen dilde reaktif olarak yansıtır.
    - **Tema Kartları İçi Yerelleştirme**: Seçim kartlarındaki açıklama metinleri de `getThemeDescription()` çözümleyicisi sayesinde 7 dilin tamamında yerelleştirilmiş olarak sunulur.

---

## 20. Web Audio Sentetik Ses Motoru & Üst Bar Etkileşimli Ses Denetimi Mimarisi

Kullanıcı arayüzüne fiziksel bir işletim sistemi ve enstrüman duyarlılığı kazandırmak üzere, dış ses dosyalarının getirdiği ağ yükü ve gecikmeyi tamamen ortadan kaldıran **Saf Web Audio API Tabanlı Sentetik Ses Sistemi** entegre edilmiştir:

* **Sıfır Ek Yük & Matematiksel Sentezleyici (`sound.service.ts`)**:
  - Harici hiçbir `.mp3`/`.wav` dosyası kullanılmaz (0 KB asset footprint).
  - Tarayıcının yerel `AudioContext`, `OscillatorNode` ve `GainNode` arabirimleri kullanılarak, üstel sönümlemeli (exponential decay envelope) saf mikro-sesler üretilir.
  - Tarayıcıların katı `Autoplay Policy` kısıtlamalarını aşmak için ilk kullanıcı etkileşiminde (`pointerdown`, `click`) bağlamı uyandıran tekil (singleton) `SoundService` motoru çalışır.
* **4 Temaya Özel Akustik Kimlikler (Theme-Aware Sound Profiles)**:
  1. **Spatial Dark Glass**: 480Hz -> 240Hz yumuşak sinüs dalgalı (`sine`) su damlası ve buzlu cam pıtırtısı.
  2. **Swiss Industrial**: 280Hz -> 60Hz üçgen dalgalı (`triangle`) sert mekanik mikro-anahtar ve röle çıtlaması (Tactile Relay Click).
  3. **Cyberpunk Neon**: 1100Hz -> 550Hz rezonans filtreli testere dişi (`sawtooth`) sibernetik HUD cıvıltısı.
  4. **Classic Macintosh**: 880Hz -> 440Hz saf 8-bit kare dalga (`square`) Susan Kare 1984 System 7 vintage bip ve disket kafası vuruşu.
  - Tema değişiminde her temanın felsefesini yansıtan 3 notalı karakteristik imza akoru (`theme-switch`) çalınır.
* **Üst Durum Çubuğu Ses Denetim Paneli (`SoundControl.tsx`, `desktop.css`)**:
  - `.spatial-statusbar` sağ kısmında (`.statusbar-right`), saatin hemen solunda konumlandırılmıştır.
  - **Doğrudan Kapatıp Açma (Mute Button)**: Dinamik Lucide ikonları (`Volume2`, `Volume1`, `VolumeX`) ile tek tıkla ses durumunu değiştirir (`toggleMute`).
  - **Barda Sürükleyerek Ses Ayarlama (Draggable Slider)**:
    - 68px genişliğinde, temalara göre stillendirilmiş yatay aralık çubuğu (`sound-volume-slider`).
    - Sürükleme anında ses seviyesini anlık günceller (`setVolume`), 0'a çekilirse otomatik sessize alır, 0'ın üstüne çekildiğinde sesi otomatik açar.
    - Sürükleme bırakıldığında (`pointerup`) kullanıcının seçilen seviyeyi duyması için anlık `volume-tick` önizleme sesi tetiklenir.
* **Durum Kalıcılığı (`sound.store.ts`)**:
  - `isMuted` ve `volume` tercihleri `localStorage` üzerinde saklanır (`aec_portfolio_sound_muted`, `aec_portfolio_sound_volume`).
  - Döngüsel bağımlılıkları önlemek için aktif tema doğrudan DOM `data-theme` özniteliğinden okunur.
* **İşletim Sistemi Olay Entegrasyonu**:
  - Pencere açma (`window-open`), kapatma (`window-close`), küçültme (`window-minimize`), tam ekrana alma (`window-maximize`), tam ekrandan dönme (`window-restore`), tema değiştirme (`theme-switch`) ve dock tıklamaları (`click`) reaktif olarak ses motoruna bağlanmıştır.

---

## 21. Web Audio Prosedürel Arka Plan Müzik Motoru & Üst Bar Müzikçalar Mimarisi

Sistemin tematik derinliğini ve retro-fütüristik atmosferini zirveye taşımak amacıyla, harici ses dosyalarının dosya boyutu, lisans ve ağ gecikmesi dezavantajlarını sıfırlayan **Prosedürel Web Audio Müzik Sentezleme Motoru** geliştirilmiştir:

* **Sıfır Ek Yük & Matematiksel Sekanslayıcı (`music.service.ts`)**:
  - 0 KB harici asset: Hiçbir `.mp3`, `.wav` veya `.ogg` dosyası indirilmez; tüm ses dalgaları doğrudan kullanıcının işlemcisi ve tarayıcı ses kartı üzerinde anlık sentezlenir.
  - `OscillatorNode`, `GainNode` ve `BiquadFilterNode` (lowpass) bileşenleri ile dinamik adım sekanslayıcısı (Lookahead Step Sequencer) çalışır.
  - Her temanın felsefesini, tarihi dönemini ve estetik frekanslarını yansıtan **8 adet tematik parça (her temaya 2 özgün müzik)** mevcuttur:
    1. **Spatial Dark Glass**:
       - *Track 1 - "Ethereal Orbit"* (78 BPM, yumuşak sinüs dalgaları, 1800Hz cutoff filtresi, uzamsal ambient arpejler).
       - *Track 2 - "Starlight Float"* (84 BPM, sinüs lead + alt bas, 2200Hz cutoff, derin uzay hissi).
    2. **Swiss Industrial**:
       - *Track 1 - "Kalkül 1960"* (112 BPM, üçgen dalga, 2800Hz cutoff, Dieter Rams fonksiyonalist matematiksel ritmi).
       - *Track 2 - "Raster & Modul"* (100 BPM, mekanik üçgen bas, 2600Hz cutoff, endüstriyel şasi temposu).
    3. **Cyberpunk Neon**:
       - *Track 1 - "Night City Drive"* (122 BPM, agresif testere dişi dalga, 2400Hz cutoff, synthwave arpejleri).
       - *Track 2 - "Neon Horizon"* (110 BPM, sibernetik bas hatları, 2200Hz cutoff, yüksek voltaj parıltısı).
    4. **Classic Macintosh**:
       - *Track 1 - "Silicon Valley 1984"* (128 BPM, saf 8-bit chiptune kare dalga, 4000Hz cutoff, System 7 retro ezgileri).
       - *Track 2 - "Pixel Dream"* (106 BPM, nostaljik Susan Kare piksel melodileri, 3800Hz cutoff).
* **Zustand Reaktif Müzik Deposu (`music.store.ts`)**:
  - `isPlaying: boolean`, `currentTrackIndex: number` (0 veya 1), `activeThemeId: string` ve `currentTrack: TrackDefinition` state'lerini yönetir.
  - `togglePlay()`, `nextTrack()` (temanın 1. ve 2. parçası arasında geçiş), `setTheme()`, `stop()` ve `reset()` API'larını dışa açar.
  - **Ana Ses Denetimi ve Tema Senkronizasyonu**:
    - `useSoundStore` aboneliği: Kullanıcı üst bardan sesi kıstığında veya sessize aldığında müzik seviyesi anında senkronize olur.
    - `useThemeStore` aboneliği: Ayarlar'dan sistem teması değiştirildiğinde, müzik çalıyorsa otomatik olarak yeni temanın parçasına yumuşak geçiş yapılır.
* **Üst Bar Mini Müzikçalar Bileşeni (`MusicPlayer.tsx`, `desktop.css`)**:
  - `.spatial-statusbar` sağ bölümünde (`.statusbar-right`), ses denetiminin solunda konumlandırılmıştır.
  - **Oynat / Duraklat Butonu (`music-player-btn`)**: Lucide `Play` / `Pause` ikonları ile sezgisel kontrol.
  - **Animasyonlu Ritmik Ekolayzır (`music-eq-visualizer`)**:
    - 4 adet dikey ekolayzır çubuğu (`.eq-bar.bar-1..4`).
    - Müzik çalarken (`.playing:not(.loading)`) CSS `@keyframes eqBounce` ile ritmik ve asenkron dalgalanır; duraklatıldığında sabit dinlenme boyuna çekilir.
  - **Yükleniyor (Loading) Durumu ve Spinner (`isLoading`)**:
    - Müzik dosyası ağdan yüklenirken / tamponlanırken erken zıplamayı önler.
    - Oynat butonunda dönen `Loader2` ikonu (`.music-player-spinner`) belirir.
    - Ekolayzır çubukları `@keyframes eqLoadingWave` ile soldan sağa zarifçe parlayarak dosyanın hazırlandığını gösterir.
  - **Parça Başlığı Rozeti (`music-player-title`)**: Çalan parçanın adını ve BPM değerini tooltip ve kompakt etiket olarak gösterir.
  - **Sonraki Parça Butonu (`next-track-btn`)**: Lucide `SkipForward` ikonu ile temanın diğer parçasına anında geçer.
  - 4 temaya özel CSS görünümleri uygulanmıştır (Spatial buzlu cam, Swiss grafit/turuncu, Cyberpunk neon pembe/camgöbeği, Classic Mac beveled retro platin).
* **7 Dilde Yerelleştirme**:
  - `music_play`, `music_pause`, `music_next`, `music_loading` anahtarları 7 dilde (İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça, Japonca) desteklenir.

---

## 22. Arcade Game Hub & Prosedürel Temaya Duyarlı Ses Sentezleme Motoru

Kullanıcı etkileşimini ve işletim sistemi deneyimini zenginleştirmek amacıyla, masaüstü ortamına entegre **Arcade Game Hub (`game-hub`)** ve oyunlara özel **Prosedürel Web Audio API Ses Sentezleme Motoru (`game-sound.service.ts`)** geliştirilmiştir:

* **Oyun Merkezi Mimarisi (`apps/user-interface/src/apps/games/`)**:
  - **Uygulama Manifestosu (`gameHubManifest`)**: `id: 'game-hub'`, `iconName: 'Gamepad2'`, varsayılan pencere boyutu `760x560px`, minimum `440x380px`.
  - **Merkezi Lobi & Başlatıcı (`GameHubApp.tsx`)**:
    - Hero başlığı, aktif tema durumu rozeti, bağımsız ses denetimi (aç/kapa + ses seviyesi kaydırıcısı + ses efekti test butonu).
    - Skor özeti paneli: Tüm oyunların (Snake, Breakout, Space Defender) en yüksek skorlarını anlık gösterir ve `localStorage` üzerinde kalıcı saklar.
    - Oyun seçim kartları: Rozet, ikon, açıklama, kontrol şeması ve en iyi skor bilgisini içeren modern kart ızgarası.
  - **3 Adet Temaya Duyarlı Klasik Arcade Oyunu**:
    1. **Neon Snake (`SnakeGame.tsx`)**:
       - 20x20 dinamik ızgara, hızlanma mekaniği, normal yem ve geri sayımlı altın elma bonus yemleri (+50 puan).
       - Klavye (Ok tuşları / WASD) ve dokunmatik ekranlar/tabletler için sanal D-Pad kontrolleri.
       - Temaya göre değişen görselleştirme: Cyberpunk'ta neon parlamalı kuyruk ve sibernetik imleç; Swiss'te mimari minimal kare bloklar ve emniyet turuncusu yem; Classic Mac'te Susan Kare 1-bit dither piksel blokları ve piksel elma; Spatial Glass'ta yumuşak parlayan cam küreler.
    2. **Brick Breaker (`BreakoutGame.tsx`)**:
       - Çok katmanlı tuğla ızgarası, palet vuruş açısı fiziği, tuğla kırılma kıvılcım parçacıkları, 3 can sistemi.
       - Fare imleci, dokunmatik sürükleme veya Sol/Sağ butonları ile akıcı palet kontrolü.
       - Temaya göre değişen görselleştirme: Cyberpunk neon lazer paleti ve parlama izi; Swiss monokrom tuğla ızgarası; Classic Mac 3D beveled pinstripe tuğlalar; Spatial Glass buzlu prizma taşları.
    3. **Space Defender (`SpaceDefenderGame.tsx`)**:
       - Klasik Space Invaders / Defender tarzı: Oyuncu uzay gemisi, yukarı doğru lazer atışları, yana doğru hareket eden ve aşağı inen uzaylı filoları.
       - Dalga (wave) ilerleme sistemi, uzaylı bombaları, patlama kıvılcımları ve 3 can sistemi.
       - Ok tuşları, dokunmatik Sol/Sağ butonları ve özel ATEŞ (Shoot) butonu.
       - Temaya göre değişen görselleştirme: Cyberpunk fütüristik jet ve pembe neon plazma; Swiss teknik şevron gemi; Classic Mac 8-bit piksel istilacı sprite'ları; Spatial Glass zarif mavi ışıldayan yıldız gemisi.
* **Prosedürel Web Audio API Oyun Sentezleyicisi (`game-sound.service.ts`)**:
  - Sıfır dış ses dosyası, sıfır ağ gecikmesi: Tüm sesler saf `OscillatorNode` ve `GainNode` dalga boyları ile anlık sentezlenir.
  - **4 Temaya Özel Ses Profilleri**:
    - **Classic Mac**: 1984 8-bit chiptune kare dalgaları (`square`), arpejli nostaljik 8-bit bip/bop/crunch sesleri.
    - **Cyberpunk Neon**: Agresif testere dişi dalgaları (`sawtooth`), hızlı frekans kaymalı lazer zıplamaları ve sibernetik distorsiyon.
    - **Swiss Industrial**: Temiz, kuru üçgen dalgaları (`triangle`), akustik vuruş hissi veren mekanik tıkırtılar ve tok baslar.
    - **Spatial Glass**: Saf sinüs dalgaları (`sine`), kristal berraklığında rezonanslı çanlar ve yumuşak sönümlenen uzamsal akorlar.
  - Desteklenen Olay Sesleri: `snake-move`, `snake-eat`, `snake-bonus`, `snake-die`, `paddle-bounce`, `brick-hit`, `life-lost`, `level-clear`, `laser-shoot`, `alien-hit`, `alien-explode`, `player-hit`, `wave-clear`, `ui-click`, `game-start`, `game-over`, `high-score`, `pause-toggle`.
* **Tema Simgeleri Bütünlüğü**:
  - `spatial-glass`: Lucide `Gamepad2` simgesi.
  - `swiss-industrial`: `AppLogos.tsx` içinde minimalist geometrik konsol ve turuncu butonlu `GameHubAppLogo`.
  - `cyberpunk-neon`: `cyberpunk-neon.theme.tsx` içinde açılı HUD şasili ve neon pembe D-pad'li `CyberGameHubLogo`.
  - `classic-mac`: `classic-mac.theme.tsx` içinde Susan Kare 1984 piksel beveled taşınabilir konsollu `MacGameHubLogo`.
* **7 Dilde Yerelleştirme**:
  - `appName_game_hub` ve `appDesc_game_hub` İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Rusça ve Japonca dillerine eksiksiz eklenmiştir.













