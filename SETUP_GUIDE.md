# SpeedoBike Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Configure API Keys

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
4. Create API keys (separate keys recommended for Android, iOS, and web)
5. Update `app.json`:
   ```json
   "plugins": [
     [
       "react-native-maps",
       {
         "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
       }
     ]
   ],
   "extra": {
     "googlePlacesApiKey": "YOUR_GOOGLE_PLACES_API_KEY"
   }
   ```

#### Expo Configuration
1. Install Expo CLI: `npm install -g eas-cli`
2. Login to your Expo account: `eas login`
3. Link your project: `eas project:create`
4. Update `app.json` with your project ID in `extra.eas.projectId`

### 3. Run the App

#### Android
```bash
npm run android
# or
expo start --android
```

#### iOS
```bash
npm run ios
# or
expo start --ios
```

#### Web (for testing, maps functionality limited)
```bash
npm run web
# or
expo start --web
```

## Project Structure

```
src/
├── App.tsx                          # Main app entry
├── screens/
│   └── MapScreen.tsx               # Main map interface with speedometer overlay
├── components/
│   ├── Speedometer.tsx             # Real-time speed display + stats
│   └── FuelPumpBottomSheet.tsx      # Fuel logging UI
├── hooks/
│   └── useLocationTracking.ts       # GPS tracking, speed calc, fuel detection
├── store/
│   └── useStore.ts                 # Zustand state management
└── services/
    └── placesApi.ts                # Google Places API integration
```

## Key Features Implemented

### 1. **Real-Time Telemetry**
- GPS-based speed tracking in km/h
- Current location monitoring
- High-accuracy location updates

### 2. **Session Tracking**
- Trip distance calculation using Haversine formula
- Top speed recording per session
- Session timestamp tracking

### 3. **Persistent Odometer**
- Lifetime distance accumulation
- Survives app restarts (stored in AsyncStorage)

### 4. **Smart Fuel Pump Detection**
- Monitors idle state (speed < 1 km/h for 90 seconds)
- Triggers Google Places API (Nearby Search) for gas stations within 30m
- Shows bottom sheet UI when gas station detected

### 5. **Fuel Logging**
- Input liters pumped
- Auto-calculates mileage (km/L)
- Stores fuel logs with timestamp and location
- Calculates average mileage across all logs
- Resets trip distance after logging

### 6. **Dark Mode UI**
- Minimalist design with dark background
- Custom dark-themed Google Maps style
- High-contrast typography for speedometer
- Responsive layout (portrait/landscape)

## State Management (Zustand Store)

### Key State
```typescript
// Real-time
currentSpeed: number
currentLatitude: number
currentLongitude: number

// Session
tripDistance: number
topSpeed: number
sessionStartTime: number

// Persistent
odometer: number
fuelLogs: FuelLog[]

// Tracking
isAtFuelPump: boolean
idleStartTime: number | null
averageMileage: number
```

### Key Actions
- `setCurrentSpeed()` - Update GPS speed
- `setCurrentLocation()` - Update GPS coords
- `setTripDistance()` - Increment trip distance
- `setIsAtFuelPump()` - Toggle fuel pump detection
- `addFuelLog()` - Save fuel entry
- `resetTrip()` - Clear trip stats (after fuel log)
- `startNewSession()` - Begin new tracking session

## Location Tracking Hook

### How It Works
1. **GPS Subscription**: Watches position with 1-second updates
2. **Distance Calculation**: Uses Haversine formula between coordinates
3. **Speed Extraction**: Converts m/s (from GPS) to km/h
4. **Idle Detection**: Tracks time when speed < 1 km/h
5. **Fuel Station Check**: Every second, if idle ≥ 90s:
   - Calls Google Places API (Nearby Search)
   - Looks for `type=gas_station` within 30m radius
   - Triggers UI if found

## Google Places API Call

```typescript
// Nearby Search
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location=37.7749,-122.4194
  &radius=30
  &type=gas_station
  &key=YOUR_API_KEY
```

## Permissions Required

### Android (`android.permission`)
- `ACCESS_FINE_LOCATION` - High-accuracy GPS
- `ACCESS_COARSE_LOCATION` - Network-based location
- `ACCESS_BACKGROUND_LOCATION` - Background tracking

### iOS (`NSLocationWhenInUseUsageDescription`)
- "We need your location to track your speed and mileage"
- "We need your location to track your speed and mileage in the background"

## Dark Mode Map Style

The `MapScreen` includes a comprehensive dark-themed Google Maps style with:
- Dark geometry (#212121)
- Muted labels (#757575, #8a8a8a)
- Low-light roads and water (#2c2c2c, #17263c)
- No visual clutter for minimalist UI

## Next Steps / Future Iterations

1. **Fuel History UI**: Display all fuel logs with graphs
2. **Trip Summary Screen**: End-of-trip statistics and analytics
3. **Settings Screen**: Adjust idle timer, search radius, units (km/L vs mpg)
4. **Notifications**: Push alerts for low fuel, high speeds
5. **Cloud Sync**: Backup fuel logs to cloud
6. **Export**: CSV/PDF export of trip data
7. **Audio Feedback**: Beeps for speed milestones, fuel detection
8. **Custom Markers**: Show gas stations on map when idle detected

## Troubleshooting

### Maps not showing
- Verify Google Maps API key is correct in `app.json`
- Check API key has Maps SDK enabled
- Ensure API key restrictions allow Android/iOS package

### Location not updating
- Check app has location permissions granted
- Enable "Always Allow" for background location (Android 11+)
- Verify device has GPS enabled

### Fuel detection not triggering
- Check Google Places API key is configured
- Ensure nearby gas stations exist (30m radius)
- Check network connectivity
- Verify Places API is enabled in Google Cloud Console

### AsyncStorage errors
- Clear app data and restart
- On Expo, metadata may need adjustment

## Dependencies Overview

| Package | Purpose |
|---------|---------|
| `react-native` | UI framework |
| `expo` | Development platform |
| `expo-location` | GPS tracking |
| `react-native-maps` | Google Maps integration |
| `zustand` | Lightweight state management |
| `@react-native-async-storage/async-storage` | Persistent storage |

## License

MIT
