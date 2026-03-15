/**
 * Updated useUserPreferences hook that syncs with backend
 * Replace your existing useUserPreferences.ts with this file
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { api, ensureAuthenticated } from '../services/apiService';

export interface UserPreferences {
  selectedCountries: string[];
  selectedTopics: string[];
  theme: 'light' | 'dark' | 'system';
  joinDate: string;
  profileImage: string | null;
  isOnboardingComplete: boolean;
}

const STORAGE_KEY = 'headlinez_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedCountries: ['france', 'italy'],
  selectedTopics: ['Politics', 'Economy', 'Business'],
  theme: 'light',
  joinDate: new Date().toISOString(),
  profileImage: null,
  isOnboardingComplete: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load preferences from local storage and sync with backend
  useEffect(() => {
    const loadPreferences = async () => {
      // First load from local storage for instant UI
      const saved = await storage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences(prev => ({
            ...prev,
            ...parsed,
            selectedCountries: parsed.selectedCountries || prev.selectedCountries,
            selectedTopics: parsed.selectedTopics || prev.selectedTopics,
            joinDate: parsed.joinDate || prev.joinDate,
            profileImage: parsed.profileImage || prev.profileImage,
            isOnboardingComplete: parsed.isOnboardingComplete ?? prev.isOnboardingComplete,
          }));
        } catch (e) {
          console.error('Failed to parse user preferences', e);
        }
      }
      setIsLoaded(true);
      
      // Then try to sync with backend
      try {
        await ensureAuthenticated();
        const response = await api.getPreferences();
        if (response.success && response.preferences) {
          const backendPrefs = response.preferences;
          setPreferences(prev => {
            const merged = {
              ...prev,
              selectedCountries: backendPrefs.selectedCountries?.length > 0 
                ? backendPrefs.selectedCountries 
                : prev.selectedCountries,
              selectedTopics: backendPrefs.selectedTopics?.length > 0 
                ? backendPrefs.selectedTopics 
                : prev.selectedTopics,
              theme: (backendPrefs.theme as 'light' | 'dark' | 'system') || prev.theme,
            };
            // Save merged preferences locally
            storage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      } catch (error) {
        console.warn('Failed to sync preferences with backend:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences locally and sync to backend
  const savePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Sync to backend in background
    try {
      setIsSyncing(true);
      await ensureAuthenticated();
      await api.updatePreferences({
        selectedCountries: updated.selectedCountries,
        selectedTopics: updated.selectedTopics,
        theme: updated.theme,
      });
    } catch (error) {
      console.warn('Failed to sync preferences to backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [preferences]);

  const toggleCountry = useCallback((id: string) => {
    const newCountries = preferences.selectedCountries.includes(id)
      ? preferences.selectedCountries.filter(c => c !== id)
      : [...preferences.selectedCountries, id];
    savePreferences({ selectedCountries: newCountries });
  }, [preferences.selectedCountries, savePreferences]);

  const toggleTopic = useCallback((topic: string) => {
    const newTopics = preferences.selectedTopics.includes(topic)
      ? preferences.selectedTopics.filter(t => t !== topic)
      : [...preferences.selectedTopics, topic];
    savePreferences({ selectedTopics: newTopics });
  }, [preferences.selectedTopics, savePreferences]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    savePreferences({ theme });
  }, [savePreferences]);

  return {
    ...preferences,
    isLoaded,
    isSyncing,
    selectedCountries: preferences.selectedCountries || [],
    selectedTopics: preferences.selectedTopics || [],
    toggleCountry,
    toggleTopic,
    setTheme,
    savePreferences,
  };
}
