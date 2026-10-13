/**
 * Supported language codes across AEC Portfolio
 */
export type SupportedLanguage = 'en' | 'tr' | 'de' | 'fr' | 'es' | 'ru' | 'ja';

/**
 * Metadata for each language option displayed in the Settings app
 */
export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

/**
 * Dictionary type containing all localized translation keys
 */
export interface Translations {
  // Application names & descriptions
  appName_terminal: string;
  appDesc_terminal: string;
  appName_settings: string;
  appDesc_settings: string;

  // Window Controls
  window_close: string;
  window_minimize: string;
  window_maximize: string;
  window_restore: string;

  // Dock
  dock_manage_window: string;

  // Status Bar
  statusbar_brand: string;

  // Terminal CLI
  terminal_welcome_title: string;
  terminal_welcome_subtitle: string;
  terminal_welcome_help: string;
  terminal_help_header: string;
  terminal_cmd_bio_desc: string;
  terminal_cmd_skills_desc: string;
  terminal_cmd_contact_desc: string;
  terminal_cmd_su_desc: string;
  terminal_cmd_whoami_desc: string;
  terminal_cmd_clear_desc: string;
  terminal_user_switched: string;
  terminal_user_invalid: string;
  terminal_cmd_not_found: string;
  terminal_input_placeholder: string;
  terminal_bio_title: string;
  terminal_bio_text1: string;
  terminal_bio_text2: string;
  terminal_skills_fe: string;
  terminal_skills_be: string;
  terminal_skills_devops: string;
  terminal_contact_header: string;

  // Settings App
  settings_heading: string;
  settings_subheading: string;
  settings_language_section: string;
  settings_language_desc: string;
  settings_appearance_section: string;
  settings_appearance_desc: string;
  settings_active_badge: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName_terminal: 'Terminal CLI',
    appDesc_terminal: 'Interactive Unix-like command-line interface',
    appName_settings: 'Settings',
    appDesc_settings: 'System and language preferences',
    window_close: 'Close Window',
    window_minimize: 'Minimize Window',
    window_maximize: 'Maximize Window',
    window_restore: 'Restore Window',
    dock_manage_window: 'Manage window',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'Welcome to the Computer Engineer & Software Architect portfolio.',
    terminal_welcome_help: 'Type "help" to see available commands.',
    terminal_help_header: 'Available commands:',
    terminal_cmd_bio_desc: 'Display engineering background and bio',
    terminal_cmd_skills_desc: 'List core technical competencies and stack',
    terminal_cmd_contact_desc: 'Show contact channels and social links',
    terminal_cmd_su_desc: 'Switch active terminal user (e.g., "su ahmet")',
    terminal_cmd_whoami_desc: 'Display current active user',
    terminal_cmd_clear_desc: 'Clear terminal scroll history',
    terminal_user_switched: 'User switched to: {user}',
    terminal_user_invalid: 'Please provide a valid username (e.g., "su ahmet")',
    terminal_cmd_not_found: 'Command not found: {cmd}. Type "help" for command list.',
    terminal_input_placeholder: 'type a command...',
    terminal_bio_title: '--- COMPUTER ENGINEER & SOFTWARE ARCHITECT ---',
    terminal_bio_text1: 'Focused on modern web standards, resilient distributed architectures,',
    terminal_bio_text2: 'clean code craftsmanship, DevSecOps principles, and scalable Node.js services.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, RESTful APIs',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'Contact & Channels:',
    settings_heading: 'System Settings',
    settings_subheading: 'Customize language and runtime options',
    settings_language_section: 'Language & Localization',
    settings_language_desc: 'Choose your preferred language for the portfolio interface and terminal.',
    settings_appearance_section: 'Spatial Dark Glass Theme',
    settings_appearance_desc: 'Hardware accelerated blur, glowing borders and fluid spring physics.',
    settings_active_badge: 'Active',
  },
  tr: {
    appName_terminal: 'Terminal CLI',
    appDesc_terminal: 'Zsh benzeri interaktif komut satırı arayüzü',
    appName_settings: 'Ayarlar',
    appDesc_settings: 'Sistem ve dil tercihleri',
    window_close: 'Pencereyi Kapat',
    window_minimize: 'Simge Durumuna Küçült',
    window_maximize: 'Ekranı Kapla',
    window_restore: 'Normal Boyuta Dön',
    dock_manage_window: 'Pencereyi yönet',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'Bilgisayar Mühendisi & Yazılım Mimarı portfolyosuna hoş geldiniz.',
    terminal_welcome_help: 'Kullanılabilir komutları görmek için "help" yazın.',
    terminal_help_header: 'Kullanılabilir komutlar:',
    terminal_cmd_bio_desc: 'Mühendislik profilini ve özgeçmişi görüntüler',
    terminal_cmd_skills_desc: 'Teknik yetenek matrisini listeler',
    terminal_cmd_contact_desc: 'İletişim kanallarını ve bağlantıları gösterir',
    terminal_cmd_su_desc: 'Terminal kullanıcısını değiştirir (örn: "su ahmet")',
    terminal_cmd_whoami_desc: 'Mevcut aktif kullanıcıyı gösterir',
    terminal_cmd_clear_desc: 'Terminal ekranını temizler',
    terminal_user_switched: 'Kullanıcı değiştirildi: {user}',
    terminal_user_invalid: 'Lütfen geçerli bir kullanıcı adı belirtin (örn: "su ahmet")',
    terminal_cmd_not_found: 'Komut bulunamadı: {cmd}. Komut listesi için "help" yazın.',
    terminal_input_placeholder: 'komut yazın...',
    terminal_bio_title: '--- BİLGİSAYAR MÜHENDİSİ & YAZILIM MİMARI ---',
    terminal_bio_text1: 'Modern web standartları, dayanıklı dağıtık sistem mimarileri,',
    terminal_bio_text2: 'temiz kod disiplini, DevSecOps ilkeleri ve ölçeklenebilir Node.js servisleri.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, RESTful API',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'İletişim & Bağlantılar:',
    settings_heading: 'Sistem Ayarları',
    settings_subheading: 'Dil ve çalışma zamanı tercihlerini özelleştirin',
    settings_language_section: 'Dil ve Bölge',
    settings_language_desc: 'Portfolyo arayüzü ve terminal için tercih ettiğiniz dili seçin.',
    settings_appearance_section: 'Spatial Dark Glass Teması',
    settings_appearance_desc: 'Donanım hızlandırmalı buzlu cam, parıldayan kenarlıklar ve akıcı yay fiziği.',
    settings_active_badge: 'Aktif',
  },
  de: {
    appName_terminal: 'Terminal CLI',
    appDesc_terminal: 'Interaktive Unix-ähnliche Befehlszeilenschnittstelle',
    appName_settings: 'Einstellungen',
    appDesc_settings: 'System- und Sprachpräferenzen',
    window_close: 'Fenster schließen',
    window_minimize: 'Fenster minimieren',
    window_maximize: 'Fenster maximieren',
    window_restore: 'Fenster wiederherstellen',
    dock_manage_window: 'Fenster verwalten',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'Willkommen im Portfolio des Informatikers & Softwarearchitekten.',
    terminal_welcome_help: 'Geben Sie "help" ein, um verfügbare Befehle anzuzeigen.',
    terminal_help_header: 'Verfügbare Befehle:',
    terminal_cmd_bio_desc: 'Engineering-Hintergrund und Biografie anzeigen',
    terminal_cmd_skills_desc: 'Technische Kernkompetenzen auflisten',
    terminal_cmd_contact_desc: 'Kontaktkanäle und Links anzeigen',
    terminal_cmd_su_desc: 'Aktiven Benutzer wechseln (z. B. "su ahmet")',
    terminal_cmd_whoami_desc: 'Aktuellen Benutzer anzeigen',
    terminal_cmd_clear_desc: 'Terminalverlauf löschen',
    terminal_user_switched: 'Benutzer gewechselt zu: {user}',
    terminal_user_invalid: 'Bitte geben Sie einen gültigen Benutzernamen an (z. B. "su ahmet")',
    terminal_cmd_not_found: 'Befehl nicht gefunden: {cmd}. Geben Sie "help" ein.',
    terminal_input_placeholder: 'Befehl eingeben...',
    terminal_bio_title: '--- INFORMATIKER & SOFTWAREARCHITEKT ---',
    terminal_bio_text1: 'Fokussiert auf moderne Webstandards, skalierbare Architekturen,',
    terminal_bio_text2: 'Clean Code, DevSecOps-Prinzipien und leistungsstarke Node.js-Dienste.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, RESTful APIs',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'Kontakt & Kanäle:',
    settings_heading: 'Systemeinstellungen',
    settings_subheading: 'Sprache und Systemeinstellungen anpassen',
    settings_language_section: 'Sprache & Lokalisierung',
    settings_language_desc: 'Wählen Sie Ihre bevorzugte Sprache für Schnittstelle und Terminal.',
    settings_appearance_section: 'Spatial Dark Glass Design',
    settings_appearance_desc: 'Hardwarebeschleunigte Unschärfe und reaktive Übergänge.',
    settings_active_badge: 'Aktiv',
  },
  fr: {
    appName_terminal: 'Terminal CLI',
    appDesc_terminal: 'Interface en ligne de commande interactive',
    appName_settings: 'Paramètres',
    appDesc_settings: 'Préférences système et linguistiques',
    window_close: 'Fermer la fenêtre',
    window_minimize: 'Réduire la fenêtre',
    window_maximize: 'Agrandir la fenêtre',
    window_restore: 'Restaurer la fenêtre',
    dock_manage_window: 'Gérer la fenêtre',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: "Bienvenue dans le portfolio de l'ingénieur logiciel & architecte.",
    terminal_welcome_help: 'Tapez "help" pour voir les commandes disponibles.',
    terminal_help_header: 'Commandes disponibles :',
    terminal_cmd_bio_desc: "Afficher le profil d'ingénieur et la biographie",
    terminal_cmd_skills_desc: 'Lister les compétences techniques et la pile technologique',
    terminal_cmd_contact_desc: 'Afficher les canaux de contact et réseaux',
    terminal_cmd_su_desc: 'Changer d\'utilisateur (ex. "su ahmet")',
    terminal_cmd_whoami_desc: "Afficher l'utilisateur actuel",
    terminal_cmd_clear_desc: "Effacer l'historique du terminal",
    terminal_user_switched: 'Utilisateur changé pour : {user}',
    terminal_user_invalid: 'Veuillez fournir un nom d\'utilisateur valide (ex. "su ahmet")',
    terminal_cmd_not_found: 'Commande introuvable : {cmd}. Tapez "help".',
    terminal_input_placeholder: 'tapez une commande...',
    terminal_bio_title: '--- INGÉNIEUR EN INFORMATIQUE & ARCHITECTE LOGICIEL ---',
    terminal_bio_text1: 'Axé sur les standards web modernes, architectures distribuées résilientes,',
    terminal_bio_text2: 'le code propre, principes DevSecOps et services Node.js évolutifs.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, API REST',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'Contact & Liens :',
    settings_heading: 'Paramètres Système',
    settings_subheading: 'Personnalisez la langue et les options',
    settings_language_section: 'Langue & Région',
    settings_language_desc: "Choisissez votre langue préférée pour l'interface et le terminal.",
    settings_appearance_section: 'Thème Spatial Dark Glass',
    settings_appearance_desc: 'Flou d\'arrière-plan accéléré par le matériel et esthétique sombre.',
    settings_active_badge: 'Actif',
  },
  es: {
    appName_terminal: 'Terminal CLI',
    appDesc_terminal: 'Interfaz de línea de comandos interactiva',
    appName_settings: 'Ajustes',
    appDesc_settings: 'Preferencias del sistema e idioma',
    window_close: 'Cerrar ventana',
    window_minimize: 'Minimizar ventana',
    window_maximize: 'Maximizar ventana',
    window_restore: 'Restaurar ventana',
    dock_manage_window: 'Administrar ventana',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'Bienvenido al portafolio del ingeniero informático y arquitecto.',
    terminal_welcome_help: 'Escribe "help" para ver los comandos disponibles.',
    terminal_help_header: 'Comandos disponibles:',
    terminal_cmd_bio_desc: 'Mostrar perfil de ingeniería y biografía',
    terminal_cmd_skills_desc: 'Listar competencias técnicas y tecnologías',
    terminal_cmd_contact_desc: 'Mostrar canales de contacto y enlaces',
    terminal_cmd_su_desc: 'Cambiar de usuario activo (ej. "su ahmet")',
    terminal_cmd_whoami_desc: 'Mostrar usuario actual',
    terminal_cmd_clear_desc: 'Limpiar historial de la terminal',
    terminal_user_switched: 'Usuario cambiado a: {user}',
    terminal_user_invalid: 'Por favor proporcione un usuario válido (ej. "su ahmet")',
    terminal_cmd_not_found: 'Comando no encontrado: {cmd}. Escribe "help".',
    terminal_input_placeholder: 'escribe un comando...',
    terminal_bio_title: '--- INGENIERO INFORMÁTICO Y ARQUITECTO DE SOFTWARE ---',
    terminal_bio_text1: 'Enfocado en estándares web modernos, arquitecturas distribuidas,',
    terminal_bio_text2: 'código limpio, principios DevSecOps y servicios Node.js escalables.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, APIs REST',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'Contacto y Canales:',
    settings_heading: 'Ajustes del Sistema',
    settings_subheading: 'Personaliza idioma y preferencias',
    settings_language_section: 'Idioma y Región',
    settings_language_desc: 'Selecciona tu idioma preferido para la interfaz y la terminal.',
    settings_appearance_section: 'Tema Spatial Dark Glass',
    settings_appearance_desc: 'Desenfoque de vidrio esmerilado acelerado por GPU y física fluida.',
    settings_active_badge: 'Activo',
  },
  ru: {
    appName_terminal: 'Терминал CLI',
    appDesc_terminal: 'Интерактивный командный интерфейс',
    appName_settings: 'Настройки',
    appDesc_settings: 'Системные и языковые настройки',
    window_close: 'Закрыть окно',
    window_minimize: 'Свернуть окно',
    window_maximize: 'Развернуть окно',
    window_restore: 'Восстановить окно',
    dock_manage_window: 'Управление окном',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'Добро пожаловать в портфолио инженера-программиста и архитектора.',
    terminal_welcome_help: 'Введите "help" для просмотра доступных команд.',
    terminal_help_header: 'Доступные команды:',
    terminal_cmd_bio_desc: 'Отобразить биографию и инженерный профиль',
    terminal_cmd_skills_desc: 'Список технических навыков и стек',
    terminal_cmd_contact_desc: 'Контакты и профили',
    terminal_cmd_su_desc: 'Сменить пользователя (напр. "su ahmet")',
    terminal_cmd_whoami_desc: 'Показать текущего пользователя',
    terminal_cmd_clear_desc: 'Очистить историю терминала',
    terminal_user_switched: 'Пользователь изменен на: {user}',
    terminal_user_invalid: 'Укажите корректное имя пользователя (напр. "su ahmet")',
    terminal_cmd_not_found: 'Команда не найдена: {cmd}. Введите "help".',
    terminal_input_placeholder: 'введите команду...',
    terminal_bio_title: '--- ИНЖЕНЕР-ПРОГРАММИСТ И АРХИТЕКТОР ---',
    terminal_bio_text1: 'Фокус на современных веб-стандартах, распределенных архитектурах,',
    terminal_bio_text2: 'чистом коде, принципах DevSecOps и масштабируемых сервисах Node.js.',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, RESTful API',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: 'Контакты и Ссылки:',
    settings_heading: 'Настройки Системы',
    settings_subheading: 'Настройка языка и среды выполнения',
    settings_language_section: 'Язык и Регион',
    settings_language_desc: 'Выберите предпочтительный язык для интерфейса и терминала.',
    settings_appearance_section: 'Тема Spatial Dark Glass',
    settings_appearance_desc: 'Аппаратно ускоренное размытие стекла и темная палитра.',
    settings_active_badge: 'Активен',
  },
  ja: {
    appName_terminal: 'ターミナル CLI',
    appDesc_terminal: 'インタラクティブなコマンドラインインターフェース',
    appName_settings: '設定',
    appDesc_settings: 'システムおよび言語設定',
    window_close: 'ウィンドウを閉じる',
    window_minimize: '最小化',
    window_maximize: '最大化',
    window_restore: '元に戻す',
    dock_manage_window: 'ウィンドウを管理',
    statusbar_brand: 'AEC',
    terminal_welcome_title: 'AEC Portfolio Shell [v1.0.0]',
    terminal_welcome_subtitle: 'コンピューターエンジニア＆ソフトウェアアーキテクトのポートフォリオへようこそ。',
    terminal_welcome_help: '利用可能なコマンドを確認するには "help" と入力してください。',
    terminal_help_header: '利用可能なコマンド:',
    terminal_cmd_bio_desc: 'エンジニアのプロフィールと略歴を表示',
    terminal_cmd_skills_desc: '技術スキルとテクノロジースタックの一覧',
    terminal_cmd_contact_desc: '連絡先とリンクを表示',
    terminal_cmd_su_desc: 'アクティブユーザーを切り替え (例: "su ahmet")',
    terminal_cmd_whoami_desc: '現在のユーザーを表示',
    terminal_cmd_clear_desc: 'ターミナル画面をクリア',
    terminal_user_switched: 'ユーザーを切り替えました: {user}',
    terminal_user_invalid: '有効なユーザー名を指定してください (例: "su ahmet")',
    terminal_cmd_not_found: 'コマンドが見つかりません: {cmd}。"help" をお試しください。',
    terminal_input_placeholder: 'コマンドを入力...',
    terminal_bio_title: '--- コンピューターエンジニア ＆ ソフトウェアアーキテクト ---',
    terminal_bio_text1: '最新のウェブ標準、耐障害性の高い分散システム設計、',
    terminal_bio_text2: 'クリーンコード、DevSecOps、スケーラブルなNode.jsサービスに注力。',
    terminal_skills_fe: 'Frontend:  React 19, TypeScript, React Compiler, Zustand, Vite, Vanilla CSS',
    terminal_skills_be: 'Backend:   Node.js 22 LTS, Fastify, Express, SQLite, RESTful APIs',
    terminal_skills_devops: 'DevOps:    Docker, Debian Linux, Vitest, Testing Library, SonarQube',
    terminal_contact_header: '連絡先 & リンク:',
    settings_heading: 'システム設定',
    settings_subheading: '言語およびランタイム設定のカスタマイズ',
    settings_language_section: '言語と地域',
    settings_language_desc: 'インターフェースおよびターミナルの言語を選択してください。',
    settings_appearance_section: 'Spatial Dark Glass テーマ',
    settings_appearance_desc: 'GPUアクセラレーションによるすりガラス効果と流体物理学。',
    settings_active_badge: '選択中',
  },
};
