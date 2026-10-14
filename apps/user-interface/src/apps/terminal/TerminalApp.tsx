import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useTranslation } from '#i18n/i18n.store';
import { useFileSystemStore, parseAllowedExtension } from '#stores/filesystem.store';
import { performSystemReset } from '#services/system-reset';
import '#styles/terminal.css';

/**
 * Representation of an individual line rendered in the terminal window
 */
interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'accent';
  text: string;
}

import { Translations } from '#i18n/translations';

function buildHelpLines(t: (key: keyof Translations) => string): TerminalLine[] {
  const ts = Date.now();
  return [
    { id: `out-${ts}-1`, type: 'output', text: t('terminal_help_header') },
    { id: `out-${ts}-2`, type: 'accent', text: `  ls          - ${t('terminal_cmd_ls_desc')}` },
    { id: `out-${ts}-3`, type: 'accent', text: `  cat <file>  - ${t('terminal_cmd_cat_desc')}` },
    { id: `out-${ts}-4`, type: 'accent', text: `  touch <file>- ${t('terminal_cmd_touch_desc')}` },
    { id: `out-${ts}-5`, type: 'accent', text: `  rm <file>   - ${t('terminal_cmd_rm_desc')}` },
    { id: `out-${ts}-6`, type: 'accent', text: `  nano <file> - ${t('terminal_cmd_nano_desc')}` },
    { id: `out-${ts}-7`, type: 'accent', text: `  su <user>   - ${t('terminal_cmd_su_desc')}` },
    { id: `out-${ts}-8`, type: 'accent', text: `  exit        - ${t('terminal_cmd_exit_desc')}` },
    { id: `out-${ts}-9`, type: 'accent', text: `  clear       - ${t('terminal_cmd_clear_desc')}` },
    { id: `out-${ts}-10`, type: 'accent', text: `  sudo rm -rf - ${t('terminal_cmd_reset_desc')}` },
  ];
}

function buildCatLines(cmdArg: string, fs: ReturnType<typeof useFileSystemStore.getState>): TerminalLine[] {
  if (!cmdArg) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: 'cat: missing file operand. Try "cat bio.md"',
      },
    ];
  }

  const targetFile = fs.getFile(cmdArg);
  if (!targetFile) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: `cat: ${cmdArg}: No such file. Available files: ${Object.keys(fs.files).join(', ')}`,
      },
    ];
  }

  return targetFile.content.split('\n').map((cLine, idx) => ({
    id: `out-${Date.now()}-cat-${idx}`,
    type: 'output',
    text: cLine,
  }));
}

function buildTouchLines(cmdArg: string, fs: ReturnType<typeof useFileSystemStore.getState>): TerminalLine[] {
  if (!cmdArg) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: 'touch: missing file operand. Usage: touch <filename.ext>',
      },
    ];
  }

  const ext = parseAllowedExtension(cmdArg);
  if (!ext) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: `touch: cannot touch '${cmdArg}': Only .txt, .md, .js supported.`,
      },
    ];
  }

  const createRes = fs.createFile(cmdArg);
  if (!createRes.success) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: `touch: cannot touch '${cmdArg}': ${createRes.error}`,
      },
    ];
  }
  return [];
}

function buildRmLines(cmdArg: string, fs: ReturnType<typeof useFileSystemStore.getState>): TerminalLine[] {
  if (!cmdArg) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: 'rm: missing operand. Usage: rm <filename>',
      },
    ];
  }

  const rmParts = cmdArg.split(/\s+/);
  const firstPart = rmParts[0]?.toLowerCase();
  if (firstPart?.startsWith('-rf') || firstPart?.startsWith('-fr')) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: 'rm: cannot remove root filesystem: Permission denied. Try "sudo rm -rf /"',
      },
    ];
  }

  const delRes = fs.deleteFile(cmdArg);
  if (!delRes.success) {
    return [
      {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: delRes.error || `rm: cannot remove '${cmdArg}': Operation failed`,
      },
    ];
  }
  return [];
}

function buildSudoLines(
  cmdArg: string,
  t: (key: keyof Translations) => string,
  onReset: () => void
): TerminalLine[] {
  const subParts = cmdArg.split(/\s+/);
  const subCmd = subParts[0]?.toLowerCase();
  const subFlags = subParts.slice(1).join(' ').trim().toLowerCase();

  const isResetRm =
    subCmd === 'rm' &&
    (subFlags.startsWith('-rf') ||
      subFlags.startsWith('-fr') ||
      subFlags === '-r' ||
      subFlags === '-f' ||
      subFlags === '');

  if (isResetRm) {
    onReset();
    return [
      {
        id: `out-${Date.now()}-status`,
        type: 'accent',
        text: t('terminal_reset_status'),
      },
    ];
  }

  return [
    {
      id: `out-${Date.now()}-err`,
      type: 'error',
      text: `sudo: '${cmdArg}' is not permitted. Try 'sudo rm -rf /' to reset the system.`,
    },
  ];
}

/**
 * State of the interactive Nano in-terminal editor session
 */
interface NanoSession {
  filename: string;
  content: string;
  initialContent: string;
  isNew: boolean;
  statusMessage?: string;
}

/**
 * Validation schema ensuring raw user command input does not exceed buffer limits
 */
const commandInputSchema = z.string().trim().max(100);

/**
 * Schema validating target usernames during user switching (e.g., "su ahmet")
 */
const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username must contain only alphanumeric characters, underscores or dashes');

/**
 * Interactive Linux Terminal CLI component providing:
 * - Real Linux commands (ls, cat, touch, rm, nano, su, whoami, clear, exit)
 * - VFS store integration with live filesystem state
 * - Full GNU Nano in-terminal text editor with ^O Save and ^X Exit controls
 * - Static terminal history buffer preserving past command outputs
 * - Strict inline Linux error outputs for system file protection and unsupported formats
 */
export const TerminalApp: React.FC = () => {
  const { t } = useTranslation();

  /** Current active username in the shell; defaults to 'guest' */
  const [currentUser, setCurrentUser] = useState<string>('guest');

  /** Active Nano editor session, or null when in command line mode */
  const [nanoSession, setNanoSession] = useState<NanoSession | null>(null);

  /** Line history rendered in the scroll area */
  const [lines, setLines] = useState<TerminalLine[]>(() => [
    { id: 'init-0', type: 'accent', text: t('terminal_welcome_title') },
    { id: 'init-1', type: 'accent', text: t('terminal_welcome_subtitle') },
    { id: 'init-2', type: 'output', text: t('terminal_welcome_help') },
  ]);

  /** Current value in the active command input field */
  const [inputValue, setInputValue] = useState<string>('');

  /** Ref for auto-scrolling to bottom on new output */
  const scrollRef = useRef<HTMLDivElement>(null);

  /** Ref for Nano textarea auto-focus */
  const nanoTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll whenever new output lines are appended
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Auto-focus Nano textarea when session activates
  useEffect(() => {
    if (nanoSession && nanoTextareaRef.current) {
      nanoTextareaRef.current.focus();
    }
  }, [nanoSession]);

  /**
   * Saves the file in Nano editor to VFS store
   */
  const handleNanoSave = () => {
    if (!nanoSession) return;
    const fs = useFileSystemStore.getState();
    const existing = fs.getFile(nanoSession.filename);

    if (existing) {
      fs.updateFile(nanoSession.filename, nanoSession.content);
    } else {
      fs.createFile(nanoSession.filename, nanoSession.content);
    }

    const lineCount = nanoSession.content.split('\n').length;
    setNanoSession((prev) =>
      prev
        ? {
            ...prev,
            initialContent: prev.content,
            isNew: false,
            statusMessage: `[ Wrote ${lineCount} lines to ${prev.filename} ]`,
          }
        : null
    );
  };

  /**
   * Exits Nano editor and returns to terminal prompt
   */
  const handleNanoExit = () => {
    if (!nanoSession) return;
    const isModified = nanoSession.content !== nanoSession.initialContent;

    setLines((prev) => [
      ...prev,
      {
        id: `nano-exit-${Date.now()}`,
        type: 'output',
        text: isModified
          ? `[ Closed nano for ${nanoSession.filename} (Unsaved changes discarded) ]`
          : `[ Closed nano for ${nanoSession.filename} ]`,
      },
    ]);
    setNanoSession(null);
  };

  /**
   * Handles keyboard shortcuts inside the Nano editor
   */
function handleNanoCommand(
  cmdArg: string,
  fs: ReturnType<typeof useFileSystemStore.getState>
): { session?: NanoSession; errorLine?: TerminalLine } {
  if (!cmdArg) {
    return {
      errorLine: {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: 'nano: missing file operand. Usage: nano <filename.ext>',
      },
    };
  }

  const existingFile = fs.getFile(cmdArg);
  if (existingFile) {
    return {
      session: {
        filename: existingFile.name,
        content: existingFile.content,
        initialContent: existingFile.content,
        isNew: false,
      },
    };
  }

  const ext = parseAllowedExtension(cmdArg);
  if (!ext) {
    return {
      errorLine: {
        id: `out-${Date.now()}-err`,
        type: 'error',
        text: `nano: invalid extension for '${cmdArg}'. Only .txt, .md, .js supported.`,
      },
    };
  }

  return {
    session: {
      filename: cmdArg,
      content: '',
      initialContent: '',
      isNew: true,
      statusMessage: `[ New File: ${cmdArg} ]`,
    },
  };
}

  /**
   * Handles keyboard shortcuts inside the Nano editor
   */
  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+O or Ctrl+S: WriteOut (Save)
    if (e.ctrlKey && (e.key.toLowerCase() === 'o' || e.key.toLowerCase() === 's')) {
      e.preventDefault();
      handleNanoSave();
      return;
    }

    // Ctrl+X or Esc: Exit
    if ((e.ctrlKey && e.key.toLowerCase() === 'x') || e.key === 'Escape') {
      e.preventDefault();
      handleNanoExit();
    }
  };

  /**
   * Evaluates and executes user commands entered in the prompt
   *
   * @param rawInput - Raw command string entered by the user
   */
  const handleCommand = (rawInput: string) => {
    const parseResult = commandInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      setLines((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'error', text: 'Invalid command input length.' },
      ]);
      return;
    }

    const command = parseResult.data;
    if (!command) return;

    // Record the user command entry in history (immutable static line)
    const inputLine: TerminalLine = {
      id: `in-${Date.now()}`,
      type: 'input',
      text: `${currentUser}@aec:~$ ${command}`,
    };

    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const cmdArg = parts.slice(1).join(' ').trim();

    const fs = useFileSystemStore.getState();
    const newOutputLines: TerminalLine[] = [];

    switch (mainCmd) {
      case 'help':
        newOutputLines.push(...buildHelpLines(t));
        break;

      case 'ls': {
        const fileNames = Object.keys(fs.files);
        newOutputLines.push({
          id: `out-${Date.now()}-ls`,
          type: 'accent',
          text: fileNames.length > 0 ? fileNames.join('   ') : '(empty directory)',
        });
        break;
      }

      case 'cat':
        newOutputLines.push(...buildCatLines(cmdArg, fs));
        break;

      case 'touch':
        newOutputLines.push(...buildTouchLines(cmdArg, fs));
        break;

      case 'rm':
        newOutputLines.push(...buildRmLines(cmdArg, fs));
        break;

      case 'nano': {
        const nanoResult = handleNanoCommand(cmdArg, fs);
        if (nanoResult.session) {
          setNanoSession(nanoResult.session);
          return;
        }
        if (nanoResult.errorLine) {
          newOutputLines.push(nanoResult.errorLine);
        }
        break;
      }

      case 'su': {
        const userValidation = usernameSchema.safeParse(cmdArg);
        if (!userValidation.success) {
          newOutputLines.push({
            id: `out-${Date.now()}-err`,
            type: 'error',
            text: t('terminal_user_invalid'),
          });
        } else {
          const newUsername = userValidation.data;
          setCurrentUser(newUsername);
          newOutputLines.push({
            id: `out-${Date.now()}-su`,
            type: 'accent',
            text: t('terminal_user_switched', { user: newUsername }),
          });
        }
        break;
      }

      case 'exit':
        setCurrentUser('guest');
        newOutputLines.push({
          id: `out-${Date.now()}-out`,
          type: 'output',
          text: t('terminal_user_switched', { user: 'guest' }),
        });
        break;

      case 'sudo':
        newOutputLines.push(
          ...buildSudoLines(cmdArg, t, () => {
            performSystemReset();
            setCurrentUser('guest');
          })
        );
        break;

      case 'clear':
        setLines([]);
        setInputValue('');
        return;

      default:
        newOutputLines.push({
          id: `out-${Date.now()}-err`,
          type: 'error',
          text: t('terminal_cmd_not_found', { cmd: command }),
        });
        break;
    }

    setLines((prev) => [...prev, inputLine, ...newOutputLines]);
    setInputValue('');
  };

  /**
   * Triggers command execution upon pressing Enter key
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(inputValue);
    }
  };

  // Render GNU Nano editor if session is active
  if (nanoSession) {
    const isModified = nanoSession.content !== nanoSession.initialContent;

    return (
      <section className="nano-container" aria-label={`GNU nano Editor - ${nanoSession.filename}`}>
        <div className="nano-titlebar">
          <div>
            <span>GNU nano 7.2</span>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
            <span>File: {nanoSession.filename}</span>
            {isModified && <span className="nano-modified-tag">[Modified]</span>}
          </div>
          {nanoSession.statusMessage && (
            <span style={{ fontSize: 11, color: 'var(--aurora-cyan)' }}>
              {nanoSession.statusMessage}
            </span>
          )}
        </div>

        <textarea
          ref={nanoTextareaRef}
          className="nano-textarea"
          value={nanoSession.content}
          onChange={(e) =>
            setNanoSession((prev) => (prev ? { ...prev, content: e.target.value } : null))
          }
          onKeyDown={handleNanoKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label={`Nano editing content of ${nanoSession.filename}`}
        />

        <div className="nano-footer">
          <button type="button" className="nano-shortcut-btn" onClick={handleNanoSave}>
            <span className="nano-shortcut-key">^O</span> WriteOut (Save)
          </button>
          <button type="button" className="nano-shortcut-btn" onClick={handleNanoExit}>
            <span className="nano-shortcut-key">^X</span> Exit
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="terminal-container"
      onClick={() => document.getElementById('term-input')?.focus()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') document.getElementById('term-input')?.focus();
      }}
      tabIndex={0}
      aria-label="AEC Interactive Terminal"
    >
      <div className="terminal-scroll-area" ref={scrollRef}>
        {lines.map((line) => (
          <div key={line.id} className={`terminal-line terminal-output-${line.type}`}>
            {line.text}
          </div>
        ))}

        <div className="terminal-input-row">
          <span className="terminal-prompt-prefix">{currentUser}@aec:~$</span>
          <input
            id="term-input"
            type="text"
            className="terminal-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('terminal_input_placeholder')}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal input prompt"
          />
        </div>
      </div>
    </section>
  );
};
