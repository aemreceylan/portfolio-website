import React, { useEffect } from 'react';
import { Desktop } from '#components/desktop/Desktop';
import { useWindowManager } from '#stores/window-manager.store';
import { terminalManifest } from '#apps/app-registry';

/**
 * Root Application entry shell mounting the AEC Desktop Workspace.
 * Automatically spawns the Terminal window on initial boot for an interactive welcoming feel.
 */
export const App: React.FC = () => {
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow(terminalManifest);
  }, [openWindow]);

  return <Desktop />;
};

export default App;
