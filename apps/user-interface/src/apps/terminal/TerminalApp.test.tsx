import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalApp } from './TerminalApp';
import { useI18nStore } from '../../i18n/i18n.store';
import { useFileSystemStore } from '../../stores/filesystem.store';
import { useThemeStore } from '../../stores/theme.store';
import { useWindowManager } from '../../stores/window-manager.store';

describe('TerminalApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    // Ensure clean VFS state
    const fs = useFileSystemStore.getState();
    if (fs.getFile('testfile.txt')) {
      fs.deleteFile('testfile.txt');
    }
  });

  it('should render default prompt with guest user', () => {
    render(<TerminalApp />);

    expect(screen.getByText('guest@aec:~$')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it('should switch user dynamically using "su <username>" command', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'su ahmet' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/User switched to: ahmet/i)).toBeInTheDocument();
    expect(screen.getByText('ahmet@aec:~$')).toBeInTheDocument();
  });

  it('should switch user with "su" and return to guest with "exit"', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'su dev' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('dev@aec:~$')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'exit' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('guest@aec:~$')).toBeInTheDocument();
  });

  it('should list available VFS files with "ls" and read them with "cat"', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/bio\.md/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'cat bio.md' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Ahmet Emre Ceylan/i)).toBeInTheDocument();
  });

  it('should create file with "touch" and prevent deletion of protected system file with "rm"', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);

    // Try deleting protected file
    fireEvent.change(input, { target: { value: 'rm bio.md' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/rm: cannot remove 'bio.md': Protected system file/i)).toBeInTheDocument();

    // Create a new valid user file
    fireEvent.change(input, { target: { value: 'touch testfile.txt' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(useFileSystemStore.getState().getFile('testfile.txt')).toBeDefined();

    // Remove user file
    fireEvent.change(input, { target: { value: 'rm testfile.txt' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(useFileSystemStore.getState().getFile('testfile.txt')).toBeUndefined();
  });

  it('should launch GNU nano editor mode and allow exit', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'nano notes.md' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Nano editor should be active
    expect(screen.getByText(/GNU nano 7.2/i)).toBeInTheDocument();
    expect(screen.getByText(/\[ New File: notes\.md \]/i)).toBeInTheDocument();
    expect(screen.getByText(/WriteOut \(Save\)/i)).toBeInTheDocument();

    // Exit Nano
    const exitBtn = screen.getByRole('button', { name: /\^X Exit/i });
    fireEvent.click(exitBtn);

    // Back in command line
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it('should execute factory reset on "sudo rm -rf" command and restore default files and theme', () => {
    render(<TerminalApp />);

    // 1. Create a user file
    useFileSystemStore.getState().createFile('custom-temp.md', 'some content');
    expect(useFileSystemStore.getState().getFile('custom-temp.md')).toBeDefined();

    // 2. Change theme
    useThemeStore.getState().setTheme('swiss-industrial');
    expect(useThemeStore.getState().currentTheme).toBe('swiss-industrial');

    // 3. Switch user
    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'su admin' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('admin@aec:~$')).toBeInTheDocument();

    // 4. Run sudo rm -rf /
    fireEvent.change(input, { target: { value: 'sudo rm -rf /' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Assert only concise status notification is displayed
    expect(screen.getByText(/System successfully restored to factory defaults/i)).toBeInTheDocument();
    expect(screen.queryByText(/INITIATING SYSTEM FACTORY RESET/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wiping user-created files/i)).not.toBeInTheDocument();

    // Assert user reset to guest
    expect(screen.getByText('guest@aec:~$')).toBeInTheDocument();

    // Assert custom file wiped
    expect(useFileSystemStore.getState().getFile('custom-temp.md')).toBeUndefined();

    // Assert theme reset to spatial-glass
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
  });

  it('should warn when attempting rm -rf without sudo', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'rm -rf /' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Permission denied\. Try "sudo rm -rf \/"/i)).toBeInTheDocument();
  });

  it('opens BAND window when executing "band" command in terminal', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'band' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Starting BAND \(Band Absolutely Not Discord\)/i)).toBeInTheDocument();
    expect(useWindowManager.getState().windows['band']).toBeDefined();
    expect(useWindowManager.getState().windows['band'].isOpen).toBe(true);
  });

  describe('Terminal Security & Input Validation (OWASP Compliance)', () => {
    it('rejects commands exceeding 100 characters via Zod validation', () => {
      render(<TerminalApp />);

      const input = screen.getByPlaceholderText(/type a command/i);
      const oversizedCommand = 'echo ' + 'a'.repeat(120);
      fireEvent.change(input, { target: { value: oversizedCommand } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText(/Invalid command input length/i)).toBeInTheDocument();
    });

    it('rejects usernames containing injection characters in su command', () => {
      render(<TerminalApp />);

      const input = screen.getByPlaceholderText(/type a command/i);
      fireEvent.change(input, { target: { value: 'su user;rm -rf /' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText(/Please provide a valid username/i)).toBeInTheDocument();
      expect(screen.getByText('guest@aec:~$')).toBeInTheDocument();
    });

    it('rejects path traversal attempts in touch and nano commands', () => {
      render(<TerminalApp />);

      const input = screen.getByPlaceholderText(/type a command/i);
      fireEvent.change(input, { target: { value: 'touch ../../evil.txt' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText(/directory traversal/i)).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'nano ../secret.md' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Should not enter nano session, should display error
      expect(screen.queryByText(/GNU nano 7.2/i)).not.toBeInTheDocument();
    });
  });
});
