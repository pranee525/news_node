/**
 * Updated useSavedArticles hook that syncs with backend
 * Replace your existing useSavedArticles.ts and SavedArticlesContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NewsArticle } from '../constants/types';
import { storage } from '../services/storage';
import { api, ensureAuthenticated } from '../services/apiService';

interface SavedArticle extends NewsArticle {
  savedAt: string;
}

interface SavedArticlesContextType {
  savedArticles: SavedArticle[];
  saveArticle: (article: NewsArticle) => Promise<void>;
  unsaveArticle: (articleId: string) => Promise<void>;
  isArticleSaved: (articleId: string) => boolean;
  isSyncing: boolean;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

const STORAGE_KEY = 'headlinez_saved_articles';

export function SavedArticlesProvider({ children }: { children: ReactNode }) {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load saved articles from local storage and sync with backend
  useEffect(() => {
    const loadSavedArticles = async () => {
      // First load from local storage
      const saved = await storage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedArticles(parsed);
        } catch (e) {
          console.error('Failed to parse saved articles', e);
        }
      }
      
      // Then sync with backend
      try {
        await ensureAuthenticated();
        const response = await api.getSavedArticles();
        if (response.success && response.savedArticles) {
          const backendArticles: SavedArticle[] = response.savedArticles.map(a => ({
            id: a.articleId,
            title: a.title,
            description: a.description,
            url: a.url,
            imageUrl: a.imageUrl,
            sourceName: a.sourceName,
            publishedAt: a.publishedAt,
            category: a.category,
            country: a.country,
            language: a.language,
            savedAt: a.savedAt,
          }));
          setSavedArticles(backendArticles);
          await storage.setItem(STORAGE_KEY, JSON.stringify(backendArticles));
        }
      } catch (error) {
        console.warn('Failed to sync saved articles with backend:', error);
      }
    };

    loadSavedArticles();
  }, []);

  const saveArticle = useCallback(async (article: NewsArticle) => {
    const savedArticle: SavedArticle = {
      ...article,
      savedAt: new Date().toISOString(),
    };
    
    // Update local state immediately
    const updated = [savedArticle, ...savedArticles];
    setSavedArticles(updated);
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Sync to backend
    try {
      setIsSyncing(true);
      await ensureAuthenticated();
      await api.saveArticle(article);
    } catch (error) {
      console.warn('Failed to sync save to backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [savedArticles]);

  const unsaveArticle = useCallback(async (articleId: string) => {
    // Update local state immediately
    const updated = savedArticles.filter(a => a.id !== articleId);
    setSavedArticles(updated);
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Sync to backend
    try {
      setIsSyncing(true);
      await ensureAuthenticated();
      await api.unsaveArticle(articleId);
    } catch (error) {
      console.warn('Failed to sync unsave to backend:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [savedArticles]);

  const isArticleSaved = useCallback((articleId: string) => {
    return savedArticles.some(a => a.id === articleId);
  }, [savedArticles]);

  return (
    <SavedArticlesContext.Provider
      value={{
        savedArticles,
        saveArticle,
        unsaveArticle,
        isArticleSaved,
        isSyncing,
      }}
    >
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticlesContext() {
  const context = useContext(SavedArticlesContext);
  if (!context) {
    throw new Error('useSavedArticlesContext must be used within a SavedArticlesProvider');
  }
  return context;
}

export function useSavedArticles() {
  return useSavedArticlesContext();
}
