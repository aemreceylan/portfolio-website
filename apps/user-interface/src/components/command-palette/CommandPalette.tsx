import React, { useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useCommandPaletteStore } from '#stores/command-palette.store';
import { useCommandPaletteItems } from './useCommandPaletteItems';
import { filterCommandPaletteItems, getNextSelectedIndex } from './command-palette.utils';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/command-palette.css';

/**
 * Spotlight Command Palette Modal Component.
 * Supports Cmd+K / Ctrl+K keyboard shortcut, keyboard navigation (Arrow Up/Down, Enter, Esc),
 * and full 4-theme visual adaptations (spatial-glass, swiss-industrial, cyberpunk-neon, classic-mac).
 */
export const CommandPalette: React.FC = () => {
  const { isOpen, query, selectedIndex, close, toggle, setQuery, setSelectedIndex } =
    useCommandPaletteStore();
  const { t } = useTranslation();
  const items = useCommandPaletteItems();

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Filter items matching user search query
  const filteredItems = useMemo(
    () => filterCommandPaletteItems(items, query),
    [items, query]
  );

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggle]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll active item into view during arrow navigation
  useEffect(() => {
    if (
      isOpen &&
      selectedItemRef.current &&
      typeof selectedItemRef.current.scrollIntoView === 'function'
    ) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, selectedIndex]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(getNextSelectedIndex(selectedIndex, 1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(getNextSelectedIndex(selectedIndex, -1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    }
  };

  return (
    <div
      className="command-palette-backdrop"
      onClick={close}
      data-testid="command-palette-backdrop"
      role="presentation"
    >
      <div
        className="command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Command Palette"
        onClick={(e) => e.stopPropagation()}
        data-testid="command-palette-modal"
      >
        {/* Search Input Bar */}
        <div className="command-palette-search-box">
          <Search size={18} className="command-palette-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('spotlight_search_placeholder')}
            aria-label="Spotlight Search"
            data-testid="command-palette-input"
          />
          <span className="command-palette-esc-badge">ESC</span>
        </div>

        {/* Results List */}
        <div className="command-palette-list" role="listbox" data-testid="command-palette-list">
          {filteredItems.length === 0 ? (
            <div className="command-palette-empty" data-testid="command-palette-empty">
              {t('spotlight_no_results')}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  ref={isSelected ? selectedItemRef : null}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`command-palette-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => item.onSelect()}
                  onPointerEnter={() => setSelectedIndex(index)}
                  data-testid={`command-palette-item-${item.id}`}
                >
                  <div className="command-palette-item-icon">{item.icon}</div>
                  <div className="command-palette-item-content">
                    <div className="command-palette-item-title-row">
                      <span className="command-palette-item-title">{item.title}</span>
                      {item.badge && (
                        <span className="command-palette-item-badge">{item.badge}</span>
                      )}
                    </div>
                    <span className="command-palette-item-desc">{item.description}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="command-palette-footer" data-testid="command-palette-footer">
          <div className="command-palette-footer-keys" aria-label="Keyboard Shortcuts">
            <span className="command-palette-footer-key" title="Navigate" aria-label="Navigate">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
            </span>
            <span className="command-palette-footer-key" title="Select" aria-label="Select">
              <kbd>↵</kbd>
            </span>
            <span className="command-palette-footer-key" title="Close" aria-label="Close">
              <kbd>esc</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
