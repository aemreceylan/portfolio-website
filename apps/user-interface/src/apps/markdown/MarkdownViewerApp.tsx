import React, { useState, useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import {
  FileText,
  Eye,
  Code2,
  Columns,
  Save,
  Plus,
  X,
  FolderOpen,
  Check,
} from 'lucide-react';
import { useFileSystemStore, VFSFile } from '#stores/filesystem.store';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/markdown-viewer.css';

/**
 * Enhanced Markdown and Text Document Editor & Viewer Application
 * Features:
 * - Real IDE-like tab management: opens empty by default; only opened files appear as tabs
 * - Close individual tabs via (x) button
 * - Create new .md and .txt documents (+ button)
 * - Read & Write: Full editing mode with line numbers, live HTML preview, and side-by-side split mode
 * - Automatically defaults to Edit mode upon opening documents for direct editing
 * - Save changes directly to Virtual File System (VFS) with Save button and Ctrl+S hotkey
 * - 7-locale multilingual localization support
 */
export const MarkdownViewerApp: React.FC = () => {
  const {
    files,
    openViewerFileIds,
    activeViewerFileId,
    setActiveViewerFileId,
    openInViewer,
    closeViewerTab,
    createFile,
    updateFile,
    viewerMode,
    setViewerMode,
  } = useFileSystemStore();
  const { t } = useTranslation();

  const [editContent, setEditContent] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('belge.md');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter only text-based readable documents (.md, .txt) from VFS
  const allReadableFiles = useMemo(() => {
    return Object.values(files).filter(
      (f): f is VFSFile => f.extension === 'md' || f.extension === 'txt'
    );
  }, [files]);

  // Open tabs strictly based on openViewerFileIds
  const openFiles = useMemo(() => {
    return openViewerFileIds
      .map((id) => Object.values(files).find((f) => f.id === id))
      .filter((f): f is VFSFile => Boolean(f));
  }, [openViewerFileIds, files]);

  // Determine current active document
  const currentFile = useMemo(() => {
    if (activeViewerFileId) {
      const found = openFiles.find((f) => f.id === activeViewerFileId);
      if (found) return found;
    }
    return openFiles[0] || null;
  }, [activeViewerFileId, openFiles]);

  // Synchronize local edit content when switching active document
  useEffect(() => {
    if (currentFile) {
      setEditContent(currentFile.content);
      setSaveSuccess(false);
    } else {
      setEditContent('');
    }
  }, [currentFile?.id]);

  // Calculate line numbers for editor
  const lineCount = useMemo(() => {
    return Math.max(1, editContent.split('\n').length);
  }, [editContent]);

  const isDirty = currentFile ? editContent !== currentFile.content : false;

  /**
   * Saves current content to Virtual File System
   */
  const handleSave = () => {
    if (!currentFile) return;
    updateFile(currentFile.name, editContent);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  /**
   * Keyboard shortcuts handling (Ctrl+S / Tab indent)
   */
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = editContent.substring(0, start) + '  ' + editContent.substring(end);
      setEditContent(updated);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  /**
   * Creates a new document and opens it as a tab
   */
  const handleCreateDocument = () => {
    const raw = newDocName.trim();
    if (!raw) return;

    let finalName = raw;
    if (!raw.endsWith('.md') && !raw.endsWith('.txt')) {
      finalName = `${raw}.md`;
    }

    const res = createFile(finalName, `# ${finalName.replace(/\.[^/.]+$/, '')}\n\n`);
    if (res.success && res.file) {
      openInViewer(res.file.id, 'edit');
      setShowNewModal(false);
      setNewDocName('belge.md');
    }
  };

  // Render markdown to HTML when in preview or split mode
  const renderedHtml = useMemo(() => {
    if (!currentFile) return '';
    const contentToRender = editContent;
    if (currentFile.extension === 'txt') {
      return `<pre style="font-family: inherit; white-space: pre-wrap;">${contentToRender}</pre>`;
    }
    try {
      return marked.parse(contentToRender, { async: false }) as string;
    } catch {
      return `<p>${contentToRender}</p>`;
    }
  }, [currentFile, editContent]);

  return (
    <section className="md-viewer-container" aria-label="Markdown & Document Editor">
      {/* Top Toolbar */}
      <div className="md-viewer-toolbar">
        {/* Document Selector Tabs */}
        <div className="md-viewer-file-picker" role="tablist" aria-label="Open Documents">
          {openFiles.map((file) => {
            const isActive = currentFile?.id === file.id;
            const fileIsDirty = isActive && isDirty;
            return (
              <div
                key={file.id}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                className={`md-file-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveViewerFileId(file.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveViewerFileId(file.id);
                  }
                }}
              >
                <FileText size={13} />
                <span>{file.name}</span>
                {fileIsDirty && <span className="md-dirty-dot" title={t('editor_unsaved')} />}
                <button
                  type="button"
                  className="md-tab-close-btn"
                  title={t('editor_close_tab')}
                  aria-label={`${t('editor_close_tab')} ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeViewerTab(file.id);
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}

          {/* Create New Document Tab Button */}
          <button
            type="button"
            className="md-tab-new-btn"
            data-testid="md-new-file-btn"
            title={t('editor_new_file')}
            aria-label={t('editor_new_file')}
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={13} />
          </button>
        </div>

        {/* View Mode & Save Actions */}
        {currentFile && (
          <div className="md-viewer-actions">
            <button
              type="button"
              className={`md-save-btn ${isDirty ? 'dirty' : ''}`}
              onClick={handleSave}
              title={`${t('editor_save')} (Ctrl+S)`}
              aria-label={t('editor_save')}
            >
              {saveSuccess ? <Check size={12} color="#34d399" /> : <Save size={12} />}
              <span>{saveSuccess ? t('editor_saved') : t('editor_save')}</span>
            </button>

            <button
              type="button"
              className={`md-mode-btn ${viewerMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewerMode('edit')}
              aria-label={t('editor_mode_edit')}
            >
              <Code2 size={12} />
              <span>{t('editor_mode_edit')}</span>
            </button>

            <button
              type="button"
              className={`md-mode-btn ${viewerMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewerMode('split')}
              aria-label={t('editor_mode_split')}
            >
              <Columns size={12} />
              <span>{t('editor_mode_split')}</span>
            </button>

            <button
              type="button"
              className={`md-mode-btn ${viewerMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewerMode('preview')}
              aria-label={t('editor_mode_preview')}
            >
              <Eye size={12} />
              <span>{t('editor_mode_preview')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Document Content or Empty State */}
      <div className="md-viewer-body">
        {!currentFile ? (
          <div className="md-empty-state">
            <div className="md-empty-icon">
              <FileText size={28} />
            </div>
            <h3 className="md-empty-title">{t('editor_no_open_files')}</h3>
            <p className="md-empty-desc">{t('editor_open_or_create')}</p>

            <div className="md-empty-actions">
              <button
                type="button"
                className="md-empty-btn"
                onClick={() => setShowNewModal(true)}
              >
                <Plus size={14} />
                <span>{t('editor_new_file')}</span>
              </button>
            </div>

            {/* Quick List of existing files in VFS to open */}
            {allReadableFiles.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {t('editor_open_file')}:
                </span>
                <div className="md-quick-files-list">
                  {allReadableFiles.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="md-quick-file-chip"
                      onClick={() => openInViewer(f.id, 'edit')}
                    >
                      <FolderOpen size={12} />
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {viewerMode === 'edit' && (
              <div className="md-edit-panel">
                <div className="md-line-numbers" aria-hidden="true">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="md-editor-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  placeholder="# Write markdown here..."
                  spellCheck={false}
                  data-testid="markdown-raw-view"
                />
              </div>
            )}

            {viewerMode === 'preview' && (
              <div className="md-preview-panel">
                <article
                  className="md-rendered-content"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  data-testid="markdown-rendered-view"
                />
              </div>
            )}

            {viewerMode === 'split' && (
              <div className="md-split-container">
                <div className="md-edit-panel">
                  <div className="md-line-numbers" aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    ref={textareaRef}
                    className="md-editor-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="# Write markdown here..."
                    spellCheck={false}
                    data-testid="markdown-raw-view"
                  />
                </div>
                <div className="md-preview-panel">
                  <article
                    className="md-rendered-content"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    data-testid="markdown-rendered-view"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Document Modal */}
      {showNewModal && (
        <div className="md-modal-overlay">
          <div className="md-modal-card">
            <h4>{t('editor_new_file')}</h4>
            <input
              type="text"
              data-testid="new-file-name-input"
              className="md-modal-input"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateDocument();
                if (e.key === 'Escape') setShowNewModal(false);
              }}
              autoFocus
            />
            <div className="md-modal-actions">
              <button
                type="button"
                className="md-modal-btn cancel"
                onClick={() => setShowNewModal(false)}
              >
                {t('ctx_delete') === 'Sil' ? 'İptal' : 'Cancel'}
              </button>
              <button
                type="button"
                data-testid="new-file-submit-btn"
                className="md-modal-btn confirm"
                onClick={handleCreateDocument}
              >
                {t('ctx_delete') === 'Sil' ? 'Oluştur' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarkdownViewerApp;
