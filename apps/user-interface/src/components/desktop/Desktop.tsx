import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  Terminal,
  Settings,
  AppWindow,
  FileText,
  FileCode,
  Code2,
  ShieldAlert,
  FolderPlus,
  Upload,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useWindowManager } from '#stores/window-manager.store';
import {
  APP_REGISTRY,
  terminalManifest,
  settingsManifest,
  markdownViewerManifest,
  jsIdeManifest,
} from '#apps/app-registry';
import { WindowFrame } from '#components/window/WindowFrame';
import { SpatialSuspenseSkeleton } from '#components/window/SpatialSuspenseSkeleton';
import { Dock } from '#components/dock/Dock';
import { useTranslation } from '#i18n/i18n.store';
import { useFileSystemStore, VFSFile, parseAllowedExtension } from '#stores/filesystem.store';
import '#styles/design-tokens.css';
import '#styles/window.css';
import '#styles/desktop.css';

/**
 * Maps iconName string from manifest to standard Lucide React SVG icon
 */
const renderDesktopIcon = (iconName: string) => {
  switch (iconName) {
    case 'Terminal':
      return <Terminal size={24} />;
    case 'Settings':
      return <Settings size={24} />;
    case 'FileText':
      return <FileText size={24} />;
    case 'Code2':
      return <Code2 size={24} />;
    default:
      return <AppWindow size={24} />;
  }
};

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  file: VFSFile | null;
}

interface PromptModalState {
  isOpen: boolean;
  title: string;
  filename: string;
  mode: 'rename' | 'new-txt' | 'new-md' | 'new-js';
  file?: VFSFile;
  error?: string;
}

/**
 * Primary Desktop Workspace Viewport orchestrating:
 * - Top spatial status bar (Brand logo, localized active window indicator, live digital clock)
 * - Desktop application shortcuts grid (Terminal, Settings, Markdown Viewer, JS IDE)
 * - Virtual File System (VFS) desktop files grid with double-click open
 * - Spatial Right-Click Context Menu for file/desktop actions (Rename, Delete, Upload, Create)
 * - Spatial Dark Glass Alert Modal for system file protection warnings
 * - Floating windows with 8-directional fluid resizing
 * - Dynamic bottom taskbar dock (open apps only)
 */
export const Desktop: React.FC = () => {
  const { windows, activeWindowId, openWindow } = useWindowManager();
  const { t, currentLanguage } = useTranslation();
  const {
    files,
    createFile,
    deleteFile,
    renameFile,
    openInViewer,
    openInIde,
    guiAlert,
    showGuiAlert,
    dismissGuiAlert,
  } = useFileSystemStore();

  const [timeString, setTimeString] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    file: null,
  });

  const [promptModal, setPromptModal] = useState<PromptModalState>({
    isOpen: false,
    title: '',
    filename: '',
    mode: 'new-txt',
  });

  // Saved custom icon positions { [itemId]: { x: number, y: number } }
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('aec-desktop-icon-positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track window dimensions for dynamic column row calculation
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerHeight > 0) {
        setViewportHeight(window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronous drag tracking ref to prevent state-batching race conditions
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currentX: number;
    currentY: number;
    hasMoved: boolean;
  } | null>(null);

  // Suppresses onClick / onDoubleClick triggers immediately after a drag-and-drop gesture
  const justDraggedRef = useRef<boolean>(false);

  const [draggingItemState, setDraggingItemState] = useState<{ id: string; x: number; y: number } | null>(null);

  const CELL_WIDTH = 96;
  const CELL_HEIGHT = 100;
  const START_X = 24;
  const START_Y = 62;
  const DOCK_MARGIN = 92;

  const maxRows = Math.max(1, Math.floor((viewportHeight - START_Y - DOCK_MARGIN) / CELL_HEIGHT));

  /**
   * Computes collision-free coordinates for all desktop items.
   * Items with explicit custom positions retain their coordinates.
   * Auto-positioned items reside in their natural grid slots; if a natural slot
   * is occupied by a custom position, the item automatically shifts to the nearest
   * unoccupied slot, completely preventing visual overlapping.
   */
  const layoutPositions = useMemo<Record<string, { x: number; y: number }>>(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const occupiedKeys = new Set<string>();

    // 1. Explicit user custom positions take precedence
    Object.entries(customPositions).forEach(([id, pos]) => {
      positions[id] = pos;
      occupiedKeys.add(`${pos.x},${pos.y}`);
    });

    const appEntries = Object.values(APP_REGISTRY);
    const appCount = appEntries.length;

    // Helper to find next free cell if natural slot is claimed by a custom position
    const findNextFreeCell = (startCol = 0, startRow = 0) => {
      let c = startCol;
      let r = startRow;
      while (occupiedKeys.has(`${START_X + c * CELL_WIDTH},${START_Y + r * CELL_HEIGHT}`)) {
        r++;
        if (r >= maxRows) {
          r = 0;
          c++;
        }
      }
      return {
        x: START_X + c * CELL_WIDTH,
        y: START_Y + r * CELL_HEIGHT,
      };
    };

    // 2. Apps without custom positions
    appEntries.forEach(({ manifest }, appIdx) => {
      const itemId = `app-${manifest.id}`;
      if (positions[itemId]) return;

      const naturalRow = appIdx % maxRows;
      const naturalCol = Math.floor(appIdx / maxRows);
      const naturalKey = `${START_X + naturalCol * CELL_WIDTH},${START_Y + naturalRow * CELL_HEIGHT}`;

      if (!occupiedKeys.has(naturalKey)) {
        const pos = { x: START_X + naturalCol * CELL_WIDTH, y: START_Y + naturalRow * CELL_HEIGHT };
        positions[itemId] = pos;
        occupiedKeys.add(naturalKey);
      } else {
        const pos = findNextFreeCell(naturalCol, naturalRow);
        positions[itemId] = pos;
        occupiedKeys.add(`${pos.x},${pos.y}`);
      }
    });

    // 3. Virtual files without custom positions
    Object.values(files).forEach((file, fileIdx) => {
      const itemId = `file-${file.id}`;
      if (positions[itemId]) return;

      const autoIndex = appCount + fileIdx;
      const naturalRow = autoIndex % maxRows;
      const naturalCol = Math.floor(autoIndex / maxRows);
      const naturalKey = `${START_X + naturalCol * CELL_WIDTH},${START_Y + naturalRow * CELL_HEIGHT}`;

      if (!occupiedKeys.has(naturalKey)) {
        const pos = { x: START_X + naturalCol * CELL_WIDTH, y: START_Y + naturalRow * CELL_HEIGHT };
        positions[itemId] = pos;
        occupiedKeys.add(naturalKey);
      } else {
        const pos = findNextFreeCell(naturalCol, naturalRow);
        positions[itemId] = pos;
        occupiedKeys.add(`${pos.x},${pos.y}`);
      }
    });

    return positions;
  }, [customPositions, files, maxRows]);

  /**
   * Computes rendered (x, y) coordinates for any desktop item.
   * If the item is actively being dragged, it tracks the pointer position.
   */
  const getItemPosition = (itemId: string, _autoIndex?: number) => {
    if (draggingItemState && draggingItemState.id === itemId) {
      return { x: draggingItemState.x, y: draggingItemState.y };
    }
    return layoutPositions[itemId] || { x: START_X, y: START_Y };
  };

  const handleIconPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    itemId: string,
    currentPos: { x: number; y: number }
  ) => {
    // Only primary button (left click) initiates dragging; right-click opens context menu
    if (e.button !== 0) return;

    dragRef.current = {
      id: itemId,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      currentX: currentPos.x,
      currentY: currentPos.y,
      hasMoved: false,
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      const distance = Math.hypot(dx, dy);

      if (distance > 4 || dragRef.current.hasMoved) {
        dragRef.current.hasMoved = true;
        const winW = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1024;
        const winH = typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 768;
        const minX = 12;
        const maxX = Math.max(minX, winW - 88);
        const minY = 50;
        const maxY = Math.max(minY, winH - 90);

        const nextX = Math.max(minX, Math.min(maxX, dragRef.current.origX + dx));
        const nextY = Math.max(minY, Math.min(maxY, dragRef.current.origY + dy));

        dragRef.current.currentX = nextX;
        dragRef.current.currentY = nextY;
        setDraggingItemState({ id: dragRef.current.id, x: nextX, y: nextY });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (!dragRef.current) return;
      const currentDrag = dragRef.current;
      dragRef.current = null;
      setDraggingItemState(null);

      if (currentDrag.hasMoved) {
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 150);

        // Collect all occupied coordinates by other desktop items
        const occupiedKeysByOthers = new Set<string>();
        Object.entries(layoutPositions).forEach(([id, pos]) => {
          if (id !== currentDrag.id) {
            occupiedKeysByOthers.add(`${pos.x},${pos.y}`);
          }
        });

        const winW = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1024;
        const maxCols = Math.max(1, Math.floor((winW - START_X) / CELL_WIDTH));

        const targetCol = Math.max(0, Math.round((currentDrag.currentX - START_X) / CELL_WIDTH));
        const targetRow = Math.max(0, Math.min(maxRows - 1, Math.round((currentDrag.currentY - START_Y) / CELL_HEIGHT)));
        const targetX = START_X + targetCol * CELL_WIDTH;
        const targetY = START_Y + targetRow * CELL_HEIGHT;

        let finalX = targetX;
        let finalY = targetY;

        // Collision Prevention: If target grid cell is occupied by another icon, snap to nearest free cell
        if (occupiedKeysByOthers.has(`${targetX},${targetY}`)) {
          let minDistance = Infinity;
          let bestCandidate = { x: currentDrag.origX, y: currentDrag.origY };

          for (let c = 0; c < maxCols + 5; c++) {
            for (let r = 0; r < maxRows; r++) {
              const candX = START_X + c * CELL_WIDTH;
              const candY = START_Y + r * CELL_HEIGHT;
              const key = `${candX},${candY}`;

              if (!occupiedKeysByOthers.has(key)) {
                const dist = Math.hypot(candX - currentDrag.currentX, candY - currentDrag.currentY);
                if (dist < minDistance) {
                  minDistance = dist;
                  bestCandidate = { x: candX, y: candY };
                }
              }
            }
          }

          finalX = bestCandidate.x;
          finalY = bestCandidate.y;
        }

        setCustomPositions((prev) => {
          const next = { ...prev, [currentDrag.id]: { x: finalX, y: finalY } };
          try {
            localStorage.setItem('aec-desktop-icon-positions', JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Update live clock every 10 seconds based on localized region
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  // Close context menu on global click or Escape key
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contextMenu.isOpen) {
          setContextMenu((prev) => ({ ...prev, isOpen: false }));
        }
        if (promptModal.isOpen) {
          setPromptModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, promptModal.isOpen]);

  const activeWindow = activeWindowId ? windows[activeWindowId] : null;

  /**
   * Opens the file in the appropriate application upon double-click
   */
  const handleOpenFile = (file: VFSFile) => {
    if (file.extension === 'md' || file.extension === 'txt') {
      openInViewer(file.id);
      openWindow(markdownViewerManifest);
    } else if (file.extension === 'js') {
      openInIde(file.id);
      openWindow(jsIdeManifest);
    }
  };

  /**
   * Handles right click on empty desktop area.
   * Strictly ignores right clicks originating inside any window, statusbar or dock.
   */
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest('.window-container') ||
        target.closest('.desktop-statusbar') ||
        target.closest('.dock-container'))
    ) {
      return;
    }

    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 300),
      file: null,
    });
  };

  /**
   * Handles right click on a desktop file card
   */
  const handleFileContextMenu = (e: React.MouseEvent, file: VFSFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 180),
      file,
    });
  };

  /**
   * Deletes a file, guarding system protected files
   */
  const handleDeleteFile = (file: VFSFile) => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    if (file.isSystem) {
      showGuiAlert(
        'Sistem Dosyası Korunuyor',
        `"${file.name}" dosyası işletim sistemi için temel bir bileşendir ve silinemez.`
      );
    } else {
      deleteFile(file.name);
    }
  };

  /**
   * Handles local file upload via FileReader
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = parseAllowedExtension(file.name);
    if (!ext) {
      showGuiAlert(
        'Desteklenmeyen Dosya Türü',
        `"${file.name}" kabul edilmedi. Sadece .txt, .md ve .js dosyaları yüklenebilir.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      const res = createFile(file.name, content);
      if (!res.success) {
        showGuiAlert('Dosya Yükleme Hatası', res.error || 'Dosya oluşturulamadı.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /**
   * Submits prompt modal (rename or new file)
   */
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = promptModal.filename.trim();
    if (!rawName) return;

    if (promptModal.mode === 'rename') {
      if (!promptModal.file) return;
      const res = renameFile(promptModal.file.name, rawName);
      if (!res.success) {
        setPromptModal((prev) => ({ ...prev, error: res.error }));
        return;
      }
    } else {
      let finalName = rawName;
      const ext = parseAllowedExtension(rawName);
      if (!ext) {
        const defaultExt =
          promptModal.mode === 'new-js' ? '.js' : promptModal.mode === 'new-md' ? '.md' : '.txt';
        finalName = `${rawName}${defaultExt}`;
      }
      const res = createFile(finalName, '');
      if (!res.success) {
        setPromptModal((prev) => ({ ...prev, error: res.error }));
        return;
      }
    }

    setPromptModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <main
      className="desktop-viewport"
      onContextMenu={handleDesktopContextMenu}
      data-testid="desktop-viewport"
    >
      {/* Hidden file input for file upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.js"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        data-testid="file-upload-input"
      />

      {/* Top Status Bar with enhanced thickness */}
      <header className="spatial-statusbar" role="banner">
        <div className="statusbar-left">
          <div className="os-brand">
            <span className="os-brand-icon" aria-hidden="true" />
            <span>AEC</span>
          </div>
          {activeWindow && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              / {activeWindow.title}
            </span>
          )}
        </div>

        <div className="statusbar-right">
          <time>{timeString}</time>
        </div>
      </header>

      {/* Desktop App Shortcuts (Terminal, Settings, Markdown Viewer, JS IDE) */}
      <section className="desktop-apps-grid" aria-label="Desktop Applications">
        {Object.values(APP_REGISTRY).map(({ manifest }, appIdx) => {
          let appName = manifest.name;
          if (manifest.id === 'settings') appName = t('appName_settings');
          if (manifest.id === 'terminal') appName = t('appName_terminal');
          const itemId = `app-${manifest.id}`;
          const pos = getItemPosition(itemId, appIdx);
          const isDragging = draggingItemState?.id === itemId;

          return (
            <div
              key={manifest.id}
              className={`desktop-app-card ${isDragging ? 'dragging' : ''}`}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: isDragging ? 1000 : 2,
              }}
              onPointerDown={(e) => handleIconPointerDown(e, itemId, pos)}
              onClick={() => {
                if (justDraggedRef.current) return;
                openWindow(manifest);
              }}
              data-testid={`desktop-app-${manifest.id}`}
              role="button"
              tabIndex={0}
              aria-label={appName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openWindow(manifest);
              }}
            >
              <div className="desktop-app-icon">{renderDesktopIcon(manifest.iconName)}</div>
              <span className="desktop-app-label">{appName}</span>
            </div>
          );
        })}
      </section>

      {/* Desktop Virtual Files (Double-click to open in viewer or IDE) */}
      <section className="desktop-files-grid" aria-label="Desktop Files">
        {Object.values(files).map((file, fileIdx) => {
          const isJs = file.extension === 'js';
          const itemId = `file-${file.id}`;
          const autoIndex = Object.values(APP_REGISTRY).length + fileIdx;
          const pos = getItemPosition(itemId, autoIndex);
          const isDragging = draggingItemState?.id === itemId;

          return (
            <div
              key={file.id}
              className={`desktop-file-card ${isJs ? 'js-file' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: isDragging ? 1000 : 2,
              }}
              onPointerDown={(e) => handleIconPointerDown(e, itemId, pos)}
              onDoubleClick={() => {
                if (justDraggedRef.current) return;
                handleOpenFile(file);
              }}
              onContextMenu={(e) => handleFileContextMenu(e, file)}
              data-testid={`desktop-file-${file.name}`}
              role="button"
              tabIndex={0}
              aria-label={`File ${file.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOpenFile(file);
              }}
            >
              <div className="desktop-file-icon">
                {isJs ? <FileCode size={22} /> : <FileText size={22} />}
              </div>
              <span className="desktop-file-name">{file.name}</span>
            </div>
          );
        })}
      </section>

      {/* Spatial Dark Glass Right-Click Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="spatial-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
          aria-label="Desktop Context Menu"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.file ? (
            /* Context Menu for specific file */
            <>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  handleOpenFile(contextMenu.file!);
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                }}
              >
                <ExternalLink size={14} />
                <span>{t('ctx_open')}</span>
              </button>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  const f = contextMenu.file!;
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  setPromptModal({
                    isOpen: true,
                    title: `${f.name} - ${t('ctx_rename')}`,
                    filename: f.name,
                    mode: 'rename',
                    file: f,
                  });
                }}
              >
                <Edit3 size={14} />
                <span>{t('ctx_rename')}</span>
              </button>
              <div className="spatial-context-separator" />
              <button
                type="button"
                className="spatial-context-item danger"
                role="menuitem"
                onClick={() => handleDeleteFile(contextMenu.file!)}
              >
                <Trash2 size={14} />
                <span>{t('ctx_delete')}</span>
              </button>
            </>
          ) : (
            /* Context Menu for empty desktop workspace */
            <>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  setPromptModal({
                    isOpen: true,
                    title: t('ctx_new_txt'),
                    filename: 'not.txt',
                    mode: 'new-txt',
                  });
                }}
              >
                <FileText size={14} />
                <span>{t('ctx_new_txt')}</span>
              </button>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  setPromptModal({
                    isOpen: true,
                    title: t('ctx_new_md'),
                    filename: 'belge.md',
                    mode: 'new-md',
                  });
                }}
              >
                <FolderPlus size={14} />
                <span>{t('ctx_new_md')}</span>
              </button>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  setPromptModal({
                    isOpen: true,
                    title: t('ctx_new_js'),
                    filename: 'script.js',
                    mode: 'new-js',
                  });
                }}
              >
                <FileCode size={14} />
                <span>{t('ctx_new_js')}</span>
              </button>
              <div className="spatial-context-separator" />
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  openWindow(terminalManifest);
                }}
              >
                <Terminal size={14} />
                <span>{t('ctx_open_terminal')}</span>
              </button>
              <button
                type="button"
                className="spatial-context-item"
                role="menuitem"
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  openWindow(settingsManifest);
                }}
              >
                <Settings size={14} />
                <span>{t('ctx_open_settings')}</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Spatial Prompt Modal for Rename & New File Creation */}
      {promptModal.isOpen && (
        <div
          className="spatial-alert-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-modal-title"
        >
          <div className="spatial-alert-dialog">
            <h3 id="prompt-modal-title" className="spatial-alert-title" style={{ color: '#fff' }}>
              {promptModal.title}
            </h3>
            {promptModal.error && (
              <p style={{ color: '#f43f5e', fontSize: 12, marginTop: 4 }}>
                {promptModal.error}
              </p>
            )}
            <form onSubmit={handlePromptSubmit}>
              <input
                type="text"
                className="spatial-input-field"
                value={promptModal.filename}
                onChange={(e) =>
                  setPromptModal((prev) => ({ ...prev, filename: e.target.value, error: undefined }))
                }
                autoFocus
                placeholder="dosya.txt"
                data-testid="spatial-prompt-input"
              />
              <div className="spatial-alert-actions" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="spatial-alert-btn-secondary"
                  onClick={() => setPromptModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  İptal
                </button>
                <button type="submit" className="spatial-alert-btn" data-testid="spatial-prompt-submit">
                  Tamam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spatial Dark Glass Alert Modal (GUI Error Warning) */}
      {guiAlert && guiAlert.isOpen && (
        <div
          className="spatial-alert-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-desc"
        >
          <div className="spatial-alert-dialog">
            <div className="spatial-alert-header">
              <ShieldAlert size={20} />
              <h3 id="alert-dialog-title" className="spatial-alert-title">
                {guiAlert.title}
              </h3>
            </div>
            <p id="alert-dialog-desc" className="spatial-alert-message">
              {guiAlert.message}
            </p>
            <div className="spatial-alert-actions">
              <button
                type="button"
                className="spatial-alert-btn"
                onClick={dismissGuiAlert}
                autoFocus
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Open Windows */}
      {Object.values(windows).map((win) => {
        if (!win.isOpen) return null;
        const appEntry = APP_REGISTRY[win.id];
        if (!appEntry) return null;

        const AppComponent = appEntry.component;

        return (
          <WindowFrame key={win.id} window={win}>
            <Suspense fallback={<SpatialSuspenseSkeleton appTitle={win.title} />}>
              <AppComponent manifest={appEntry.manifest} />
            </Suspense>
          </WindowFrame>
        );
      })}

      {/* Bottom Spatial Dock (Shows open applications only) */}
      <Dock />
    </main>
  );
};
