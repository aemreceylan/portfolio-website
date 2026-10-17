import { describe, it, expect, beforeEach } from 'vitest';
import { useCommandPaletteStore } from './command-palette.store';

describe('useCommandPaletteStore', () => {
  beforeEach(() => {
    useCommandPaletteStore.getState().reset();
  });

  it('initializes with closed state, empty query and index 0', () => {
    const state = useCommandPaletteStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
    expect(state.selectedIndex).toBe(0);
  });

  it('opens and resets query and selectedIndex', () => {
    useCommandPaletteStore.getState().setQuery('test');
    useCommandPaletteStore.getState().setSelectedIndex(3);
    useCommandPaletteStore.getState().open();

    const state = useCommandPaletteStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.query).toBe('');
    expect(state.selectedIndex).toBe(0);
  });

  it('closes and resets state', () => {
    useCommandPaletteStore.getState().open();
    useCommandPaletteStore.getState().setQuery('terminal');
    useCommandPaletteStore.getState().close();

    const state = useCommandPaletteStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
  });

  it('toggles open/closed state', () => {
    useCommandPaletteStore.getState().toggle();
    expect(useCommandPaletteStore.getState().isOpen).toBe(true);

    useCommandPaletteStore.getState().toggle();
    expect(useCommandPaletteStore.getState().isOpen).toBe(false);
  });

  it('updates search query and resets selectedIndex to 0', () => {
    useCommandPaletteStore.getState().setSelectedIndex(4);
    useCommandPaletteStore.getState().setQuery('settings');

    const state = useCommandPaletteStore.getState();
    expect(state.query).toBe('settings');
    expect(state.selectedIndex).toBe(0);
  });

  it('updates selectedIndex directly', () => {
    useCommandPaletteStore.getState().setSelectedIndex(2);
    expect(useCommandPaletteStore.getState().selectedIndex).toBe(2);
  });
});
