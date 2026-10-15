import { create } from 'zustand';

/**
 * Allowed file extensions strictly constrained to plain text, markdown, and JavaScript
 */
export type AllowedExtension = 'txt' | 'md' | 'js';

/**
 * Representation of a virtual file residing in the WebOS Virtual File System (VFS)
 */
export interface VFSFile {
  id: string;
  name: string;
  extension: AllowedExtension;
  content: string;
  isSystem: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Result contract returned by file operations for robust error handling
 */
export interface FileOpResult {
  success: boolean;
  error?: string;
  isSystemProtected?: boolean;
  file?: VFSFile;
}

/**
 * GUI alert modal state contract for displaying desktop-level system warnings
 */
export interface GuiAlertState {
  isOpen: boolean;
  title: string;
  message: string;
}

/**
 * Virtual File System state and actions contract
 */
interface FileSystemStoreState {
  files: Record<string, VFSFile>;
  openViewerFileIds: string[];
  openIdeFileIds: string[];
  activeViewerFileId: string | null;
  activeIdeFileId: string | null;
  viewerMode: 'edit' | 'preview' | 'split';
  guiAlert: GuiAlertState | null;

  // Actions
  createFile: (name: string, content?: string) => FileOpResult;
  deleteFile: (name: string) => FileOpResult;
  updateFile: (name: string, content: string) => FileOpResult;
  renameFile: (oldName: string, newName: string) => FileOpResult;
  getFile: (name: string) => VFSFile | undefined;
  setActiveViewerFileId: (id: string | null) => void;
  setActiveIdeFileId: (id: string | null) => void;
  setViewerMode: (mode: 'edit' | 'preview' | 'split') => void;
  openInViewer: (fileId: string, initialMode?: 'edit' | 'preview' | 'split') => void;
  closeViewerTab: (fileId: string) => void;
  openInIde: (fileId: string) => void;
  closeIdeTab: (fileId: string) => void;
  showGuiAlert: (title: string, message: string) => void;
  dismissGuiAlert: () => void;
  reset: () => void;
}

/**
 * Extracts and validates the file extension from a given filename
 *
 * @param filename - Name of the file (e.g., 'notes.md')
 * @returns AllowedExtension or null if invalid
 */
export function parseAllowedExtension(filename: string): AllowedExtension | null {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  const ext = parts.at(-1)?.toLowerCase();
  if (ext === 'txt' || ext === 'md' || ext === 'js') {
    return ext;
  }
  return null;
}

/**
 * Default system files populated on initial OS boot.
 * Marked as isSystem: true to strictly prevent deletion or tampering.
 */
const INITIAL_SYSTEM_FILES: VFSFile[] = [
  {
    id: 'sys-bio',
    name: 'bio.md',
    extension: 'md',
    isSystem: true,
    content: `# Ahmet Emre Ceylan (AEC)
### Computer Systems Architect & Senior Software Engineer

Passionate software engineer specialized in building resilient distributed systems, modern spatial web interfaces, and high-performance microservices.

---

## 🎯 Engineering Philosophy
- **Clean Code & Craftsmanship**: Maintainable, strictly typed, self-documenting codebases.
- **DevSecOps First**: Security baked in at design phase with zero vulnerability tolerance.
- **Aesthetic Excellence**: Fluid micro-animations, glassmorphism, and responsive ergonomics.

---

## 🚀 Key Focus Areas
- Distributed backend services (Node.js 22, Fastify, Go, SQLite/PostgreSQL)
- Spatial reactive frontends (React 19, TypeScript, WebGL/CSS3D)
- Containerized Linux deployments & automated CI/CD pipelines
`,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'sys-skills',
    name: 'skills.md',
    extension: 'md',
    isSystem: true,
    content: `# Technical Skills & Expertise

### Frontend & Spatial Web
- **React 19 & Next.js**: Automatic memoization via React Compiler, Server Components, Custom Hooks
- **TypeScript**: Strict type systems, advanced generics, AST validations
- **Spatial UI**: Pure CSS Glassmorphism, CSS Tokens, Micro-interactions

---

### Backend & Architecture
- **Node.js 22 & Fastify**: High-throughput REST & WebSocket services
- **Databases**: SQLite (better-sqlite3), PostgreSQL, Redis caching
- **Validation & Schemas**: Zod runtime schema guards, OpenAPI / Typebox

---

### DevSecOps & Infrastructure
- **Linux & Containerization**: Debian-slim multi-stage Docker images, Docker Compose
- **Quality & Testing**: Vitest, React Testing Library, SonarQube static analysis
- **Security**: OWASP Top 10 hardening, CSP headers, isolated iframe sandboxing
`,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'sys-contact',
    name: 'contact.md',
    extension: 'md',
    isSystem: true,
    content: `# Contact & Social Channels

Feel free to connect for software architecture discussions, open-source collaboration, or engineering opportunities.

- 🌐 **GitHub**: [github.com/aemreceylan](https://github.com)
- 💼 **LinkedIn**: [linkedin.com/in/aemreceylan](https://linkedin.com)
- 📧 **Email**: [ahmet@example.com](mailto:ahmet@example.com)
- 📍 **Location**: Istanbul, Turkey
`,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'sys-welcome',
    name: 'welcome.txt',
    extension: 'txt',
    isSystem: true,
    content: `Welcome to AEC Spatial Dark Glass WebOS!

This interactive portfolio acts as a fully functional desktop operating system.
You can:
1. Open the Terminal and run Linux commands like 'ls', 'cat bio.md', 'nano custom.js'.
2. Create and delete files directly on the desktop or via terminal (supports .txt, .md, .js).
3. View and format documents with the Markdown Viewer app.
4. Write and safely execute scripts inside the JavaScript IDE.
5. Customize desktop wallpapers and dynamic accent colors in the Settings app.

Type 'help' in the terminal to explore all available commands.
`,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'user-demo-script',
    name: 'demo.js',
    extension: 'js',
    isSystem: false,
    content: `// Welcome to the AEC JavaScript Code Studio!
// You can edit and run this script inside the JS IDE app.

console.log("🚀 Initializing AEC WebOS Script Sandbox...");

const systemSpecs = {
  architecture: "Spatial Dark Glass",
  engine: "React 19 + Node.js 22",
  status: "Online",
};

console.log("System Specifications:", JSON.stringify(systemSpecs, null, 2));

function calculatePerformance(iterations) {
  const start = performance.now();
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    total += Math.sqrt(i);
  }
  const duration = (performance.now() - start).toFixed(2);
  return { total: Math.round(total), durationMs: Number(duration) };
}

const benchmark = calculatePerformance(50000);
console.log(\`✅ Benchmark finished in \${benchmark.durationMs}ms (Result: \${benchmark.total})\`);
`,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

/**
 * Builds the initial map of files keyed by filename
 */
function createInitialFileMap(): Record<string, VFSFile> {
  const map: Record<string, VFSFile> = {};
  INITIAL_SYSTEM_FILES.forEach((file) => {
    map[file.name] = file;
  });
  return map;
}

let fileIdCounter = 0;
function generateSafeFileId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `file-${crypto.randomUUID()}`;
  }
  fileIdCounter += 1;
  return `file-${Date.now()}-${fileIdCounter}`;
}

/**
 * Reactive Zustand store powering the Virtual File System
 */
export const useFileSystemStore = create<FileSystemStoreState>((set, get) => ({
  files: createInitialFileMap(),
  openViewerFileIds: [],
  openIdeFileIds: [],
  activeViewerFileId: null,
  activeIdeFileId: null,
  viewerMode: 'edit',
  guiAlert: null,

  createFile: (name, content = '') => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: 'File name cannot be empty.' };
    }

    const ext = parseAllowedExtension(trimmed);
    if (!ext) {
      return {
        success: false,
        error: `Invalid file extension for '${trimmed}'. Only .txt, .md, and .js are supported.`,
      };
    }

    const existing = get().files[trimmed];
    if (existing) {
      return { success: false, error: `File '${trimmed}' already exists.` };
    }

    const newFile: VFSFile = {
      id: generateSafeFileId(),
      name: trimmed,
      extension: ext,
      content,
      isSystem: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      files: {
        ...state.files,
        [trimmed]: newFile,
      },
    }));

    return { success: true, file: newFile };
  },

  deleteFile: (name) => {
    const trimmed = name.trim();
    const file = get().files[trimmed];

    if (!file) {
      return { success: false, error: `rm: cannot remove '${trimmed}': No such file` };
    }

    if (file.isSystem) {
      return {
        success: false,
        error: `rm: cannot remove '${trimmed}': Protected system file`,
        isSystemProtected: true,
      };
    }

    set((state) => {
      const nextFiles = { ...state.files };
      delete nextFiles[trimmed];
      const nextViewerTabs = state.openViewerFileIds.filter((id) => id !== file.id);
      const nextIdeTabs = state.openIdeFileIds.filter((id) => id !== file.id);
      return {
        files: nextFiles,
        openViewerFileIds: nextViewerTabs,
        openIdeFileIds: nextIdeTabs,
        activeViewerFileId:
          state.activeViewerFileId === file.id
            ? nextViewerTabs[nextViewerTabs.length - 1] || null
            : state.activeViewerFileId,
        activeIdeFileId:
          state.activeIdeFileId === file.id
            ? nextIdeTabs[nextIdeTabs.length - 1] || null
            : state.activeIdeFileId,
      };
    });

    return { success: true };
  },

  updateFile: (name, content) => {
    const trimmed = name.trim();
    const file = get().files[trimmed];

    if (!file) {
      return { success: false, error: `File '${trimmed}' not found.` };
    }

    const updated: VFSFile = {
      ...file,
      content,
      updatedAt: Date.now(),
    };

    set((state) => ({
      files: {
        ...state.files,
        [trimmed]: updated,
      },
    }));

    return { success: true, file: updated };
  },

  renameFile: (oldName, newName) => {
    const oldTrimmed = oldName.trim();
    const newTrimmed = newName.trim();

    const file = get().files[oldTrimmed];
    if (!file) {
      return { success: false, error: `File '${oldTrimmed}' not found.` };
    }

    if (file.isSystem) {
      return { success: false, error: `Cannot rename protected system file '${oldTrimmed}'.` };
    }

    const newExt = parseAllowedExtension(newTrimmed);
    if (!newExt) {
      return {
        success: false,
        error: `Invalid extension for '${newTrimmed}'. Only .txt, .md, and .js are allowed.`,
      };
    }

    if (get().files[newTrimmed] && oldTrimmed !== newTrimmed) {
      return { success: false, error: `A file named '${newTrimmed}' already exists.` };
    }

    const updated: VFSFile = {
      ...file,
      name: newTrimmed,
      extension: newExt,
      updatedAt: Date.now(),
    };

    set((state) => {
      const nextFiles = { ...state.files };
      delete nextFiles[oldTrimmed];
      nextFiles[newTrimmed] = updated;
      return { files: nextFiles };
    });

    return { success: true, file: updated };
  },

  getFile: (name) => {
    return get().files[name.trim()];
  },

  setActiveViewerFileId: (id) => {
    set({ activeViewerFileId: id });
  },

  setActiveIdeFileId: (id) => {
    set({ activeIdeFileId: id });
  },

  setViewerMode: (mode) => {
    set({ viewerMode: mode });
  },

  openInViewer: (fileId, initialMode) => {
    set((state) => {
      const alreadyOpen = state.openViewerFileIds.includes(fileId);
      return {
        openViewerFileIds: alreadyOpen ? state.openViewerFileIds : [...state.openViewerFileIds, fileId],
        activeViewerFileId: fileId,
        viewerMode: initialMode !== undefined ? initialMode : state.viewerMode,
      };
    });
  },

  closeViewerTab: (fileId) => {
    set((state) => {
      const remaining = state.openViewerFileIds.filter((id) => id !== fileId);
      const nextActive =
        state.activeViewerFileId === fileId
          ? remaining[remaining.length - 1] || null
          : state.activeViewerFileId;
      return {
        openViewerFileIds: remaining,
        activeViewerFileId: nextActive,
      };
    });
  },

  openInIde: (fileId) => {
    set((state) => {
      const alreadyOpen = state.openIdeFileIds.includes(fileId);
      return {
        openIdeFileIds: alreadyOpen ? state.openIdeFileIds : [...state.openIdeFileIds, fileId],
        activeIdeFileId: fileId,
      };
    });
  },

  closeIdeTab: (fileId) => {
    set((state) => {
      const remaining = state.openIdeFileIds.filter((id) => id !== fileId);
      const nextActive =
        state.activeIdeFileId === fileId
          ? remaining[remaining.length - 1] || null
          : state.activeIdeFileId;
      return {
        openIdeFileIds: remaining,
        activeIdeFileId: nextActive,
      };
    });
  },

  showGuiAlert: (title, message) => {
    set({
      guiAlert: {
        isOpen: true,
        title,
        message,
      },
    });
  },

  dismissGuiAlert: () => {
    set({ guiAlert: null });
  },

  reset: () => {
    set({
      files: createInitialFileMap(),
      openViewerFileIds: [],
      openIdeFileIds: [],
      activeViewerFileId: null,
      activeIdeFileId: null,
      viewerMode: 'edit',
      guiAlert: null,
    });
  },
}));
