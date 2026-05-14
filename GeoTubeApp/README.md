# GeoTube Mobile App

A React Native mobile application for exploring YouTube videos on an interactive 3D globe.

## Features

- **3D Globe Visualization**: Interactive globe showing geotagged YouTube videos
- **Search & Discovery**: Search for topics and discover videos by location
- **Video Player**: Watch videos directly in the app
- **Country Comparison**: Compare video content across different countries
- **Analysis Dashboard**: AI-powered insights and analytics
- **Split-screen Mode**: Watch videos while analyzing data

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Backend server running (see backend README)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   Make sure the Java Spring Boot backend is running on `http://localhost:8080`

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

## Project Structure

```
GeoTubeApp/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Main home screen
│   │   └── _layout.tsx    # Tab layout
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── analysis/          # Analysis dashboard components
│   ├── comparison/        # Country comparison components
│   └── ...               # Other UI components
├── context/               # React Context for state management
├── services/              # API services
└── constants/             # App constants
```

## Key Components

- **HomePage**: Main screen with globe and search
- **GlobeView**: 3D globe visualization using WebView
- **AnalysisLayout**: Split-screen analysis mode
- **VideoSidebar**: Video list overlay
- **SearchBar**: Search input component

## API Integration

The app connects to a Java Spring Boot backend that provides:

- YouTube search and geocoding
- Video data retrieval
- AI-powered analysis
- MongoDB data storage

## Mobile Optimizations

- Responsive design for mobile screens
- Touch gestures for globe interaction
- Bottom tab navigation
- Optimized video playback
- Offline-capable search history

## Development

- Uses Expo for easy development and deployment
- TypeScript for type safety
- React Navigation for routing
- Axios for API calls
- AsyncStorage for local storage

## Building for Production

```bash
# Build for Android APK
expo build:android

# Build for iOS (requires macOS)
expo build:ios
```

## Troubleshooting

- **Globe not loading**: Check internet connection for WebView resources
- **API errors**: Ensure backend server is running on localhost:8080
- **Video playback issues**: Check network permissions in Android settings

## License

MIT License
