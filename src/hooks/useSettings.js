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

export function useSettings(initialTheme = 'light', initialLanguage = 'english') {
  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);

  const applyTheme = (t) => document.documentElement.setAttribute('data-theme', t);

  /**
   * Saves the current (or default) preferences to the backend.
   * @param {boolean} isSkip - If true, saves safe defaults without touching user state.
   */
  const handleSavePreferences = async (isSkip = false) => {
    const finalTheme = isSkip ? 'light' : theme;
    const finalLanguage = isSkip ? 'english' : language;

    try {
      const res = await api.saveUserConfig({
        data: { theme: finalTheme, language: finalLanguage },
      }, isSkip);

      if (res.ok) {
        applyTheme(finalTheme);
        return true;
      } else {
        alert('Failed to save configuration.');
        return false;
      }
    } catch (error) {
      console.error('Config Error:', error);
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
