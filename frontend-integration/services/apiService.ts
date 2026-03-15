/**
 * API Service for Headlinez Backend
 * Update EXPO_PUBLIC_API_URL in your .env file to point to your backend
 */

import { storage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8001/api';
const TOKEN_KEY = 'headlinez_auth_token';
const DEVICE_ID_KEY = 'headlinez_device_id';

// Generate or get device ID
async function getDeviceId(): Promise<string> {
  let deviceId = await storage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await storage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Get stored auth token
async function getAuthToken(): Promise<string | null> {
  return storage.getItem(TOKEN_KEY);
}

// Store auth token
async function setAuthToken(token: string): Promise<void> {
  await storage.setItem(TOKEN_KEY, token);
}

// Clear auth token
async function clearAuthToken(): Promise<void> {
  await storage.removeItem(TOKEN_KEY);
}

// Base API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// Auto-authenticate with device ID
export async function ensureAuthenticated(): Promise<{
  token: string;
  user: any;
}> {
  const existingToken = await getAuthToken();
  
  // If we have a token, try to use it
  if (existingToken) {
    try {
      // Verify token by fetching preferences
      await apiRequest('/preferences');
      return { token: existingToken, user: null };
    } catch (error) {
      // Token invalid, clear it
      await clearAuthToken();
    }
  }
  
  // No valid token, authenticate with device ID
  const deviceId = await getDeviceId();
  const response = await apiRequest<{ success: boolean; token: string; user: any }>(
    '/auth/device',
    {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    }
  );
  
  if (response.success && response.token) {
    await setAuthToken(response.token);
    return { token: response.token, user: response.user };
  }
  
  throw new Error('Authentication failed');
}

export const api = {
  // Auth
  async loginWithEmail(email: string, password: string) {
    const response = await apiRequest<{ success: boolean; token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.token) {
      await setAuthToken(response.token);
    }
    return response;
  },
  
  async register(email: string, password: string) {
    const deviceId = await getDeviceId();
    const response = await apiRequest<{ success: boolean; token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, deviceId }),
      }
    );
    if (response.token) {
      await setAuthToken(response.token);
    }
    return response;
  },
  
  async logout() {
    await clearAuthToken();
  },
  
  // News
  async getLatestNews(params: {
    country?: string;
    category?: string;
    language?: string;
    size?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.country) queryParams.append('country', params.country);
    if (params.category) queryParams.append('category', params.category);
    if (params.language) queryParams.append('language', params.language);
    if (params.size) queryParams.append('size', params.size.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/news/latest${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ success: boolean; articles: any[]; cached: boolean }>(endpoint);
  },
  
  // Preferences
  async getPreferences() {
    return apiRequest<{
      success: boolean;
      preferences: {
        selectedCountries: string[];
        selectedTopics: string[];
        theme: string;
      };
    }>('/preferences');
  },
  
  async updatePreferences(preferences: {
    selectedCountries?: string[];
    selectedTopics?: string[];
    theme?: string;
  }) {
    return apiRequest<{ success: boolean; preferences: any }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
  
  async updateCountries(countries: string[]) {
    return apiRequest<{ success: boolean; selectedCountries: string[] }>(
      '/preferences/countries',
      {
        method: 'PUT',
        body: JSON.stringify({ countries }),
      }
    );
  },
  
  async updateTopics(topics: string[]) {
    return apiRequest<{ success: boolean; selectedTopics: string[] }>(
      '/preferences/topics',
      {
        method: 'PUT',
        body: JSON.stringify({ topics }),
      }
    );
  },
  
  // Saved Articles
  async getSavedArticles(category?: string) {
    const endpoint = category && category !== 'all' 
      ? `/saved?category=${encodeURIComponent(category)}`
      : '/saved';
    return apiRequest<{ success: boolean; savedArticles: any[] }>(endpoint);
  },
  
  async saveArticle(article: any) {
    return apiRequest<{ success: boolean; savedArticles: any[] }>('/saved', {
      method: 'POST',
      body: JSON.stringify({ article }),
    });
  },
  
  async unsaveArticle(articleId: string) {
    return apiRequest<{ success: boolean; savedArticles: any[] }>(
      `/saved/${encodeURIComponent(articleId)}`,
      { method: 'DELETE' }
    );
  },
  
  async isArticleSaved(articleId: string) {
    return apiRequest<{ success: boolean; isSaved: boolean }>(
      `/saved/check/${encodeURIComponent(articleId)}`
    );
  },
  
  // User Stats
  async getStats() {
    return apiRequest<{
      success: boolean;
      stats: {
        articlesRead: number;
        currentStreak: number;
        lastReadDate: string | null;
        totalTimeSpent: number;
        savedArticlesCount: number;
      };
    }>('/stats');
  },
  
  async recordRead(articleId: string, timeSpent?: number) {
    return apiRequest<{ success: boolean; stats: any }>('/stats/read', {
      method: 'POST',
      body: JSON.stringify({ articleId, timeSpent }),
    });
  },
  
  // AI Features
  async generateHashtags(titles: string[]) {
    return apiRequest<{ success: boolean; hashtags: string[] }>('/ai/hashtags', {
      method: 'POST',
      body: JSON.stringify({ titles }),
    });
  },
};

export default api;
