/**
 * Updated useUserStats hook that syncs with backend
 * Replace your existing useUserStats.ts with this file
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { api, ensureAuthenticated } from '../services/apiService';

export interface UserStats {
  articlesRead: number;
  currentStreak: number;
  lastReadDate: string | null;
  totalTimeSpent: number;
  savedArticlesCount: number;
}

const STORAGE_KEY = 'headlinez_user_stats';

const DEFAULT_STATS: UserStats = {
  articlesRead: 0,
  currentStreak: 0,
  lastReadDate: null,
  totalTimeSpent: 0,
  savedArticlesCount: 0,
};

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stats from local storage and sync with backend
  useEffect(() => {
    const loadStats = async () => {
      // First load from local storage
      const saved = await storage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStats(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse user stats', e);
        }
      }
      setIsLoaded(true);
      
      // Then sync with backend
      try {
        await ensureAuthenticated();
        const response = await api.getStats();
        if (response.success && response.stats) {
          setStats(response.stats);
          await storage.setItem(STORAGE_KEY, JSON.stringify(response.stats));
        }
      } catch (error) {
        console.warn('Failed to sync stats with backend:', error);
      }
    };

    loadStats();
  }, []);

  const recordArticleRead = useCallback(async (articleId: string, timeSpent?: number) => {
    // Update local state immediately
    setStats(prev => ({
      ...prev,
      articlesRead: prev.articlesRead + 1,
      lastReadDate: new Date().toISOString(),
      totalTimeSpent: prev.totalTimeSpent + (timeSpent || 0),
    }));
    
    // Sync to backend
    try {
      await ensureAuthenticated();
      const response = await api.recordRead(articleId, timeSpent);
      if (response.success && response.stats) {
        setStats(prev => ({ ...prev, ...response.stats }));
        await storage.setItem(STORAGE_KEY, JSON.stringify(response.stats));
      }
    } catch (error) {
      console.warn('Failed to sync read to backend:', error);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      await ensureAuthenticated();
      const response = await api.getStats();
      if (response.success && response.stats) {
        setStats(response.stats);
        await storage.setItem(STORAGE_KEY, JSON.stringify(response.stats));
      }
    } catch (error) {
      console.warn('Failed to refresh stats:', error);
    }
  }, []);

  return {
    ...stats,
    isLoaded,
    recordArticleRead,
    refreshStats,
  };
}
