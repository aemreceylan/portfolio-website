import { create } from 'zustand';

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

/**
 * Global reactive Zustand store managing Spotlight Command Palette visibility, query and keyboard navigation state.
 */
export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  query: '',
  selectedIndex: 0,
  open: () => set({ isOpen: true, query: '', selectedIndex: 0 }),
  close: () => set({ isOpen: false, query: '', selectedIndex: 0 }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      query: '',
      selectedIndex: 0,
    })),
  setQuery: (query: string) => set({ query, selectedIndex: 0 }),
  setSelectedIndex: (selectedIndex: number) => set({ selectedIndex }),
  reset: () => set({ isOpen: false, query: '', selectedIndex: 0 }),
}));
