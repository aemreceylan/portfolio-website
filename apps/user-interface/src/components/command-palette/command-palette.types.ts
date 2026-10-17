import React from 'react';

export type CommandPaletteCategory = 'apps' | 'files' | 'themes' | 'actions';

export interface CommandPaletteItem {
  id: string;
  title: string;
  description: string;
  category: CommandPaletteCategory;
  categoryLabel: string;
  icon?: React.ReactNode;
  badge?: string;
  onSelect: () => void;
}
