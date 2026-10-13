import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalApp } from './TerminalApp';
import { useI18nStore } from '../../i18n/i18n.store';

describe('TerminalApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
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

  it('should return current user with "whoami" command', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('guest')).toBeInTheDocument();
  });

  it('should handle "help" and "clear" commands', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText(/Available commands:/i)).not.toBeInTheDocument();
  });

  it('should list available files with "ls" and read them with "cat"', () => {
    render(<TerminalApp />);

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/bio\.md\s+skills\.md\s+contact\.md\s+welcome\.txt/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'cat bio.md' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/--- COMPUTER ENGINEER & SOFTWARE ARCHITECT ---/i)).toBeInTheDocument();
  });
});
