# AEC Portfolio WebOS — Dual-Engine Design System Specification (Tasarım Şartnamesi)

Bu belge, **PersonalWebSite / WebOS** projesinde yer alan iki büyük ve felsefi tasarım sisteminin (**Spatial Dark Glass** ve **Swiss Industrial**) tasarım kararlarını, CSS değişkenlerini, tipografi kurallarını, yüzey morfolojilerini ve simge haritalamalarını eksiksiz biçimde kayıt altına alan teknik şartnamedir.

---

## 1. Tasarım Sistemleri Felsefe Karşılaştırması

| Boyut / Katman | 🌌 Tema 1: Spatial Dark Glass (`spatial-glass`) [Varsayılan] | 📐 Tema 2: Swiss Industrial (`swiss-industrial`) |
| :--- | :--- | :--- |
| **Tasarım Ekolü** | Apple VisionOS & macOS Spatial Glassmorphism | Dieter Rams ("Weniger, aber besser"), Braun & Leica, Bauhaus |
| **Yüzey Fiziği** | Katmanlı yarı saydam buzlu cam (`backdrop-filter: blur(24px)`) | Masif, mat, monolitik grafit/arduvaz gövde (`blur: 0px`, `#131519`) |
| **Arka Plan & Atmosfer** | Koyu nebula, yumuşak radyal ışık huzmeleri (Sabit imza duvar kağıdı) | 32px CAD mimari çizim ızgarası (`drafting grid`) + telemetri barı |
| **Vurgu Felsefesi** | Elektrik Aurora Camgöbeği (`#38bdf8` / `#00f0ff`), parıltı (glow) | Tekil endüstriyel emniyet turuncusu (`#ff5500`), salt fonksiyonel |
| **Görev Çubuğu (Dock)** | 9999px yüzen cam kapsül, esnek hover büyümeleri (`scale(1.12)`) | 46px bölümlenmiş, alt kenara kilitli modüler enstrüman konsolu |
| **Pencere Anatomisi** | Yuvarlatılmış cam çerçeveler (`14px`), renkli kontrol diskleri | Masif şasi (`4px`), monospaced başlık (`WND_ID // 0x4A`), mekanik diskler |
| **Simge Dili (Icons)** | Çağdaş, yumuşak hatlı Lucide vektör ikon seti | Katı geometrik Bauhaus/İsviçre özel SVG logoları (`AppLogos.tsx`) |
| **Tipografi & Hiyerarşi** | Modern sans-serif, ferah boşluklar, cam etiketler | Yüksek bilgi yoğunluğu, `JetBrains Mono`, `tabular-nums`, sıkı tracking |

---

## 2. CSS Değişkenleri & Token Mimarisi

Sistem kök HTML elementi üzerindeki `data-theme` özniteliği ile ayrışır:
`<html data-theme="spatial-glass">` veya `<html data-theme="swiss-industrial">`.

### A. Ortak Primitifler (Shared Primitives)
```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
  --transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-smooth: 260ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --statusbar-height: 42px;
}
```

### B. Spatial Dark Glass Tokens (`[data-theme="spatial-glass"]` & Fallback `:root`)
```css
[data-theme="spatial-glass"], :root {
  --color-void: #060709;
  --color-bg-base: #0a0c10;
  --color-bg-elevated: #10131a;
  --color-surface-subtle: rgba(255, 255, 255, 0.03);

  --glass-bg: rgba(16, 20, 28, 0.65);
  --glass-bg-active: rgba(20, 26, 38, 0.78);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-highlight: rgba(255, 255, 255, 0.18);
  --glass-blur: 24px;
  --glass-blur-heavy: 36px;
  --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.07);
  --glass-shadow-active: 0 25px 65px rgba(0, 0, 0, 0.75), 0 0 2px 1px rgba(56, 189, 248, 0.25);

  --color-accent: #38bdf8;
  --aurora-cyan: #38bdf8;
  --color-accent-subtle: rgba(56, 189, 248, 0.12);
  --color-accent-border: rgba(56, 189, 248, 0.35);

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-code: #38bdf8;

  --radius-window: 14px;
  --radius-control: 8px;
  --radius-pill: 9999px;
  --dock-height: 60px;
  --titlebar-height: 40px;
}
```

### C. Swiss Industrial Tokens (`[data-theme="swiss-industrial"]`)
```css
[data-theme="swiss-industrial"] {
  --color-void: #090a0c;
  --color-canvas: #0e1013;
  --color-surface-base: #131519;
  --color-surface-subtle: #181b20;
  --color-surface-elevated: #1e2128;
  --color-surface-hover: #252932;
  --color-surface-active: #2c313c;

  --color-bg-base: var(--color-canvas);
  --color-bg-elevated: var(--color-surface-elevated);

  --border-hairline: #22262f;
  --border-structural: #2c313c;
  --border-prominent: #3b4251;
  --border-focus: #ff5500;

  --glass-bg: #131519;
  --glass-bg-active: #171a20;
  --glass-border: #22262f;
  --glass-border-highlight: #353b49;
  --glass-blur: 0px;
  --glass-blur-heavy: 0px;
  --glass-shadow: 0 12px 32px rgba(0, 0, 0, 0.75), 0 0 0 1px #22262f;
  --glass-shadow-active: 0 18px 44px rgba(0, 0, 0, 0.85), 0 0 0 1px #383e4c;

  --color-accent: #ff5500;
  --aurora-cyan: #ff5500;
  --color-accent-subtle: rgba(255, 85, 0, 0.12);
  --color-accent-border: rgba(255, 85, 0, 0.35);

  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --text-code: #ff5500;

  --radius-window: 4px;
  --radius-control: 3px;
  --radius-pill: 4px;
  --dock-height: 46px;
  --titlebar-height: 36px;
}
```

---

## 3. Simge Dağıtım Haritası (Iconography Resolver)

`AppIconResolver.tsx` bileşeni aktif temayı dinleyerek ilgili simgeyi dinamik render eder:

| Uygulama / Dosya ID | Spatial Glass İkonu (`spatial-glass`) | Swiss Industrial Logosu (`swiss-industrial`) |
| :--- | :--- | :--- |
| Marka / Sistem Logo | Standart Metin Monogramı | `AecBrandLogo` (Bauhaus Geometrisi) |
| `terminal` | `<Terminal size={...} />` (Lucide) | `TerminalAppLogo` (Braun CLI Şasisi) |
| `settings` | `<Settings size={...} />` (Lucide) | `SettingsAppLogo` (8 Dişli Endüstriyel Çark) |
| `markdown-viewer` | `<FileText size={...} />` (Lucide) | `MarkdownAppLogo` (İsviçre Tipografik Izgarası) |
| `js-ide` | `<Code2 size={...} />` (Lucide) | `JsIdeAppLogo` (Kod Bloğu Şasisi) |
| `.txt` Dosyası | `<FileText size={...} />` (Lucide) | `TextFileLogo` (Monospace TXT Rozetli) |
| `.md` Dosyası | `<BookOpen size={...} />` (Lucide) | `MdFileLogo` (Markdown M-Ok Rozetli) |
| `.js` Dosyası | `<Code2 size={...} />` (Lucide) | `JsFileLogo` (Amber JS Rozetli) |

---

## 4. Sabit İmza Duvar Kağıtları

Kullanıcı arayüzünde manuel duvar kağıdı seçimi kaldırılmıştır:
1. **Spatial Dark Glass**: `#0d0f12` bazlı derin uzay gradyanı ve 40px süptil ızgara dokusu.
2. **Swiss Industrial**: `#0a0b0d` masif zemin üzerine örülen deterministik 32px teknik CAD mimari çizim ızgarası (`linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px)`).

---

## 5. Durum Yönetimi & Backend Genişletilebilirliği (`theme.store.ts`)

- **Varsayılan Tema**: `spatial-glass`
- **Kayıt Anahtarı**: `localStorage.getItem('aec_portfolio_active_theme')`
- **Backend Entegrasyon Kancası**: `initializeTheme(backendDefault?: ThemeId)`
  - Kullanıcı yerel depolamasında bir seçim varsa o önceliklidir.
  - Kullanıcı seçimi yoksa backend tarafından sağlanan `backendDefault` devreye girer.
  - Backend çevrimdışıysa veya veri yoksa `DEFAULT_FALLBACK_THEME = 'spatial-glass'` işletilir.
