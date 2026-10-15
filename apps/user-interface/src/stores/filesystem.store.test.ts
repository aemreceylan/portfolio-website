import { describe, it, expect, beforeEach } from 'vitest';
import { useFileSystemStore, parseAllowedExtension } from './filesystem.store';

describe('FileSystem Store (VFS)', () => {
  beforeEach(() => {
    // Reset store state by deleting any test files created in tests
    const store = useFileSystemStore.getState();
    const files = store.files;
    Object.keys(files).forEach((filename) => {
      if (!files[filename].isSystem) {
        store.deleteFile(filename);
      }
    });
  });

  it('should parse valid extensions and reject unsupported ones', () => {
    expect(parseAllowedExtension('notes.txt')).toBe('txt');
    expect(parseAllowedExtension('README.MD')).toBe('md');
    expect(parseAllowedExtension('app.js')).toBe('js');
    expect(parseAllowedExtension('image.png')).toBeNull();
    expect(parseAllowedExtension('script.py')).toBeNull();
    expect(parseAllowedExtension('noextension')).toBeNull();
  });

  it('should contain protected system files initially', () => {
    const store = useFileSystemStore.getState();
    const bio = store.getFile('bio.md');
    const skills = store.getFile('skills.md');
    const contact = store.getFile('contact.md');
    const welcome = store.getFile('welcome.txt');

    expect(bio).toBeDefined();
    expect(bio?.isSystem).toBe(true);
    expect(skills?.isSystem).toBe(true);
    expect(contact?.isSystem).toBe(true);
    expect(welcome?.isSystem).toBe(true);
  });

  it('should create valid user files with txt, md, and js extensions', () => {
    const store = useFileSystemStore.getState();

    const mdResult = store.createFile('todo.md', '# My Tasks');
    expect(mdResult.success).toBe(true);
    expect(store.getFile('todo.md')?.content).toBe('# My Tasks');

    const jsResult = store.createFile('calc.js', 'console.log(42);');
    expect(jsResult.success).toBe(true);
    expect(store.getFile('calc.js')?.extension).toBe('js');
  });

  it('should reject file creation with unsupported extensions', () => {
    const store = useFileSystemStore.getState();
    const result = store.createFile('virus.exe');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Only .txt, .md, and .js are supported');
    expect(store.getFile('virus.exe')).toBeUndefined();
  });

  it('should prevent deletion of protected system files with warning', () => {
    const store = useFileSystemStore.getState();
    const result = store.deleteFile('bio.md');

    expect(result.success).toBe(false);
    expect(result.isSystemProtected).toBe(true);
    expect(result.error).toContain('Protected system file');
    expect(store.getFile('bio.md')).toBeDefined();
  });

  it('should allow deletion of user-created files', () => {
    const store = useFileSystemStore.getState();
    store.createFile('temp.txt', 'temporary text');
    expect(store.getFile('temp.txt')).toBeDefined();

    const deleteResult = store.deleteFile('temp.txt');
    expect(deleteResult.success).toBe(true);
    expect(store.getFile('temp.txt')).toBeUndefined();
  });

  it('should update content of existing files', () => {
    const store = useFileSystemStore.getState();
    store.createFile('editable.md', 'Initial');

    const updateResult = store.updateFile('editable.md', 'Updated content');
    expect(updateResult.success).toBe(true);
    expect(store.getFile('editable.md')?.content).toBe('Updated content');
  });

  it('should handle GUI alert state changes', () => {
    const store = useFileSystemStore.getState();
    expect(store.guiAlert).toBeNull();

    store.showGuiAlert('Error Title', 'System file cannot be deleted');
    expect(useFileSystemStore.getState().guiAlert).toEqual({
      isOpen: true,
      title: 'Error Title',
      message: 'System file cannot be deleted',
    });

    store.dismissGuiAlert();
    expect(useFileSystemStore.getState().guiAlert).toBeNull();
  });

  it('should manage viewer tab lifecycle (open and close)', () => {
    const store = useFileSystemStore.getState();
    expect(store.openViewerFileIds).toEqual([]);
    expect(store.activeViewerFileId).toBeNull();

    // Open in preview mode
    store.openInViewer('sys-bio', 'preview');
    expect(useFileSystemStore.getState().openViewerFileIds).toContain('sys-bio');
    expect(useFileSystemStore.getState().activeViewerFileId).toBe('sys-bio');
    expect(useFileSystemStore.getState().viewerMode).toBe('preview');

    // Open another file in edit mode
    store.openInViewer('sys-skills', 'edit');
    expect(useFileSystemStore.getState().openViewerFileIds).toEqual(['sys-bio', 'sys-skills']);
    expect(useFileSystemStore.getState().activeViewerFileId).toBe('sys-skills');
    expect(useFileSystemStore.getState().viewerMode).toBe('edit');

    // Close the active tab
    store.closeViewerTab('sys-skills');
    expect(useFileSystemStore.getState().openViewerFileIds).toEqual(['sys-bio']);
    expect(useFileSystemStore.getState().activeViewerFileId).toBe('sys-bio');

    // Close remaining tab
    store.closeViewerTab('sys-bio');
    expect(useFileSystemStore.getState().openViewerFileIds).toEqual([]);
    expect(useFileSystemStore.getState().activeViewerFileId).toBeNull();
  });

  it('should manage IDE tab lifecycle (open and close)', () => {
    const store = useFileSystemStore.getState();
    expect(store.openIdeFileIds).toEqual([]);
    expect(store.activeIdeFileId).toBeNull();

    store.openInIde('user-demo-script');
    expect(useFileSystemStore.getState().openIdeFileIds).toContain('user-demo-script');
    expect(useFileSystemStore.getState().activeIdeFileId).toBe('user-demo-script');

    // Close tab
    store.closeIdeTab('user-demo-script');
    expect(useFileSystemStore.getState().openIdeFileIds).toEqual([]);
    expect(useFileSystemStore.getState().activeIdeFileId).toBeNull();
  });
});

