/**
 * @file useSettings.js
 * @description Custom hook that owns theme and language preferences state,
 * including persisting them to the backend.
 *
 * Exposes:
 *  - State: theme, language
 *  - Actions: setTheme, setLanguage, handleSavePreferences, applyTheme
 */

import { useState } from 'react';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';

export function useSettings(initialTheme = 'light', initialLanguage = 'english') {
  const { userId } = useAuth();
  const notify = useNotify();
  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);

  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    // Cached so main.jsx can apply it synchronously on the next page load,
    // before the async config fetch resolves — avoids a flash of the wrong theme.
    localStorage.setItem('theme', t);
  };

  /**
   * Saves the current (or default) preferences to the backend.
   * @param {boolean} isSkip - If true, saves safe defaults without touching user state.
   */
  const handleSavePreferences = async (isSkip = false) => {
    const finalTheme = isSkip ? 'light' : theme;
    const finalLanguage = isSkip ? 'english' : language;

    try {
      // Backend's ConfigPayload requires `filename` — the user's config is stored as `{user_id}.json`
      await api.saveUserConfig({
        filename: `${userId}.json`,
        data: { theme: finalTheme, language: finalLanguage },
      }, isSkip);

      applyTheme(finalTheme);
      return true;
    } catch (error) {
      notify.error(error.message || 'Failed to save configuration.', {
        retry: () => handleSavePreferences(isSkip),
      });
      return false;
    }
  };

  return {
    theme,
    setTheme,
    language,
    setLanguage,
    applyTheme,
    handleSavePreferences,
  };
}
