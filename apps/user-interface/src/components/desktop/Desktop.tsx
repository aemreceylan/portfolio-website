import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  ShieldAlert,
  FolderPlus,
  Edit3,
  Trash2,
  ExternalLink,
  FileText,
  FileCode,
  Terminal,
  Settings,
} from 'lucide-react';
import { useWindowManager } from '#stores/window-manager.store';
import { AppIconResolver } from '#components/icons/AppIconResolver';
import {
  APP_REGISTRY,
  terminalManifest,
  settingsManifest,
  markdownViewerManifest,
  jsIdeManifest,
} from '#apps/app-registry';
import { AppManifest } from '@personal-os/shared';
import { WindowFrame } from '#components/window/WindowFrame';
import { SpatialSuspenseSkeleton } from '#components/window/SpatialSuspenseSkeleton';
import { Dock } from '#components/dock/Dock';
import { MusicPlayer } from '#components/desktop/MusicPlayer';
import { SoundControl } from '#components/desktop/SoundControl';
import { useTranslation } from '#i18n/i18n.store';
import { useViewport } from '#stores/viewport.store';
import { useFileSystemStore, VFSFile, parseAllowedExtension } from '#stores/filesystem.store';
import '#styles/design-tokens.css';
import '#styles/window.css';
import '#styles/desktop.css';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  file: VFSFile | null;
  app: AppManifest | null;
}

interface PromptModalState {
  isOpen: boolean;
  title: string;
  filename: string;
  mode: 'rename' | 'new-txt' | 'new-md' | 'new-js';
  file?: VFSFile;
  error?: string;
  targetCoords?: { x: number; y: number };
}

const CELL_WIDTH = 96;
const CELL_HEIGHT = 100;
const START_X = 24;
const START_Y = 62;
const DOCK_MARGIN = 92;

/**
 * Resolves default extension based on creation modal mode
 */
const getDefaultExtensionForMode = (mode: 'rename' | 'new-txt' | 'new-md' | 'new-js'): string => {
  switch (mode) {
    case 'new-js':
      return '.js';
    case 'new-md':
      return '.md';
    default:
      return '.txt';
  }
};

/**
 * Resolves collision-free grid coordinates closest to requested target coordinates.
 * If target cell is already occupied, searches outward for the nearest free cell.
 */
const resolveCollisionFreeCoordinates = (
  targetPos: { x: number; y: number },
  occupiedKeys: Set<string>,
  maxRows: number,
  fallbackPos: { x: number; y: number }
): { x: number; y: number } => {
  const winW = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1024;
  const maxCols = Math.max(1, Math.floor((winW - START_X) / CELL_WIDTH));

  const targetCol = Math.max(0, Math.round((targetPos.x - START_X) / CELL_WIDTH));
  const targetRow = Math.max(0, Math.min(maxRows - 1, Math.round((targetPos.y - START_Y) / CELL_HEIGHT)));
  const targetX = START_X + targetCol * CELL_WIDTH;
  const targetY = START_Y + targetRow * CELL_HEIGHT;

  if (!occupiedKeys.has(`${targetX},${targetY}`)) {
    return { x: targetX, y: targetY };
  }

  let minDistance = Infinity;
  let bestCandidate = fallbackPos;

  for (let c = 0; c < maxCols + 5; c++) {
    for (let r = 0; r < maxRows; r++) {
      const candX = START_X + c * CELL_WIDTH;
      const candY = START_Y + r * CELL_HEIGHT;
      const key = `${candX},${candY}`;

      if (!occupiedKeys.has(key)) {
        const dist = Math.hypot(candX - targetPos.x, candY - targetPos.y);
        if (dist < minDistance) {
          minDistance = dist;
          bestCandidate = { x: candX, y: candY };
        }
      }
    }
  }

  return bestCandidate;
};

/**
 * Primary Desktop Workspace Viewport orchestrating:
 * - Top spatial status bar (Brand logo, localized active window indicator, live digital clock)
 * - Desktop application shortcuts grid (Terminal, Settings, Markdown Viewer, JS IDE)
 * - Virtual File System (VFS) desktop files grid with single-click open
 * - Spatial Right-Click Context Menu for file/desktop actions (Rename, Delete, Upload, Create)
 * - Spatial Dark Glass Alert Modal for system file protection warnings
 * - Floating windows with 8-directional fluid resizing
 * - Dynamic bottom taskbar dock (open apps only)
 */
export const Desktop: React.FC = () => {
  const { windows, activeWindowId, openWindow } = useWindowManager();
  const { t, currentLanguage } = useTranslation();
  const { isMobile } = useViewport();
  const {
    files,
    createFile,
    deleteFile,
    renameFile,
    openInViewer,
    setViewerMode,
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
    rawX: 0,
    rawY: 0,
    file: null,
    app: null,
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

  // Listen to system factory reset event (triggered by `sudo rm -rf` or Settings)
  useEffect(() => {
    const handleSystemReset = () => {
      setCustomPositions({});
    };
    window.addEventListener('aec-system-reset', handleSystemReset);
    return () => window.removeEventListener('aec-system-reset', handleSystemReset);
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

  // Mobile long-press timer and tracking refs for touch context menu
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const justLongPressedRef = useRef<boolean>(false);
  const isLongPressActiveRef = useRef<boolean>(false);

  /**
   * Clears any active long-press timer
   */
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
  };

  /**
   * Clears long-press timer and resets touch states when pointer lifts or cancels
   */
  const handleDesktopPointerUp = () => {
    clearLongPressTimer();
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      justLongPressedRef.current = true;
      setTimeout(() => {
        justLongPressedRef.current = false;
      }, 350);
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const [draggingItemState, setDraggingItemState] = useState<{ id: string; x: number; y: number } | null>(null);

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

    const appEntries = Object.values(APP_REGISTRY);
    const appCount = appEntries.length;

    // Filter valid IDs to avoid stale entries from deleted files occupying spots
    const validIds = new Set<string>([
      ...appEntries.map(({ manifest }) => `app-${manifest.id}`),
      ...Object.values(files).map((f) => `file-${f.id}`),
    ]);

    // 1. Explicit user custom positions take precedence (for existing apps and files)
    Object.entries(customPositions).forEach(([id, pos]) => {
      if (validIds.has(id)) {
        positions[id] = pos;
        occupiedKeys.add(`${pos.x},${pos.y}`);
      }
    });

    // Helper to find next free cell scanning column by column, row by row from (startCol, startRow)
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
    // Initial preloaded files maintain their natural sequential slots; dynamically created files fill first available hole.
    const initialFiles: VFSFile[] = [];
    const dynamicFiles: VFSFile[] = [];

    Object.values(files).forEach((file) => {
      const isInitial = file.isSystem || file.id === 'user-demo-script' || file.createdAt <= 1700000000000;
      if (isInitial) {
        initialFiles.push(file);
      } else {
        dynamicFiles.push(file);
      }
    });

    // Initial files take their designated natural slots following the apps
    initialFiles.forEach((file, fileIdx) => {
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

    // Dynamically created files (via Terminal, IDE, or upload without right-click):
    // Fill the FIRST available empty slot on the desktop grid!
    const sortedDynamicFiles = dynamicFiles.toSorted(
      (a, b) => a.createdAt - b.createdAt || a.name.localeCompare(b.name)
    );
    sortedDynamicFiles.forEach((file) => {
      const itemId = `file-${file.id}`;
      if (positions[itemId]) return;

      const pos = findNextFreeCell(0, 0);
      positions[itemId] = pos;
      occupiedKeys.add(`${pos.x},${pos.y}`);
    });

    return positions;
  }, [customPositions, files, maxRows]);

  /**
   * Computes rendered (x, y) coordinates for any desktop item.
   * If the item is actively being dragged, it tracks the pointer position.
   */
  const getItemPosition = (itemId: string, _autoIndex?: number) => {
    if (draggingItemState?.id === itemId) {
      return { x: draggingItemState.x, y: draggingItemState.y };
    }
    return layoutPositions[itemId] || { x: START_X, y: START_Y };
  };

  const handleIconPointerDown = (
    e: React.PointerEvent<HTMLElement>,
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

      if (!currentDrag.hasMoved) return;

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

      const currentPos = { x: currentDrag.currentX, y: currentDrag.currentY };
      const fallbackPos = { x: currentDrag.origX, y: currentDrag.origY };
      const finalPos = resolveCollisionFreeCoordinates(currentPos, occupiedKeysByOthers, maxRows, fallbackPos);

      setCustomPositions((prev) => {
        const next = { ...prev, [currentDrag.id]: finalPos };
        try {
          localStorage.setItem('aec-desktop-icon-positions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
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
      if (justLongPressedRef.current || isLongPressActiveRef.current) return;
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
    window.addEventListener('pointerdown', handleGlobalClick);
    window.addEventListener('pointerup', handleDesktopPointerUp);
    window.addEventListener('pointercancel', handleDesktopPointerUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('pointerdown', handleGlobalClick);
      window.removeEventListener('pointerup', handleDesktopPointerUp);
      window.removeEventListener('pointercancel', handleDesktopPointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, promptModal.isOpen]);

  const activeWindow = activeWindowId ? windows[activeWindowId] : null;

  /**
   * Opens the file in the appropriate application upon single-click.
   * Markdown and text documents automatically open in Preview mode when directly clicked.
   */
  const handleOpenFile = (file: VFSFile) => {
    if (file.extension === 'md' || file.extension === 'txt') {
      openInViewer(file.id, 'preview');
      openWindow(markdownViewerManifest);
    } else if (file.extension === 'js') {
      openInIde(file.id);
      openWindow(jsIdeManifest);
    }
  };

  /**
   * Launches an application directly from desktop icon.
   * When Markdown Editor is opened directly, it automatically defaults to Edit mode.
   */
  const handleLaunchApp = (manifest: AppManifest) => {
    if (manifest.id === 'markdown-viewer') {
      setViewerMode('edit');
      const fsState = useFileSystemStore.getState();
      if (fsState.openViewerFileIds.length === 0) {
        const firstFile = Object.values(fsState.files).find(
          (f) => f.extension === 'md' || f.extension === 'txt'
        );
        if (firstFile) {
          openInViewer(firstFile.id, 'edit');
        }
      }
    }
    openWindow(manifest);
  };



  /**
   * Triggers subtle haptic feedback for touch gestures if supported by device
   */
  const triggerHapticFeedback = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // Safe fallback in sandboxed iframe or restricted environments
      }
    }
  };

  /**
   * Initiates long-press timer on mobile desktop background
   */
  const handleDesktopPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!isMobile || contextMenu.isOpen) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest('.window-container') ||
        target.closest('.spatial-statusbar') ||
        target.closest('.dock-container') ||
        target.closest('.spatial-context-menu') ||
        target.closest('.spatial-prompt-modal') ||
        target.closest('.spatial-alert-dialog') ||
        target.closest('.desktop-app-card') ||
        target.closest('.desktop-file-card'))
    ) {
      return;
    }

    clearLongPressTimer();
    longPressStartPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      justLongPressedRef.current = true;
      triggerHapticFeedback();
      setContextMenu({
        isOpen: true,
        x: Math.min(e.clientX, window.innerWidth - 220),
        y: Math.min(e.clientY, window.innerHeight - 300),
        rawX: e.clientX,
        rawY: e.clientY,
        file: null,
        app: null,
      });
    }, 500);
  };

  /**
   * Initiates long-press timer on mobile desktop file card
   */
  const handleFilePointerDown = (e: React.PointerEvent, file: VFSFile) => {
    e.stopPropagation();
    if (!isMobile || contextMenu.isOpen) return;
    clearLongPressTimer();
    longPressStartPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      justLongPressedRef.current = true;
      triggerHapticFeedback();
      setContextMenu({
        isOpen: true,
        x: Math.min(e.clientX, window.innerWidth - 220),
        y: Math.min(e.clientY, window.innerHeight - 200),
        rawX: e.clientX,
        rawY: e.clientY,
        file,
        app: null,
      });
    }, 500);
  };

  /**
   * Initiates long-press timer on mobile desktop application shortcut
   */
  const handleAppPointerDown = (e: React.PointerEvent, app: AppManifest) => {
    e.stopPropagation();
    if (!isMobile || contextMenu.isOpen) return;
    clearLongPressTimer();
    longPressStartPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      justLongPressedRef.current = true;
      triggerHapticFeedback();
      setContextMenu({
        isOpen: true,
        x: Math.min(e.clientX, window.innerWidth - 220),
        y: Math.min(e.clientY, window.innerHeight - 140),
        rawX: e.clientX,
        rawY: e.clientY,
        file: null,
        app,
      });
    }, 500);
  };

  /**
   * Clears long-press timer if pointer moves beyond tolerance threshold (10px)
   */
  const handleDesktopPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!longPressStartPosRef.current) return;
    const dist = Math.hypot(
      e.clientX - longPressStartPosRef.current.x,
      e.clientY - longPressStartPosRef.current.y
    );
    if (dist > 10) {
      clearLongPressTimer();
    }
  };



  /**
   * Handles right click on empty desktop area.
   * Strictly ignores right clicks originating inside any window, statusbar, dock, app, or file.
   */
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent overwriting an already open context menu (e.g. from mobile long-press)
    if (contextMenu.isOpen) {
      return;
    }

    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest('.window-container') ||
        target.closest('.desktop-statusbar') ||
        target.closest('.dock-container') ||
        target.closest('.desktop-app-card') ||
        target.closest('.desktop-file-card') ||
        target.closest('.spatial-context-menu') ||
        target.closest('.spatial-prompt-modal') ||
        target.closest('.spatial-alert-dialog'))
    ) {
      return;
    }

    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 300),
      rawX: e.clientX,
      rawY: e.clientY,
      file: null,
      app: null,
    });
  };

  /**
   * Handles right click on a desktop file card
   */
  const handleFileContextMenu = (e: React.MouseEvent, file: VFSFile) => {
    e.preventDefault();
    e.stopPropagation();
    if (contextMenu.isOpen && contextMenu.file?.id === file.id) {
      return;
    }
    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 180),
      rawX: e.clientX,
      rawY: e.clientY,
      file,
      app: null,
    });
  };

  /**
   * Handles right click on a desktop application shortcut card
   */
  const handleAppContextMenu = (e: React.MouseEvent, app: AppManifest) => {
    e.preventDefault();
    e.stopPropagation();
    if (contextMenu.isOpen && contextMenu.app?.id === app.id) {
      return;
    }
    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 230),
      y: Math.min(e.clientY, window.innerHeight - 140),
      rawX: e.clientX,
      rawY: e.clientY,
      file: null,
      app,
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
      setCustomPositions((prev) => {
        const next = { ...prev };
        delete next[`file-${file.id}`];
        try {
          localStorage.setItem('aec-desktop-icon-positions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  /**
   * Handles local file upload via File#text()
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const content = await file.text();
      const res = createFile(file.name, content);
      if (!res.success) {
        showGuiAlert('Dosya Yükleme Hatası', res.error || 'Dosya oluşturulamadı.');
      }
    } catch {
      showGuiAlert('Dosya Yükleme Hatası', 'Dosya okunamadı.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRenameSubmit = (rawName: string): boolean => {
    if (!promptModal.file) return true;
    const res = renameFile(promptModal.file.name, rawName);
    if (!res.success) {
      setPromptModal((prev) => ({ ...prev, error: res.error }));
      return false;
    }
    return true;
  };

  const handleNewFileSubmit = (rawName: string): boolean => {
    let finalName = rawName;
    const ext = parseAllowedExtension(rawName);
    if (!ext) {
      const defaultExt = getDefaultExtensionForMode(promptModal.mode);
      finalName = `${rawName}${defaultExt}`;
    }
    const res = createFile(finalName, '');
    if (!res.success) {
      setPromptModal((prev) => ({ ...prev, error: res.error }));
      return false;
    }

    if (res.file && promptModal.targetCoords) {
      const occupiedKeys = new Set<string>();
      Object.values(layoutPositions).forEach((pos) => {
        occupiedKeys.add(`${pos.x},${pos.y}`);
      });

      const targetPos = promptModal.targetCoords;
      const coords = resolveCollisionFreeCoordinates(targetPos, occupiedKeys, maxRows, targetPos);

      setCustomPositions((prev) => {
        const next = { ...prev, [`file-${res.file!.id}`]: coords };
        try {
          localStorage.setItem('aec-desktop-icon-positions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }

    return true;
  };

  /**
   * Submits prompt modal (rename or new file)
   */
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = promptModal.filename.trim();
    if (!rawName) return;

    const success = promptModal.mode === 'rename'
      ? handleRenameSubmit(rawName)
      : handleNewFileSubmit(rawName);

    if (success) {
      setPromptModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  /**
   * Renders context menu action items avoiding nested conditionals in JSX
   */
  const renderContextMenuContent = () => {
    if (contextMenu.app) {
      return (
        <button
          type="button"
          className="spatial-context-item"
          role="menuitem"
          onClick={() => {
            handleLaunchApp(contextMenu.app!);
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
        >
          <ExternalLink size={14} />
          <span>{t('ctx_open')}</span>
        </button>
      );
    }

    if (contextMenu.file) {
      return (
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
      );
    }

    return (
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
              targetCoords: { x: contextMenu.rawX, y: contextMenu.rawY },
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
              targetCoords: { x: contextMenu.rawX, y: contextMenu.rawY },
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
              targetCoords: { x: contextMenu.rawX, y: contextMenu.rawY },
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
    );
  };

  return (
    <main
      className={`desktop-viewport ${isMobile ? 'is-mobile' : ''}`}
      onContextMenu={handleDesktopContextMenu}
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={isMobile ? handleDesktopPointerMove : undefined}
      onPointerUp={isMobile ? handleDesktopPointerUp : undefined}
      onPointerCancel={isMobile ? handleDesktopPointerUp : undefined}
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
          <button
            type="button"
            className="os-brand"
            onClick={() => openWindow(settingsManifest)}
            aria-label="AEC System Settings"
          >
            <AppIconResolver variant="brand" size={18} className="os-brand-logo" />
            <span>AEC</span>
          </button>
          {!isMobile && activeWindow && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              / {activeWindow.title}
            </span>
          )}
        </div>

        <div className="statusbar-right">
          <MusicPlayer />
          <SoundControl />
          <time>{timeString}</time>
        </div>
      </header>

      {/* Desktop App Shortcuts (Terminal, Settings, Markdown Viewer, JS IDE) */}
      {isMobile && (
        <div className="desktop-mobile-section-header" data-testid="mobile-section-apps">
          <span>{t('desktop_section_apps')}</span>
        </div>
      )}
      <section className="desktop-apps-grid" aria-label="Desktop Applications">
        {Object.values(APP_REGISTRY).map(({ manifest }, appIdx) => {
          let appName = manifest.name;
          if (manifest.id === 'settings') appName = t('appName_settings');
          if (manifest.id === 'terminal') appName = t('appName_terminal');
          if (manifest.id === 'markdown-viewer') appName = t('appName_markdown');
          if (manifest.id === 'js-ide') appName = t('appName_ide');
          if (manifest.id === 'game-hub') appName = t('appName_game_hub');
          const itemId = `app-${manifest.id}`;
          const pos = getItemPosition(itemId, appIdx);
          const isDragging = draggingItemState?.id === itemId;

          return (
            <button
              key={manifest.id}
              type="button"
              className={`desktop-app-card ${isDragging ? 'dragging' : ''}`}
              style={
                isMobile
                  ? undefined
                  : {
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: isDragging ? 1000 : 2,
                    }
              }
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  handleAppPointerDown(e, manifest);
                } else {
                  handleIconPointerDown(e, itemId, pos);
                }
              }}
              onContextMenu={(e) => handleAppContextMenu(e, manifest)}
              onClick={() => {
                if (justDraggedRef.current || justLongPressedRef.current || isLongPressActiveRef.current) return;
                handleLaunchApp(manifest);
              }}
              data-testid={`desktop-app-${manifest.id}`}
              aria-label={appName}
            >
              <div className="desktop-app-icon">
                <AppIconResolver appId={manifest.id} size={32} />
              </div>
              <span className="desktop-app-label">{appName}</span>
            </button>
          );
        })}
      </section>

      {/* Desktop Virtual Files (Single-click to open in viewer or IDE) */}
      {isMobile && Object.keys(files).length > 0 && (
        <div className="desktop-mobile-section-header" data-testid="mobile-section-files">
          <span>{t('desktop_section_files')}</span>
        </div>
      )}
      <section className="desktop-files-grid" aria-label="Desktop Files">
        {Object.values(files).map((file, fileIdx) => {
          const isJs = file.extension === 'js';
          const itemId = `file-${file.id}`;
          const autoIndex = Object.values(APP_REGISTRY).length + fileIdx;
          const pos = getItemPosition(itemId, autoIndex);
          const isDragging = draggingItemState?.id === itemId;

          return (
            <button
              key={file.id}
              type="button"
              className={`desktop-file-card ${isJs ? 'js-file' : ''} ${isDragging ? 'dragging' : ''}`}
              style={
                isMobile
                  ? undefined
                  : {
                      position: 'absolute',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: isDragging ? 1000 : 2,
                    }
              }
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isMobile) {
                  handleFilePointerDown(e, file);
                } else {
                  handleIconPointerDown(e, itemId, pos);
                }
              }}
              onClick={() => {
                if (justDraggedRef.current || justLongPressedRef.current || isLongPressActiveRef.current) return;
                handleOpenFile(file);
              }}
              onContextMenu={(e) => handleFileContextMenu(e, file)}
              data-testid={`desktop-file-${file.name}`}
              aria-label={`File ${file.name}`}
            >
              <div className="desktop-file-icon">
                <AppIconResolver fileExtension={file.extension} size={30} />
              </div>
              <span className="desktop-file-name">{file.name}</span>
            </button>
          );
        })}
      </section>

      {/* Spatial Dark Glass Right-Click Context Menu */}
      {contextMenu.isOpen && (
        <div
          role="menu"
          tabIndex={-1}
          className="spatial-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          aria-label="Desktop Context Menu"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }}
        >
          {renderContextMenuContent()}
        </div>
      )}

      {/* Spatial Prompt Modal for Rename & New File Creation */}
      {promptModal.isOpen && (
        <div
          className="spatial-alert-overlay"
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
      {guiAlert?.isOpen && (
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
