# Headlinez News App - Product Requirements Document

## Original Problem Statement
Create a Node.js/Express backend for an existing React Native (Expo) news app called Headlinez. The frontend was provided and needed a backend with:
- News aggregation from NewsData.io with fallback APIs
- User authentication (device-based and email)
- Saved articles sync across devices
- User preferences storage (countries, topics, theme)
- User stats tracking (articles read, streak)
- AI features (trending hashtags via Gemini)

## User Choices
- Framework: Express.js
- Database: MongoDB
- AI: Gemini 2.0 Flash via Emergent LLM key
- Keep existing NewsData.io API key in frontend

## Architecture

### Backend (Node.js/Express)
- Port: 8001
- MongoDB for data persistence
- JWT authentication
- News caching (30 min TTL)

### AI Service (Python/FastAPI)
- Port: 8002
- Uses emergentintegrations library
- Gemini 2.0 Flash for hashtag generation

### Data Models
- User: auth, preferences, saved articles, stats
- CachedNews: news cache with TTL

## What's Implemented (March 15, 2026)

### Backend Features ✅
- Health check endpoint
- Device-based anonymous authentication
- Email registration and login
- JWT token management
- News fetching with filters (country, category, language)
- News caching in MongoDB
- User preferences CRUD
- Saved articles management
- User stats tracking (read count, streak, time spent)
- AI hashtag generation with Gemini

### Frontend Integration Files ✅
- apiService.ts - API client with auth
- newsService.ts - Updated news service
- aiService.ts - Updated AI service
- useUserPreferences.ts - Backend-synced hook
- useSavedArticles context - Backend-synced context
- useUserStats.ts - Backend-synced hook

## Testing Status
- All 38 backend tests passed
- News API integration verified
- AI hashtag generation working
- Auth flow tested end-to-end

## Backlog / Future Features

### P0 (Critical)
- None remaining

### P1 (High Priority)
- Push notifications for breaking news
- Search functionality
- Pagination for news feed

### P2 (Medium Priority)
- Social sharing analytics
- Article recommendations based on reading history
- Multi-language support

### P3 (Nice to Have)
- Admin dashboard
- Content moderation
- A/B testing for UI features

## Next Steps
1. Integrate frontend files with React Native app
2. Deploy backend to production
3. Set up CI/CD pipeline
4. Add monitoring and logging
