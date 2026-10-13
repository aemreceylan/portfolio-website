import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '#styles/design-tokens.css';
import '#styles/window.css';
import '#styles/dock.css';
import '#styles/desktop.css';

/**
 * Root React 19 application mount entrypoint
 */
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
