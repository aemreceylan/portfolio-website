import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownViewerApp } from './MarkdownViewerApp';
import { useFileSystemStore } from '#stores/filesystem.store';

describe('MarkdownViewerApp Component', () => {
  beforeEach(() => {
    // Reset open tabs and mode before each test
    useFileSystemStore.setState({
      openViewerFileIds: [],
      activeViewerFileId: null,
      viewerMode: 'edit',
    });
  });

  it('should render empty workspace state when no files are open', () => {
    render(<MarkdownViewerApp />);

    expect(screen.getByText(/No Open Files/i)).toBeInTheDocument();
    expect(screen.getByText(/Create a new document or open an existing file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bio\.md/i })).toBeInTheDocument();
  });

  it('should open a file when clicking on a quick-open chip in empty state', () => {
    render(<MarkdownViewerApp />);

    const bioChip = screen.getByRole('button', { name: /bio\.md/i });
    fireEvent.click(bioChip);

    // Tab should now be present
    expect(screen.getByRole('tab', { name: /bio\.md/i })).toBeInTheDocument();
    // Raw editor should display content in edit mode
    const rawEditor = screen.getByTestId('markdown-raw-view') as HTMLTextAreaElement;
    expect(rawEditor.value).toContain('Ahmet Emre Ceylan');
  });

  it('should open in preview mode when openInViewer is invoked with preview mode', () => {
    useFileSystemStore.getState().openInViewer('sys-bio', 'preview');
    render(<MarkdownViewerApp />);

    expect(screen.getByTestId('markdown-rendered-view')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-raw-view')).not.toBeInTheDocument();
  });

  it('should automatically open files in edit mode by default and switch between Edit, Preview, and Split modes', () => {
    useFileSystemStore.getState().openInViewer('sys-bio');
    render(<MarkdownViewerApp />);

    // By default in edit mode, editor raw view is rendered and preview is not
    expect(screen.getByTestId('markdown-raw-view')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-rendered-view')).not.toBeInTheDocument();

    // Switch to preview mode
    const previewBtn = screen.getByRole('button', { name: /Preview/i });
    fireEvent.click(previewBtn);

    expect(screen.getByTestId('markdown-rendered-view')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-raw-view')).not.toBeInTheDocument();

    // Switch to split mode
    const splitBtn = screen.getByRole('button', { name: /Split/i });
    fireEvent.click(splitBtn);

    expect(screen.getByTestId('markdown-rendered-view')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-raw-view')).toBeInTheDocument();

    // Switch back to edit mode
    const editBtn = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editBtn);

    expect(screen.queryByTestId('markdown-rendered-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('markdown-raw-view')).toBeInTheDocument();
  });

  it('should allow modifying content and saving to VFS', () => {
    // Create a user file to edit
    useFileSystemStore.getState().createFile('notes.md', '# Initial Note');
    const noteFile = useFileSystemStore.getState().getFile('notes.md')!;
    useFileSystemStore.getState().openInViewer(noteFile.id);

    render(<MarkdownViewerApp />);

    const textarea = screen.getByTestId('markdown-raw-view');
    fireEvent.change(textarea, { target: { value: '# Updated Note Title\nContent here' } });

    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    expect(useFileSystemStore.getState().getFile('notes.md')?.content).toBe('# Updated Note Title\nContent here');
  });

  it('should close tab and return to empty state when closing the only open file', () => {
    useFileSystemStore.getState().openInViewer('sys-bio');
    render(<MarkdownViewerApp />);

    expect(screen.getByRole('tab', { name: /bio\.md/i })).toBeInTheDocument();

    const closeTabBtn = screen.getByTitle(/Close tab/i);
    fireEvent.click(closeTabBtn);

    expect(screen.queryByRole('tab', { name: /bio\.md/i })).not.toBeInTheDocument();
    expect(screen.getByText(/No Open Files/i)).toBeInTheDocument();
  });

  it('should create and open a new markdown file via new file modal', () => {
    render(<MarkdownViewerApp />);

    const newBtn = screen.getByTestId('md-new-file-btn');
    fireEvent.click(newBtn);

    const input = screen.getByTestId('new-file-name-input');
    fireEvent.change(input, { target: { value: 'project-plan.md' } });

    const submitBtn = screen.getByTestId('new-file-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByRole('tab', { name: /project-plan\.md/i })).toBeInTheDocument();
    expect(useFileSystemStore.getState().getFile('project-plan.md')).toBeDefined();
  });
});

