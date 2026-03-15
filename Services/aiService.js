const axios = require('axios');

// AI service can be internal Python service or fallback to defaults
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';

const defaultHashtags = ['#WorldNews', '#Technology', '#Economy', '#Health', '#Politics', '#Science'];

async function generateTrendingHashtags(titles = []) {
  if (titles.length === 0) {
    return defaultHashtags;
  }

  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/hashtags`,
      { titles: titles.slice(0, 10) },
      { timeout: 30000 }
    );

    if (response.data?.success && response.data?.hashtags?.length > 0) {
      return response.data.hashtags;
    }
    
    return defaultHashtags;
  } catch (error) {
    console.error('AI service error:', error.message);
    return defaultHashtags;
  }
}

module.exports = {
  generateTrendingHashtags
};
