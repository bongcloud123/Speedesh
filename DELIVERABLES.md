# SpeedoBike - First Iteration Deliverables ✅

## Overview
Complete React Native + Expo smart speedometer and mileage-tracking app scaffold with all core features for bikes/scooters. Android-first, cross-platform ready.

---

## 📋 DELIVERABLE 1: app.json Configuration

**File**: `app.json`

### What's Included
✅ **API Key Placeholders**
- Google Maps API Key (for react-native-maps)
- Google Places API Key (for fuel station detection)
- Expo EAS Project ID

✅ **Android Configuration**
- Package name: `com.example.speedobike`
- Required permissions:
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`
  - `ACCESS_BACKGROUND_LOCATION`
- Adaptive icon setup with dark background

✅ **iOS Configuration**
- Location usage descriptions (NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription)
- Tablet mode support

✅ **Plugins**
- expo-location with full permissions setup
- react-native-maps with API key configuration

### Next Steps
1. Create Google Maps & Places API keys (see SETUP_GUIDE.md)
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` and `YOUR_GOOGLE_PLACES_API_KEY`
3. Set `YOUR_EAS_PROJECT_ID` after running `eas project:create`

---

## 🗂️ DELIVERABLE 2: Zustand Store (State Management)

**File**: `src/store/useStore.ts`

### State Structure
```typescript
// Real-time telemetry
currentSpeed: number          // km/h from GPS
currentLatitude: number       // GPS latitude
currentLongitude: number      // GPS longitude

// Session tracking
tripDistance: number          // km traveled this session
topSpeed: number              // max speed this session
sessionStartTime: number      // timestamp when session started

// Persistent (AsyncStorage)
odometer: number              // lifetime km (persisted)
fuelLogs: FuelLog[]            // all fuel entries (persisted)

// Smart tracking
isAtFuelPump: boolean         // UI trigger for fuel logging
idleStartTime: number | null  // tracks when speed hit 0
averageMileage: number        // km/L average across all logs
```

### Key Actions
- `setCurrentSpeed(speed)` - Updates speed from GPS
- `setCurrentLocation(lat, lon)` - Updates position
- `setTripDistance(distance)` - Increments trip km (adds to odometer)
- `setTopSpeed(speed)` - Tracks session max
- `setIdleStartTime(time | null)` - Idle state tracking
- `setIsAtFuelPump(isAt)` - Toggles fuel pump detection UI
- `addFuelLog(log)` - Saves fuel entry, recalculates average
- `resetTrip()` - Clears trip stats after fuel log
- `startNewSession()` - Full reset for new tracking session

### Persistence
- Uses AsyncStorage to persist:
  - Lifetime odometer
  - All fuel logs
  - Average mileage
- Rehydrates automatically on app restart

---

## 📍 DELIVERABLE 3: Location Tracking Hook

**File**: `src/hooks/useLocationTracking.ts`

### Core Features

#### Real-Time Speed Tracking
- ✅ Watches GPS position with 1-second updates
- ✅ Converts GPS speed (m/s) to km/h
- ✅ Accuracy: High-accuracy GPS (Location.Accuracy.High)
- ✅ Updates when moved 5m+ or every 1 second (whichever first)

#### Trip Distance Calculation
- ✅ Uses Haversine formula for GPS coordinates
- ✅ Calculates incremental distance between location updates
- ✅ Accumulates in `tripDistance` state
- ✅ Converts to lifetime `odometer`

#### Idle Detection (90-second)
- ✅ Monitors when speed < 1 km/h
- ✅ Starts `idleStartTime` timer on first idle detection
- ✅ Resets timer if speed increases above 1 km/h
- ✅ Checks every 1 second if idle ≥ 90 seconds

#### Fuel Station Detection
When idle ≥ 90 seconds:
- ✅ Calls Google Places API (Nearby Search)
- ✅ Searches for `type=gas_station`
- ✅ Radius: 30 meters
- ✅ If found: sets `isAtFuelPump = true` → triggers UI
- ✅ If not found: resets idle timer to try again

### Permissions Handling
- ✅ Requests foreground location permission
- ✅ Requests background location permission
- ✅ Graceful fallback if background denied

### Cleanup
- ✅ Unsubscribes location listener on unmount
- ✅ Clears idle check interval on unmount

---

## 🎨 DELIVERABLE 4: Main Screen Boilerplate

**File**: `src/screens/MapScreen.tsx`

### Layout
- ✅ **Background**: Full-screen Google Map locked to user's current location
- ✅ **Custom Map Style**: Dark-themed style (customMapStyle) with:
  - Dark geometry (#212121)
  - Muted labels and roads
  - Low-light water (#17263c)
  - Minimalist design
- ✅ **Speedometer Overlay**: Absolute-positioned card floating above map
  - Adapts between portrait/landscape
  - Bottom of screen (portrait), side of screen (landscape)
  - Semi-transparent dark background with border

### Components Used
1. **Speedometer.tsx** - Real-time speed display
2. **FuelPumpBottomSheet.tsx** - Fuel logging UI (appears on demand)

### Responsive Design
- ✅ Portrait mode: Speedometer at bottom
- ✅ Landscape mode: Speedometer repositioned to side
- ✅ Uses `useWindowDimensions` for dynamic sizing

### Map Features
- ✅ Shows user's current location (blue dot)
- ✅ Auto-centers on user movement
- ✅ Zoom enabled
- ✅ Scroll, pitch, and rotate enabled
- ✅ Dark mode throughout

---

## 🏎️ ADDITIONAL COMPONENTS

### Speedometer Component
**File**: `src/components/Speedometer.tsx`

**Visual Design**:
- ✅ Massive speed numbers (fontSize: 120)
- ✅ High-contrast white text (#FFFFFF)
- ✅ Bold sans-serif (fontWeight: '900')
- ✅ Minimalist layout

**Displays**:
1. **Primary**: Current speed (km/h) - dominant, center
2. **Secondary Stats**:
   - Top Speed (km/h) this session
   - Trip Distance (km)
   - Lifetime Odometer (km)

**Layout Adaptation**:
- Portrait: Stats arranged horizontally below speed
- Landscape: Stats arranged vertically beside speed

### Fuel Pump Bottom Sheet
**File**: `src/components/FuelPumpBottomSheet.tsx`

**Triggers**: When `isAtFuelPump = true`

**UI Elements**:
- ✅ Title: "⛽ At a fuel pump?"
- ✅ Current trip distance display
- ✅ Input field for liters pumped
- ✅ Real-time mileage preview (km/L)
- ✅ Two buttons:
  - "Skip" - Dismiss without logging
  - "Log Fuel" - Save entry and reset trip

**On Log Fuel**:
1. Validates input (> 0)
2. Calculates mileage: `tripDistance / liters`
3. Saves fuel log with timestamp & location
4. Resets trip distance to 0
5. Updates average mileage
6. Shows confirmation alert
7. Closes bottom sheet

---

## 📦 Additional Files

### Package Configuration
- **package.json** - All dependencies listed with versions
- **tsconfig.json** - TypeScript strict mode configuration
- **.gitignore** - Standard Node/Expo/React Native ignores
- **src/App.tsx** - Root component wrapper

### Documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **DELIVERABLES.md** - This file

---

## 🚀 Quick Start Checklist

- [ ] Clone/download project files
- [ ] Create Google Maps API key
- [ ] Create Google Places API key
- [ ] Update `app.json` with API keys
- [ ] Run `npm install`
- [ ] Run `eas project:create` and add project ID to `app.json`
- [ ] Run `npm run android` or `npm run ios`
- [ ] Grant location permissions when prompted
- [ ] Test speed tracking and fuel detection

---

## 🔍 Architecture Highlights

### Data Flow
```
GPS Location Updates
    ↓
useLocationTracking Hook
    ├→ Calculate speed (m/s → km/h)
    ├→ Calculate trip distance (Haversine)
    ├→ Track idle time
    └→ Check for fuel stations (90s idle)
    ↓
Zustand Store
    ├→ currentSpeed, currentLocation
    ├→ tripDistance, topSpeed
    ├→ isAtFuelPump
    └→ fuelLogs (persisted)
    ↓
UI Components
    ├→ MapScreen (map + speedometer)
    ├→ Speedometer (real-time display)
    └→ FuelPumpBottomSheet (fuel logging)
```

### Smart Features
1. **Haversine Distance Calculation**: Accurate GPS-based distance from coordinates
2. **Idle-State Machine**: Simple but robust (0→idle→checking→found/reset)
3. **Places API Integration**: Single API call when idle detected
4. **Persistent State**: AsyncStorage survives app restarts
5. **Responsive UI**: Dynamic layout for portrait/landscape

---

## 🎯 What Works in First Iteration

✅ Real-time speed display (km/h)
✅ Trip distance tracking
✅ Top speed recording
✅ Lifetime odometer (persistent)
✅ Fuel pump detection (90-second idle + 30m radius)
✅ Fuel logging with mileage calculation
✅ Dark-mode minimalist UI
✅ Responsive layout (portrait/landscape)
✅ Background location permissions
✅ Google Maps integration
✅ State management with Zustand

---

## 📈 Suggested Next Features

**Iteration 2**:
- Fuel history UI with list/graph
- Trip summary screen
- Settings/preferences
- Audio feedback
- Cloud sync

**Iteration 3**:
- Advanced analytics
- Custom notifications
- Export data (CSV/PDF)
- Map markers for gas stations
- Speed alerts

---

## ⚠️ Important Notes

1. **API Keys**: Never commit real API keys to git. Use `.env` or `.env.local` in production.
2. **Permissions**: Android 12+ requires runtime permissions. App will request on first run.
3. **Background Location**: Some devices may disable background tracking if battery saver is active.
4. **GPS Accuracy**: Speed calculation depends on GPS accuracy. Updates may lag in weak signal areas.
5. **Maps Styling**: Dark map style looks best on dark-mode devices (standard for this app).

---

## 📞 Support Files

- **SETUP_GUIDE.md** - Detailed setup, troubleshooting, dependency info
- **DELIVERABLES.md** - This file
- **Project structure** - Clear src/ organization for easy navigation

---

**Status**: Ready to Build 🚀

All scaffolding complete. Next step: Add your API keys and run the app!
