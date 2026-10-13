import React, { useEffect } from 'react';
import { Desktop } from '#components/desktop/Desktop';
import { useWindowManager } from '#stores/window-manager.store';
import { terminalManifest } from '#apps/app-registry';
import { useTranslation } from '#i18n/i18n.store';

/**
 * Root Application entry shell mounting the AEC Desktop Workspace.
 * Automatically spawns the Terminal window on initial boot for an interactive welcoming feel.
 * Synchronizes the browser document.title with the active localized application portfolio title.
 */
export const App: React.FC = () => {
  const { openWindow } = useWindowManager();
  const { t, currentLanguage } = useTranslation();

  useEffect(() => {
    openWindow(terminalManifest);
  }, [openWindow]);

  useEffect(() => {
    document.title = t('browser_tab_title');
  }, [t, currentLanguage]);

  return <Desktop />;
};

export default App;
