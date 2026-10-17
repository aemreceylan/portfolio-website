import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { JsIdeApp } from './JsIdeApp';
import { useFileSystemStore } from '#stores/filesystem.store';

describe('JsIdeApp Component', () => {
  beforeEach(() => {
    // Reset open tabs before each test
    useFileSystemStore.setState({
      openIdeFileIds: [],
      activeIdeFileId: null,
    });
  });

  it('should render empty workspace state when no files are open', () => {
    render(<JsIdeApp />);

    expect(screen.getByText(/No Open Files/i)).toBeInTheDocument();
    expect(screen.getByText(/Create a new document or open an existing file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demo\.js/i })).toBeInTheDocument();
  });

  it('should open script when clicking on a quick-open chip in empty state', () => {
    render(<JsIdeApp />);

    const chip = screen.getByRole('button', { name: /demo\.js/i });
    fireEvent.click(chip);

    expect(screen.getByRole('tab', { name: /demo\.js/i })).toBeInTheDocument();
    const editor = screen.getByPlaceholderText(/\/\/ Write JavaScript code here\.\.\./i) as HTMLTextAreaElement;
    expect(editor).toBeInTheDocument();
    expect(editor.value).toContain('console.log');
  });

  it('should render output console with initial ready status when script is open', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const consoleOutput = screen.getByTestId('js-console-output');
    expect(consoleOutput).toBeInTheDocument();
    expect(screen.getByText(/AEC JavaScript Sandbox Ready/i)).toBeInTheDocument();
  });

  it('should trigger execution on Run button click and handle sandbox messages', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
    fireEvent.click(runBtn);

    // Sandbox iframe should be mounted
    const iframe = screen.getByTestId('js-sandbox-iframe') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();

    // Emitting sandbox log event from the valid iframe source should render message in console
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: iframe.contentWindow,
          data: {
            source: 'aec-js-sandbox',
            level: 'log',
            args: ['Execution completed: 42'],
          },
        })
      );
    });

    expect(screen.getByText(/Execution completed: 42/i)).toBeInTheDocument();
  });

  it('should ignore spoofed postMessages from external or mismatching sources', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
    fireEvent.click(runBtn);

    // Dispatch message with fraudulent source (window instead of iframe.contentWindow)
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            source: 'aec-js-sandbox',
            level: 'log',
            args: ['MALICIOUS_INJECTION'],
          },
        })
      );
    });

    expect(screen.queryByText(/MALICIOUS_INJECTION/i)).not.toBeInTheDocument();
  });

  it('should save modified code to VFS store', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const editor = screen.getByPlaceholderText(/\/\/ Write JavaScript code here\.\.\./i);
    fireEvent.change(editor, { target: { value: 'console.log("Updated Code");' } });

    const saveBtn = screen.getByRole('button', { name: /Save Script to Filesystem/i });
    fireEvent.click(saveBtn);

    const updatedFile = useFileSystemStore.getState().getFile('demo.js');
    expect(updatedFile?.content).toBe('console.log("Updated Code");');
  });

  it('should close tab and return to empty state when closing the only open file', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    expect(screen.getByRole('tab', { name: /demo\.js/i })).toBeInTheDocument();

    const closeBtn = screen.getByTitle(/Close tab/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('tab', { name: /demo\.js/i })).not.toBeInTheDocument();
    expect(screen.getByText(/No Open Files/i)).toBeInTheDocument();
  });

  it('should create new script file via modal', () => {
    render(<JsIdeApp />);

    const newBtn = screen.getByTestId('js-ide-new-script-btn');
    fireEvent.click(newBtn);

    const nameInput = screen.getByTestId('new-script-name-input');
    fireEvent.change(nameInput, { target: { value: 'my-calc.js' } });

    const submitBtn = screen.getByTestId('new-script-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByRole('tab', { name: /my-calc\.js/i })).toBeInTheDocument();
    expect(useFileSystemStore.getState().getFile('my-calc.js')).toBeDefined();
  });

  it('should catch and display syntax errors without running invalid code', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const editor = screen.getByPlaceholderText(/\/\/ Write JavaScript code here\.\.\./i);
    fireEvent.change(editor, { target: { value: 'const x = ;' } });

    const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
    fireEvent.click(runBtn);

    expect(screen.getAllByText(/Syntax Error/i).length).toBeGreaterThanOrEqual(1);
  });

  it('safely escapes </script> tags in code to prevent sandbox breakout', () => {
    useFileSystemStore.getState().openInIde('user-demo-script');
    render(<JsIdeApp />);

    const editor = screen.getByPlaceholderText(/\/\/ Write JavaScript code here\.\.\./i);
    fireEvent.change(editor, { target: { value: 'const x = "</script><script>alert(1)</script>";' } });

    const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
    fireEvent.click(runBtn);

    const iframe = screen.getByTestId('js-sandbox-iframe') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain('<\\/script>');
    expect(iframe.srcdoc).not.toContain('</script><script>alert(1)</script>');
  });
});

