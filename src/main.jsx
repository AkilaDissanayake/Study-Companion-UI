// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Self-hosted fonts (see design tokens in index.css: --font-body / --font-display)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/500.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';

import './index.css'; // Assuming you have global styles

// Apply the last-known theme synchronously, before React mounts, so a page
// reload doesn't flash light mode while the async config fetch (Dashboard.jsx)
// is still in flight.
const cachedTheme = localStorage.getItem('theme');
if (cachedTheme) {
  document.documentElement.setAttribute('data-theme', cachedTheme);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);