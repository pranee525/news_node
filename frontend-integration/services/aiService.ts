/**
 * AI Service - Updated to use backend API
 * Replace your existing aiService.ts with this file
 */

import { api, ensureAuthenticated } from './apiService';

export async function generateTrendingHashtags(titles: string[]): Promise<string[]> {
  const defaultHashtags = ['#WorldNews', '#Technology', '#Economy', '#Health', '#Politics', '#Science'];
  
  if (titles.length === 0) {
    return defaultHashtags;
  }

  try {
    // Ensure authenticated
    await ensureAuthenticated();
    
    // Call backend AI endpoint
    const response = await api.generateHashtags(titles);
    
    if (response.success && response.hashtags.length > 0) {
      return response.hashtags;
    }
  } catch (error) {
    console.error('Error generating hashtags:', error);
  }

  return defaultHashtags;
}
