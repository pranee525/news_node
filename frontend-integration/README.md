# Headlinez Mobile - Frontend Integration Guide

This folder contains updated service files that integrate your React Native frontend with the new Node.js backend.

## Setup Instructions

### 1. Update your `.env` file

Add the following to your `.env` file:

```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

For local development:
```
EXPO_PUBLIC_API_URL=http://localhost:8001/api
```

### 2. Replace the following files in your project:

| Original File | New File |
|--------------|----------|
| `src/services/newsService.ts` | `services/newsService.ts` |
| `src/services/aiService.ts` | `services/aiService.ts` |
| `src/hooks/useUserPreferences.ts` | `hooks/useUserPreferences.ts` |
| `src/hooks/useUserStats.ts` | `hooks/useUserStats.ts` |
| `src/context/SavedArticlesContext.tsx` | `context/SavedArticlesContext.tsx` |

### 3. Add the new API service file:

Copy `services/apiService.ts` to `src/services/apiService.ts`

### 4. Update your imports

The new files maintain the same export signatures, so most of your existing code should work without changes.

## API Endpoints

The backend provides the following endpoints:

### Authentication
- `POST /api/auth/device` - Anonymous auth with device ID
- `POST /api/auth/register` - Register with email
- `POST /api/auth/login` - Login with email

### News
- `GET /api/news/latest` - Get latest news (query params: country, category, language, size)

### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update all preferences
- `PUT /api/preferences/countries` - Update countries
- `PUT /api/preferences/topics` - Update topics
- `PUT /api/preferences/theme` - Update theme

### Saved Articles
- `GET /api/saved` - Get saved articles
- `POST /api/saved` - Save an article
- `DELETE /api/saved/:articleId` - Remove saved article
- `GET /api/saved/check/:articleId` - Check if article is saved

### User Stats
- `GET /api/stats` - Get user stats
- `POST /api/stats/read` - Record article read

### AI Features
- `POST /api/ai/hashtags` - Generate trending hashtags

## Features

- **Offline Support**: All data is cached locally first, then synced with backend
- **Seamless Auth**: Device-based anonymous authentication
- **Cross-device Sync**: User data syncs across devices when logged in
- **Fallback**: Falls back to local data and mock data when backend is unavailable
