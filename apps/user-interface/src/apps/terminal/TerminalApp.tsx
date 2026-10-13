import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/terminal.css';

/**
 * Representation of an individual line rendered in the terminal window
 */
interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'accent';
  text: string;
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
 * Interactive Terminal CLI component allowing visitors to explore engineering bio,
 * technical skills, contact links, and switch between simulated user accounts.
 */
export const TerminalApp: React.FC = () => {
  const { t } = useTranslation();

  /** Current active username in the shell; defaults to 'guest' */
  const [currentUser, setCurrentUser] = useState<string>('guest');

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

  // Auto-scroll whenever new output lines are appended
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

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

    // Record the user command entry in history
    const inputLine: TerminalLine = {
      id: `in-${Date.now()}`,
      type: 'input',
      text: `${currentUser}@aec:~$ ${command}`,
    };

    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const cmdArg = parts.slice(1).join(' ');

    const newOutputLines: TerminalLine[] = [];

    switch (mainCmd) {
      case 'help':
        newOutputLines.push(
          { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_help_header') },
          { id: `out-${Date.now()}-2`, type: 'accent', text: `  ls          - List available files (bio.md, skills.md, contact.md)` },
          { id: `out-${Date.now()}-3`, type: 'accent', text: `  cat <file>  - ${t('terminal_cmd_bio_desc')}` },
          { id: `out-${Date.now()}-4`, type: 'accent', text: `  skills      - ${t('terminal_cmd_skills_desc')}` },
          { id: `out-${Date.now()}-5`, type: 'accent', text: `  contact     - ${t('terminal_cmd_contact_desc')}` },
          { id: `out-${Date.now()}-6`, type: 'accent', text: `  su <user>   - ${t('terminal_cmd_su_desc')}` },
          { id: `out-${Date.now()}-7`, type: 'accent', text: `  whoami      - ${t('terminal_cmd_whoami_desc')}` },
          { id: `out-${Date.now()}-8`, type: 'accent', text: `  clear       - ${t('terminal_cmd_clear_desc')}` }
        );
        break;

      case 'ls':
      case 'dir':
        newOutputLines.push({
          id: `out-${Date.now()}-ls`,
          type: 'accent',
          text: 'bio.md   skills.md   contact.md   welcome.txt',
        });
        break;

      case 'su':
      case 'login': {
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

      case 'whoami':
        newOutputLines.push({
          id: `out-${Date.now()}-who`,
          type: 'accent',
          text: currentUser,
        });
        break;

      case 'exit':
      case 'logout':
        setCurrentUser('guest');
        newOutputLines.push({
          id: `out-${Date.now()}-out`,
          type: 'output',
          text: t('terminal_user_switched', { user: 'guest' }),
        });
        break;

      case 'cat':
      case 'about': {
        const normalized = cmdArg.toLowerCase().trim();
        if (normalized === 'bio.md' || normalized === 'bio' || mainCmd === 'about') {
          newOutputLines.push(
            { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_bio_title') },
            { id: `out-${Date.now()}-2`, type: 'output', text: t('terminal_bio_text1') },
            { id: `out-${Date.now()}-3`, type: 'output', text: t('terminal_bio_text2') }
          );
        } else if (normalized === 'skills.md' || normalized === 'skills') {
          newOutputLines.push(
            { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_skills_fe') },
            { id: `out-${Date.now()}-2`, type: 'output', text: t('terminal_skills_be') },
            { id: `out-${Date.now()}-3`, type: 'output', text: t('terminal_skills_devops') }
          );
        } else if (normalized === 'contact.md' || normalized === 'contact') {
          newOutputLines.push(
            { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_contact_header') },
            { id: `out-${Date.now()}-2`, type: 'accent', text: '  GitHub:   https://github.com' },
            { id: `out-${Date.now()}-3`, type: 'accent', text: '  LinkedIn: https://linkedin.com' },
            { id: `out-${Date.now()}-4`, type: 'accent', text: '  Email:    ahmet@example.com' }
          );
        } else if (normalized === 'welcome.txt' || normalized === 'welcome') {
          newOutputLines.push(
            { id: `out-${Date.now()}-1`, type: 'accent', text: t('terminal_welcome_title') },
            { id: `out-${Date.now()}-2`, type: 'accent', text: t('terminal_welcome_subtitle') },
            { id: `out-${Date.now()}-3`, type: 'output', text: t('terminal_welcome_help') }
          );
        } else {
          newOutputLines.push({
            id: `out-${Date.now()}-cat-err`,
            type: 'error',
            text: `cat: ${cmdArg || 'unknown'}: No such file. Try "ls" to list files or "cat bio.md"`,
          });
        }
        break;
      }

      case 'skills':
        newOutputLines.push(
          { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_skills_fe') },
          { id: `out-${Date.now()}-2`, type: 'output', text: t('terminal_skills_be') },
          { id: `out-${Date.now()}-3`, type: 'output', text: t('terminal_skills_devops') }
        );
        break;

      case 'contact':
        newOutputLines.push(
          { id: `out-${Date.now()}-1`, type: 'output', text: t('terminal_contact_header') },
          { id: `out-${Date.now()}-2`, type: 'accent', text: '  GitHub:   https://github.com' },
          { id: `out-${Date.now()}-3`, type: 'accent', text: '  LinkedIn: https://linkedin.com' },
          { id: `out-${Date.now()}-4`, type: 'accent', text: '  Email:    ahmet@example.com' }
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

  return (
    <div
      className="terminal-container"
      onClick={() => document.getElementById('term-input')?.focus()}
      role="region"
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
    </div>
  );
};
