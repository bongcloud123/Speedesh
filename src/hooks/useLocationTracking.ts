import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useStore } from '../store/useStore';
import { nearbySearch } from '../services/placesApi';

const IDLE_THRESHOLD_SECONDS = 90;
const IDLE_CHECK_INTERVAL = 1000; // Check every 1 second
const GPS_UPDATE_INTERVAL = 1000; // Get GPS location every 1 second
const SPEED_THRESHOLD = 1; // km/h (consider 0 if below this)
const FUEL_STATION_SEARCH_RADIUS = 30; // meters

export const useLocationTracking = () => {
  const {
    currentSpeed,
    currentLatitude,
    currentLongitude,
    tripDistance,
    idleStartTime,
    setCurrentSpeed,
    setCurrentLocation,
    setIdleStartTime,
    setIsAtFuelPump,
    setTripDistance,
    isAtFuelPump,
  } = useStore();

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDistanceRef = useRef<number>(0);
  const lastLocationRef = useRef<{ lat: number; lon: number }>({
    lat: 0,
    lon: 0,
  });

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    // Haversine formula for distance between two coordinates (returns km)
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkFuelStation = useCallback(async () => {
    if (currentSpeed > SPEED_THRESHOLD || isAtFuelPump) {
      // If moving or already at pump, don't check
      return;
    }

    if (!idleStartTime) {
      return;
    }

    const idleDuration = (Date.now() - idleStartTime) / 1000;

    if (idleDuration >= IDLE_THRESHOLD_SECONDS) {
      try {
        const gasStations = await nearbySearch(
          currentLatitude,
          currentLongitude,
          FUEL_STATION_SEARCH_RADIUS,
          'gas_station'
        );

        if (gasStations && gasStations.length > 0) {
          // Found a gas station nearby
          setIsAtFuelPump(true);
          // Keep idleStartTime so we know when the pump detection happened
        } else {
          // No gas station found, reset idle timer
          setIdleStartTime(null);
        }
      } catch (error) {
        console.error('Error checking fuel station:', error);
        // Reset idle timer on error
        setIdleStartTime(null);
      }
    }
  }, [currentSpeed, idleStartTime, currentLatitude, currentLongitude, setIdleStartTime, setIsAtFuelPump, isAtFuelPump]);

  const startLocationTracking = useCallback(async () => {
    try {
      // Request foreground permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.error('Foreground location permission denied');
        return;
      }

      // Request background permissions
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
      }

      // Subscribe to location updates
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_UPDATE_INTERVAL,
          distanceInterval: 5, // Update if moved 5 meters
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          // Calculate distance traveled since last update
          if (lastLocationRef.current.lat !== 0 && lastLocationRef.current.lon !== 0) {
            const distanceDelta = calculateDistance(
              lastLocationRef.current.lat,
              lastLocationRef.current.lon,
              latitude,
              longitude
            );
            lastDistanceRef.current += distanceDelta;
            setTripDistance(lastDistanceRef.current);
          }

          lastLocationRef.current = { lat: latitude, lon: longitude };

          // Speed is in m/s, convert to km/h
          const speedKmH = (location.coords.speed || 0) * 3.6;

          setCurrentSpeed(speedKmH);
          setCurrentLocation(latitude, longitude);

          // Idle detection: if speed is below threshold
          if (speedKmH <= SPEED_THRESHOLD) {
            if (!idleStartTime) {
              // Just went idle
              setIdleStartTime(Date.now());
            }
          } else {
            // Moving again
            if (idleStartTime) {
              setIdleStartTime(null);
            }
            setIsAtFuelPump(false); // Reset fuel pump detection when moving
          }
        }
      );

      // Set up periodic fuel station check
      idleCheckIntervalRef.current = setInterval(checkFuelStation, IDLE_CHECK_INTERVAL);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }, [
    setCurrentSpeed,
    setCurrentLocation,
    setIdleStartTime,
    setTripDistance,
    setIsAtFuelPump,
    idleStartTime,
    checkFuelStation,
  ]);

  const stopLocationTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }

    if (idleCheckIntervalRef.current) {
      clearInterval(idleCheckIntervalRef.current);
      idleCheckIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [startLocationTracking, stopLocationTracking]);

  return {
    currentSpeed,
    currentLatitude,
    currentLongitude,
    tripDistance,
  };
};
