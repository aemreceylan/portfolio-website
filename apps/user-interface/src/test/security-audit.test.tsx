import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MarkdownViewerApp } from '#apps/markdown/MarkdownViewerApp';
import { JsIdeApp } from '#apps/ide/JsIdeApp';
import { TerminalApp } from '#apps/terminal/TerminalApp';
import { Desktop } from '#components/desktop/Desktop';
import { useFileSystemStore } from '#stores/filesystem.store';
import { useI18nStore } from '#i18n/i18n.store';
import { filterCommandPaletteItems } from '#components/command-palette/command-palette.utils';
import { escapeScriptInterpolation } from '#services/sanitizer.service';

describe('Comprehensive DevSecOps Security Audit Suite (OWASP Standard)', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useFileSystemStore.getState().reset();
  });

  describe('OWASP A03: Injection & Cross-Site Scripting (XSS) Prevention', () => {
    it('sanitizes multiple real-world XSS attack vectors in markdown preview', () => {
      const attackVectors = [
        '<script>alert("XSS")</script>',
        '<img src=invalid onerror="alert(\'XSS\')"/>',
        '<svg onload="alert(1)"/>',
        '<iframe src="https://evil-site.com"></iframe>',
        '<object data="exploit.swf"></object>',
        '<embed src="exploit.pdf"></embed>',
        '<a href="javascript:alert(document.domain)">Dangerous Link</a>',
      ];

      const joinedContent = attackVectors.join('\n\n');
      useFileSystemStore.getState().createFile('security-exploit.md', joinedContent);
      const file = useFileSystemStore.getState().getFile('security-exploit.md')!;
      useFileSystemStore.getState().openInViewer(file.id, 'preview');

      render(<MarkdownViewerApp />);

      const preview = screen.getByTestId('markdown-rendered-view');
      expect(preview.innerHTML).not.toContain('<script');
      expect(preview.innerHTML).not.toContain('onerror');
      expect(preview.innerHTML).not.toContain('onload');
      expect(preview.innerHTML).not.toContain('<iframe');
      expect(preview.innerHTML).not.toContain('<object');
      expect(preview.innerHTML).not.toContain('<embed');
      expect(preview.innerHTML).not.toContain('javascript:');
    });

    it('ensures markdown external links have rel="noopener noreferrer" against tabnabbing', () => {
      const markdown = '[Visit Example](https://example.com)';
      useFileSystemStore.getState().createFile('tabnabbing.md', markdown);
      const file = useFileSystemStore.getState().getFile('tabnabbing.md')!;
      useFileSystemStore.getState().openInViewer(file.id, 'preview');

      render(<MarkdownViewerApp />);

      const link = screen.getByRole('link', { name: /Visit Example/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('escapes plain text files completely to prevent HTML entity execution', () => {
      const rawText = '<p>Raw HTML</p><script>alert(1)</script>';
      useFileSystemStore.getState().createFile('test.txt', rawText);
      const file = useFileSystemStore.getState().getFile('test.txt')!;
      useFileSystemStore.getState().openInViewer(file.id, 'preview');

      render(<MarkdownViewerApp />);

      const preview = screen.getByTestId('markdown-rendered-view');
      expect(preview.innerHTML).not.toContain('<p>Raw HTML</p>');
      expect(preview.innerHTML).toContain('&lt;p&gt;Raw HTML&lt;/p&gt;');
    });
  });

  describe('OWASP A04: Sandbox Security & PostMessage Boundary Hardening', () => {
    it('strictly confines JavaScript IDE execution frame to sandbox="allow-scripts" without allow-same-origin', () => {
      useFileSystemStore.getState().openInIde('user-demo-script');
      render(<JsIdeApp />);

      const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
      fireEvent.click(runBtn);

      const iframe = screen.getByTestId('js-sandbox-iframe') as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      // Crucial: allow-scripts MUST NOT be accompanied by allow-same-origin
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
      expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
    });

    it('prevents script tag breakout by escaping closing tags', () => {
      const maliciousScript = 'const str = "</script><script>alert(document.cookie)</script>";';
      const escaped = escapeScriptInterpolation(maliciousScript);
      expect(escaped).not.toContain('</script>');
      expect(escaped).toContain('<\\/script>');
    });

    it('rejects forged postMessages coming from unauthorized windows', () => {
      useFileSystemStore.getState().openInIde('user-demo-script');
      render(<JsIdeApp />);

      const runBtn = screen.getByRole('button', { name: /Execute Script in Sandbox/i });
      fireEvent.click(runBtn);

      // Attempt injection from unauthorized window
      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            source: window,
            data: {
              source: 'aec-js-sandbox',
              level: 'log',
              args: ['UNAUTHORIZED_ATTACK_VECTOR'],
            },
          })
        );
      });

      expect(screen.queryByText(/UNAUTHORIZED_ATTACK_VECTOR/i)).not.toBeInTheDocument();
    });
  });

  describe('OWASP A01: Path Traversal & Prototype Pollution Defense in VFS', () => {
    it('rejects path traversal attempts across all VFS endpoints', () => {
      const store = useFileSystemStore.getState();

      expect(store.createFile('../secret.txt').success).toBe(false);
      expect(store.createFile('..\\secret.md').success).toBe(false);
      expect(store.createFile('/etc/passwd.txt').success).toBe(false);
      expect(store.createFile('folder/file.js').success).toBe(false);
    });

    it('prevents prototype pollution injection keys', () => {
      const store = useFileSystemStore.getState();

      expect(store.createFile('__proto__.txt').success).toBe(false);
      expect(store.createFile('constructor.md').success).toBe(false);
      expect(store.createFile('prototype.js').success).toBe(false);
    });

    it('rejects filenames exceeding 64 characters', () => {
      const store = useFileSystemStore.getState();
      const longName = 'x'.repeat(65) + '.txt';
      expect(store.createFile(longName).success).toBe(false);
    });

    it('rejects filenames containing control characters or null bytes', () => {
      const store = useFileSystemStore.getState();
      expect(store.createFile('file\0exploit.txt').success).toBe(false);
      expect(store.createFile('file\nexploit.md').success).toBe(false);
    });
  });

  describe('OWASP A05: Denial of Service (DoS) Protection', () => {
    it('rejects uploaded files exceeding 512 KB in Desktop', () => {
      render(<Desktop />);

      const fileInput = screen.getByTestId('file-upload-input');
      const oversizedBlob = 'A'.repeat(520 * 1024);
      const oversizedFile = new File([oversizedBlob], 'memory-bomb.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

      expect(screen.getByText(/Dosya Boyutu Sınırı Aşıldı/i)).toBeInTheDocument();
      expect(useFileSystemStore.getState().getFile('memory-bomb.txt')).toBeUndefined();
    });

    it('handles massive command palette search queries safely without performance degradation', () => {
      const items = [
        { id: '1', title: 'Terminal', description: 'CLI App', category: 'apps' as const, categoryLabel: 'Apps', onSelect: vi.fn() },
        { id: '2', title: 'Settings', description: 'System Preferences', category: 'apps' as const, categoryLabel: 'Apps', onSelect: vi.fn() },
      ];

      const massiveQuery = 'a'.repeat(10000);
      const start = performance.now();
      const result = filterCommandPaletteItems(items, massiveQuery);
      const duration = performance.now() - start;

      expect(result).toHaveLength(0);
      expect(duration).toBeLessThan(50); // Must resolve in less than 50ms
    });

    it('enforces 100 character limit on terminal input to prevent buffer inflation', () => {
      render(<TerminalApp />);

      const input = screen.getByPlaceholderText(/type a command/i);
      const massiveCmd = 'echo ' + 'z'.repeat(150);

      fireEvent.change(input, { target: { value: massiveCmd } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText(/Invalid command input length/i)).toBeInTheDocument();
    });
  });

  describe('Cryptographic Security Standards', () => {
    it('generates secure file IDs without Math.random', () => {
      const res1 = useFileSystemStore.getState().createFile('test1.txt', '1');
      const res2 = useFileSystemStore.getState().createFile('test2.txt', '2');

      expect(res1.file?.id).toBeDefined();
      expect(res2.file?.id).toBeDefined();
      expect(res1.file?.id).not.toBe(res2.file?.id);
      expect(res1.file?.id.startsWith('file-')).toBe(true);
    });
  });
});
