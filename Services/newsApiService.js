const axios = require('axios');

const API_KEY = process.env.NEWSDATA_API_KEY || 'pub_473f6a9b5c3e4bc3b0dc2cec346ae889';
const BASE_URL = 'https://newsdata.io/api/1/latest';

// Rate limiting state (in-memory for simplicity, could be moved to Redis)
let rateLimitInfo = {
  count: 0,
  lastReset: new Date().toISOString()
};
const MAX_DAILY_CALLS = 190;

function checkRateLimit() {
  const now = new Date();
  const lastReset = new Date(rateLimitInfo.lastReset);
  
  // Reset counter if 24 hours have passed
  if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
    rateLimitInfo.count = 0;
    rateLimitInfo.lastReset = now.toISOString();
    return true;
  }
  
  return rateLimitInfo.count < MAX_DAILY_CALLS;
}

function incrementRateLimit() {
  rateLimitInfo.count += 1;
}

async function fetchFromNewsDataIO(params) {
  try {
    if (!checkRateLimit()) {
      console.log('NewsData.io rate limit reached');
      return null;
    }

    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', API_KEY);
    
    if (params.country) url.searchParams.append('country', params.country);
    if (params.category) url.searchParams.append('category', params.category);
    url.searchParams.append('size', (params.size || 10).toString());
    url.searchParams.append('language', params.language || 'en');

    const response = await axios.get(url.toString(), { timeout: 10000 });
    
    if (response.data.status === 'success' && response.data.results?.length > 0) {
      incrementRateLimit();
      
      return response.data.results.map(article => ({
        id: article.article_id,
        title: article.title,
        description: article.description,
        url: article.link,
        imageUrl: article.image_url,
        sourceName: article.source_id,
        publishedAt: article.pubDate,
        category: article.category || [],
        country: article.country || [],
        language: article.language
      }));
    }
    
    return null;
  } catch (error) {
    console.error('NewsData.io API error:', error.message);
    return null;
  }
}

async function fetchFromFallbackAPI(params) {
  try {
    const fallbackCountry = params.country?.split(',')[0] || 'us';
    const fallbackCategory = params.category?.split(',')[0] || 'general';
    const fallbackUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${fallbackCategory}/${fallbackCountry}.json`;

    const response = await axios.get(fallbackUrl, { timeout: 10000 });
    
    if (response.data.articles?.length > 0) {
      return response.data.articles.map((article, index) => ({
        id: `fallback-${index}-${Date.now()}`,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        sourceName: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        category: [fallbackCategory],
        country: [fallbackCountry],
        language: 'en'
      }));
    }
    
    return null;
  } catch (error) {
    console.error('Fallback API error:', error.message);
    return null;
  }
}

function getMockData() {
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
      language: 'en'
    },
    {
      id: 'mock-2',
      title: 'Mars Colony Project Reaches Major Milestone',
      description: 'The first sustainable habitat module has successfully completed its pressure tests, bringing humanity one step closer to interplanetary life.',
      url: 'https://example.com/mars-colony',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9',
      sourceName: 'SpaceXplorer',
      publishedAt: new Date().toISOString(),
      category: ['science'],
      country: ['us'],
      language: 'en'
    },
    {
      id: 'mock-3',
      title: 'Renewable Energy Surpasses Fossil Fuels in Global Grid',
      description: 'For the first time in history, wind and solar power have contributed more to the global energy supply than coal and gas combined.',
      url: 'https://example.com/energy-shift',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-fe5bb6583e2c',
      sourceName: 'GreenFuture',
      publishedAt: new Date().toISOString(),
      category: ['environment'],
      country: ['us'],
      language: 'en'
    }
  ];
}

async function fetchLatestNews(params = {}) {
  // 1. Try Primary API (NewsData.io)
  let articles = await fetchFromNewsDataIO(params);
  
  if (articles && articles.length > 0) {
    return articles;
  }

  // 2. Try Fallback API
  articles = await fetchFromFallbackAPI(params);
  
  if (articles && articles.length > 0) {
    return articles;
  }

  // 3. Return mock data as final fallback
  console.log('Using mock data as fallback');
  return getMockData();
}

module.exports = {
  fetchLatestNews,
  getRateLimitInfo: () => rateLimitInfo
};
