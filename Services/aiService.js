const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let genAI = null;

function getGenAI() {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

async function generateTrendingHashtags(titles = []) {
  const defaultHashtags = ['#WorldNews', '#Technology', '#Economy', '#Health', '#Politics', '#Science'];
  
  if (titles.length === 0) {
    return defaultHashtags;
  }

  try {
    const ai = getGenAI();
    if (!ai) {
      console.log('Gemini API key not configured, using default hashtags');
      return defaultHashtags;
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Based on these news titles, generate 6 trending hashtags that represent the current news landscape. Return ONLY a JSON array of strings, no other text.

Titles:
${titles.slice(0, 10).join('\n')}

Respond with only the JSON array like: ["#Hashtag1", "#Hashtag2", ...]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      cleanText = cleanText.trim();
      
      const hashtags = JSON.parse(cleanText);
      if (Array.isArray(hashtags) && hashtags.length > 0) {
        return hashtags.slice(0, 6);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError.message);
    }
    
    return defaultHashtags;
  } catch (error) {
    console.error('Error generating hashtags:', error.message);
    return defaultHashtags;
  }
}

module.exports = {
  generateTrendingHashtags
};
