/**
 * News Service - Updated to use backend API
 * Replace your existing newsService.ts with this file
 */

import { NewsArticle } from '../constants/types';
import { api, ensureAuthenticated } from './apiService';
import { storage } from './storage';

const RATE_LIMIT_KEY = 'headlinez_news_rate_limit';

// Local cache for offline support
async function cacheArticles(key: string, articles: NewsArticle[]): Promise<void> {
  try {
    await storage.setItem(`news_cache_${key}`, JSON.stringify({
      articles,
      cachedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to cache articles:', e);
  }
}

async function getCachedArticles(key: string): Promise<NewsArticle[] | null> {
  try {
    const cached = await storage.getItem(`news_cache_${key}`);
    if (cached) {
      const { articles, cachedAt } = JSON.parse(cached);
      // Cache valid for 30 minutes
      const cacheAge = Date.now() - new Date(cachedAt).getTime();
      if (cacheAge < 30 * 60 * 1000) {
        return articles;
      }
    }
  } catch (e) {
    console.error('Failed to get cached articles:', e);
  }
  return null;
}

export async function fetchLatestNews(params: {
  country?: string;
  category?: string;
  language?: string;
  size?: number;
}): Promise<NewsArticle[]> {
  const cacheKey = `${params.country || 'all'}_${params.category || 'all'}_${params.language || 'en'}`;
  
  try {
    // Ensure we're authenticated
    await ensureAuthenticated();
    
    // Fetch from backend API
    const response = await api.getLatestNews({
      country: params.country,
      category: params.category,
      language: params.language || 'en',
      size: params.size || 30
    });
    
    if (response.success && response.articles.length > 0) {
      // Transform to match expected format
      const articles: NewsArticle[] = response.articles.map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.imageUrl,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        category: article.category,
        country: article.country,
        language: article.language
      }));
      
      // Cache for offline use
      await cacheArticles(cacheKey, articles);
      
      return articles;
    }
  } catch (error) {
    console.warn('API fetch failed, trying cache...', error);
  }
  
  // Try cached data as fallback
  const cachedArticles = await getCachedArticles(cacheKey);
  if (cachedArticles && cachedArticles.length > 0) {
    return cachedArticles;
  }
  
  // Final fallback: mock data
  return [
    {
      id: 'mock-1',
      title: 'Global Tech Summit 2026: The Future of AI and Robotics',
      description: 'Leaders from across the globe gather to discuss the ethical implications and transformative potential of next-generation artificial intelligence.',
      url: 'https://example.com/tech-summit',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      sourceName: 'TechDaily',
      publishedAt: new Date().toISOString(),
      category: ['technology'],
      country: ['us'],
      language: 'en',
    },
    {
      id: 'mock-2',
      title: 'Mars Colony Project Reaches Major Milestone',
      description: 'The first sustainable habitat module has successfully completed its pressure tests.',
      url: 'https://example.com/mars-colony',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9',
      sourceName: 'SpaceXplorer',
      publishedAt: new Date().toISOString(),
      category: ['science'],
      country: ['us'],
      language: 'en',
    },
    {
      id: 'mock-3',
      title: 'Renewable Energy Surpasses Fossil Fuels in Global Grid',
      description: 'For the first time in history, wind and solar power have contributed more to the global energy supply.',
      url: 'https://example.com/energy-shift',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c',
      sourceName: 'GreenFuture',
      publishedAt: new Date().toISOString(),
      category: ['environment'],
      country: ['us'],
      language: 'en',
    },
  ];
}
