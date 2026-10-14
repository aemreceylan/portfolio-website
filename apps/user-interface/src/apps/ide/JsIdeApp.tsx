import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play,
  Save,
  Check,
  Trash2,
  FileCode,
  Plus,
  AlertCircle,
  X,
  Code2,
  FolderOpen,
} from 'lucide-react';
import { useFileSystemStore, VFSFile } from '#stores/filesystem.store';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/js-ide.css';

/**
 * Log message structure captured from the isolated sandbox execution
 */
interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'system';
  message: string;
  timestamp: string;
}

function parseLogLevel(level: string): ConsoleLog['type'] {
  if (level === 'error') return 'error';
  if (level === 'warn') return 'warn';
  return 'log';
}

let ideLogCounter = 0;
function generateSafeLogId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `log-${crypto.randomUUID()}`;
  }
  ideLogCounter += 1;
  return `log-${Date.now()}-${ideLogCounter}`;
}

/**
 * JavaScript IDE & Code Studio Component
 * Features:
 * - Real IDE-like tab management: opens empty by default; only opened scripts appear as tabs
 * - Close individual script tabs via (x) button
 * - Create new .js scripts (+ button)
 * - Code editing with line numbering and tab indentation
 * - Pre-execution syntax checking and error diagnostics
 * - Isolated sandboxed execution without DOM/cookie access
 * - Real-time console capture (console.log, console.warn, console.error)
 * - VFS store persistence (save, switch .js scripts)
 */
export const JsIdeApp: React.FC = () => {
  const {
    files,
    openIdeFileIds,
    activeIdeFileId,
    setActiveIdeFileId,
    openInIde,
    closeIdeTab,
    updateFile,
    createFile,
  } = useFileSystemStore();
  const { t } = useTranslation();

  // All .js files from Virtual File System
  const allJsFiles = useMemo(() => {
    return Object.values(files).filter((f): f is VFSFile => f.extension === 'js');
  }, [files]);

  // Open tabs strictly based on openIdeFileIds
  const openFiles = useMemo(() => {
    return openIdeFileIds
      .map((id) => Object.values(files).find((f) => f.id === id))
      .filter((f): f is VFSFile => f !== undefined && f.extension === 'js');
  }, [openIdeFileIds, files]);

  // Determine current active script
  const currentFile = useMemo(() => {
    if (activeIdeFileId) {
      const found = openFiles.find((f) => f.id === activeIdeFileId);
      if (found) return found;
    }
    return openFiles[0] || null;
  }, [activeIdeFileId, openFiles]);

  const [code, setCode] = useState<string>('');
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: 'init-sys',
      type: 'system',
      message: 'AEC JavaScript Sandbox Ready. Click "Run" to execute.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [sandboxHtml, setSandboxHtml] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // New script dialog state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newScriptName, setNewScriptName] = useState<string>('');
  const [newScriptError, setNewScriptError] = useState<string | null>(null);

  // Tracks unsaved changes in current script
  const isDirty = useMemo(() => {
    if (!currentFile) return false;
    return code !== currentFile.content;
  }, [code, currentFile]);

  // Sync editor content whenever active script changes
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content);
      setSaveSuccess(false);
      setExecutionError(null);
    } else {
      setCode('');
    }
  }, [currentFile?.id]);

  // Handle postMessage logs coming from the sandbox iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current?.contentWindow && event.source && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (event.data?.source === 'aec-js-sandbox') {
        const { level, args } = event.data;
        const msg = (Array.isArray(args) ? args : [])
          .map((arg: unknown) => (typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : String(arg)))
          .join(' ');

        if (level === 'error') {
          setExecutionError(msg);
        }

        setLogs((prev) => [
          ...prev,
          {
            id: generateSafeLogId(),
            type: parseLogLevel(level),
            message: msg,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Compute line numbers
  const lineCount = useMemo(() => {
    return Math.max(1, code.split('\n').length);
  }, [code]);

  /**
   * Pre-execution syntax error validator
   */
  const validateSyntax = (sourceCode: string): string | null => {
    try {
      // eslint-disable-next-line sonarjs/code-eval -- Pure compile-time syntax validation without executing the function
      new Function(sourceCode);
      return null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return err.message;
      }
      return typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
    }
  };

  /**
   * Executes code inside an isolated sandbox iframe
   */
  const handleRun = () => {
    setLogs([]);
    setExecutionError(null);

    // Step 1: Pre-execution syntax validation
    const syntaxErr = validateSyntax(code);
    if (syntaxErr) {
      const formattedErr = `🚨 ${t('ide_syntax_error')}: ${syntaxErr}`;
      setExecutionError(formattedErr);
      setLogs([
        {
          id: `syntax-err-${Date.now()}`,
          type: 'error',
          message: formattedErr,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // Step 2: Assemble isolated sandbox HTML
    const iframeDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script>
            (function() {
              function send(level, args) {
                try {
                  window.parent.postMessage({
                    source: 'aec-js-sandbox',
                    level: level,
                    args: Array.from(args).map(function(item) {
                      try {
                        if (typeof item === 'function') return item.toString();
                        if (item instanceof Error) return item.name + ': ' + item.message;
                        return item;
                      } catch(e) {
                        return String(item);
                      }
                    })
                  }, '*');
                } catch(e) {
                  window.parent.postMessage({
                    source: 'aec-js-sandbox',
                    level: 'error',
                    args: ['PostMessage Serialization Error: ' + e.message]
                  }, '*');
                }
              }

              console.log = function() { send('log', arguments); };
              console.warn = function() { send('warn', arguments); };
              console.error = function() { send('error', arguments); };
              console.info = function() { send('log', arguments); };

              window.onerror = function(message, source, lineno, colno, error) {
                var errDetail = error ? (error.name + ': ' + error.message) : String(message);
                send('error', ['🚨 Runtime Error: ' + errDetail + ' (line ' + lineno + ')']);
                return true;
              };

              window.onunhandledrejection = function(event) {
                var reason = event.reason ? (event.reason.message || String(event.reason)) : 'Unknown rejection';
                send('error', ['🚨 Unhandled Promise Rejection: ' + reason]);
              };
            })();
          </script>
        </head>
        <body>
          <script>
            try {
              ${code}
            } catch (err) {
              console.error('🚨 ' + (err.name || 'Error') + ': ' + (err.message || String(err)));
            }
          </script>
        </body>
      </html>
    `;

    setSandboxHtml(iframeDoc);
  };

  /**
   * Saves modified script back to Virtual File System
   */
  const handleSave = () => {
    if (!currentFile) return;
    const res = updateFile(currentFile.name, code);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S to quickly save code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, currentFile]);

  /**
   * Creates a new .js script and opens it into tabs
   */
  const handleCreateNewScript = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = newScriptName.trim();
    if (!raw) {
      setNewScriptError('Script name cannot be empty.');
      return;
    }

    const scriptFilename = raw.endsWith('.js') ? raw : `${raw}.js`;
    const defaultScriptContent = `// ${scriptFilename}\nconsole.log("Running ${scriptFilename}...");\n`;

    const res = createFile(scriptFilename, defaultScriptContent);
    if (!res.success) {
      setNewScriptError(res.error || 'Failed to create script');
      return;
    }

    if (res.file) {
      openInIde(res.file.id);
    }

    setShowNewModal(false);
    setNewScriptName('');
    setNewScriptError(null);
  };

  /**
   * Handle Tab indentation & Ctrl+S in editor
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <section className="js-ide-container" aria-label="JavaScript IDE">
      {/* Top Toolbar */}
      <div className="js-ide-toolbar">
        {/* Open Scripts Tabs */}
        <div className="js-ide-file-tabs" role="tablist" aria-label="Open JavaScript Files">
          {openFiles.map((f) => {
            const isActive = currentFile?.id === f.id;
            const fileIsDirty = isActive && isDirty;
            return (
              <div
                key={f.id}
                role="tab"
                tabIndex={0}
                aria-selected={isActive}
                className={`js-file-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveIdeFileId(f.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIdeFileId(f.id);
                  }
                }}
              >
                <FileCode size={13} />
                <span>{f.name}</span>
                {fileIsDirty && <span className="js-dirty-dot" title={t('editor_unsaved')} />}
                <button
                  type="button"
                  className="js-file-tab-close"
                  title={t('editor_close_tab')}
                  aria-label={`${t('editor_close_tab')} ${f.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeIdeTab(f.id);
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}

          {/* Create New Script Tab Button */}
          <button
            type="button"
            className="js-file-tab-new"
            onClick={() => {
              const defaultName = `script-${allJsFiles.length + 1}.js`;
              setNewScriptName(defaultName);
              setNewScriptError(null);
              setShowNewModal(true);
            }}
            title={t('ide_new_script')}
            aria-label={t('ide_new_script')}
            data-testid="js-ide-new-script-btn"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Actions (Save, Run, Error Banner) */}
        {currentFile && (
          <div className="js-ide-actions">
            {executionError && (
              <div className="js-error-indicator" title={executionError}>
                <AlertCircle size={12} />
                <span>{executionError.slice(0, 32)}...</span>
              </div>
            )}

            <button
              type="button"
              className={`js-ide-btn ${isDirty ? 'dirty' : ''}`}
              onClick={handleSave}
              aria-label="Save Script to Filesystem"
              title={`${t('editor_save')} (Ctrl+S)`}
            >
              {saveSuccess ? <Check size={13} color="#34d399" /> : <Save size={13} />}
              <span>{saveSuccess ? t('editor_saved') : t('editor_save')}</span>
            </button>

            <button
              type="button"
              className="js-ide-btn run-btn"
              onClick={handleRun}
              aria-label="Execute Script in Sandbox"
              data-testid="js-ide-run-button"
            >
              <Play size={13} fill="currentColor" />
              <span>Run</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor & Console Area or Empty State */}
      {!currentFile ? (
        <div className="js-empty-state">
          <div className="js-empty-icon">
            <Code2 size={28} />
          </div>
          <h3 className="js-empty-title">{t('editor_no_open_files')}</h3>
          <p className="js-empty-desc">{t('editor_open_or_create')}</p>

          <div className="js-empty-actions">
            <button
              type="button"
              className="js-empty-btn"
              onClick={() => {
                const defaultName = `script-${allJsFiles.length + 1}.js`;
                setNewScriptName(defaultName);
                setNewScriptError(null);
                setShowNewModal(true);
              }}
            >
              <Plus size={14} />
              <span>{t('ide_new_script')}</span>
            </button>
          </div>

          {/* Quick List of available scripts to open */}
          {allJsFiles.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('editor_open_file')}:
              </span>
              <div className="js-quick-files-list">
                {allJsFiles.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="js-quick-file-chip"
                    onClick={() => openInIde(f.id)}
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
        <div className="js-ide-main">
          {/* Editor Area with Line Numbers */}
          <div className="js-editor-wrapper">
            <div className="js-line-numbers" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <textarea
              className="js-code-textarea"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (executionError) setExecutionError(null);
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="JavaScript Code Editor"
              placeholder="// Write JavaScript code here..."
              data-testid="js-code-textarea"
            />
          </div>

          {/* Bottom Console Output Panel */}
          <section className="js-console-panel" aria-label="Console Output">
            <div className="js-console-header">
              <span>OUTPUT CONSOLE</span>
              <button
                type="button"
                className="js-console-clear-btn"
                onClick={() => {
                  setLogs([]);
                  setExecutionError(null);
                }}
                aria-label="Clear Console Output"
              >
                <Trash2 size={11} style={{ display: 'inline', marginRight: 4 }} />
                Clear
              </button>
            </div>

            <div className="js-console-logs" data-testid="js-console-output">
              {logs.map((log) => (
                <div key={log.id} className={`js-log-line ${log.type}`}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* New Script Modal */}
      {showNewModal && (
        <div className="spatial-alert-overlay" role="dialog" aria-modal="true">
          <div className="spatial-alert-dialog">
            <h3 className="spatial-alert-title" style={{ color: '#fff' }}>
              {t('ide_new_script')}
            </h3>
            {newScriptError && (
              <p style={{ color: '#f43f5e', fontSize: 12, marginTop: 4 }}>{newScriptError}</p>
            )}
            <form onSubmit={handleCreateNewScript}>
              <input
                type="text"
                className="spatial-input-field"
                value={newScriptName}
                onChange={(e) => {
                  setNewScriptName(e.target.value);
                  setNewScriptError(null);
                }}
                autoFocus
                placeholder="my-script.js"
                data-testid="new-script-name-input"
              />
              <div className="spatial-alert-actions" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="spatial-alert-btn-secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  {t('ctx_delete') === 'Sil' ? 'İptal' : 'Cancel'}
                </button>
                <button type="submit" className="spatial-alert-btn" data-testid="new-script-submit-btn">
                  {t('ctx_delete') === 'Sil' ? 'Oluştur' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden isolated sandbox execution frame */}
      {sandboxHtml && (
        <iframe
          ref={iframeRef}
          key={sandboxHtml}
          srcDoc={sandboxHtml}
          sandbox="allow-scripts"
          style={{ display: 'none' }}
          title="JS Sandbox Execution Frame"
          data-testid="js-sandbox-iframe"
        />
      )}
    </section>
  );
};

export default JsIdeApp;
