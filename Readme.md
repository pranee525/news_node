# Headlinez News App - Node.js Backend

A Node.js/Express backend for the Headlinez React Native news app with news aggregation, user management, and AI features.

## Features

- **News Aggregation**: Fetches from NewsData.io with fallback to Saurav.tech API
- **User Authentication**: Device-based anonymous auth and email registration
- **Saved Articles**: Cross-device article bookmarking
- **User Preferences**: Countries, topics, and theme preferences sync
- **User Stats**: Article read tracking and streak system
- **AI Features**: Trending hashtag generation using Gemini via Emergent

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI**: Gemini 2.0 Flash via Emergent integration

## API Endpoints

### Health
- `GET /api/health` - Service health check

### Authentication
- `POST /api/auth/device` - Anonymous device authentication
- `POST /api/auth/register` - Email registration
- `POST /api/auth/login` - Email login

### News
- `GET /api/news/latest` - Fetch latest news
  - Query params: `country`, `category`, `language`, `size`

### User Preferences (Auth Required)
- `GET /api/preferences` - Get preferences
- `PUT /api/preferences` - Update all preferences
- `PUT /api/preferences/countries` - Update countries
- `PUT /api/preferences/topics` - Update topics
- `PUT /api/preferences/theme` - Update theme

### Saved Articles (Auth Required)
- `GET /api/saved` - Get saved articles
- `POST /api/saved` - Save an article
- `DELETE /api/saved/:articleId` - Remove saved article
- `GET /api/saved/check/:articleId` - Check if saved

### User Stats (Auth Required)
- `GET /api/stats` - Get user stats
- `POST /api/stats/read` - Record article read

### AI Features
- `POST /api/ai/hashtags` - Generate trending hashtags

## Environment Variables

```env
PORT=8001
MONGODB_URI=mongodb://localhost:27017/headlinez
NEWSDATA_API_KEY=your_newsdata_api_key
GEMINI_API_KEY=your_emergent_llm_key
JWT_SECRET=your_jwt_secret
```

## Running Locally

```bash
# Install dependencies
npm install

# Start MongoDB
mongod

# Start AI service (Python)
python3 ai_service.py &

# Start main server
node app.js
```

## Project Structure

```
/app
├── app.js              # Main Express application
├── ai_service.py       # Python AI microservice
├── .env               # Environment variables
├── Models/
│   ├── user.js        # User model with auth
│   └── cachedNews.js  # News cache model
├── Routes/
│   ├── news.js        # News endpoints
│   ├── auth.js        # Authentication
│   ├── userPreferences.js
│   ├── savedArticles.js
│   ├── userStats.js
│   └── ai.js          # AI features
├── Services/
│   ├── newsApiService.js  # News API integration
│   └── aiService.js       # AI service client
├── middleware/
│   └── auth.js        # JWT auth middleware
└── frontend-integration/  # Frontend integration files
```

## Frontend Integration

See `/frontend-integration/README.md` for instructions on integrating with the React Native app.
