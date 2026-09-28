import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FuelLog {
  id: string;
  timestamp: number;
  liters: number;
  mileage: number; // km/L
  tripDistance: number; // km driven before refuel
  location: {
    latitude: number;
    longitude: number;
  };
  gasStationName?: string;
}

export interface TelemetryState {
  // Real-time telemetry
  currentSpeed: number; // km/h
  currentLatitude: number;
  currentLongitude: number;

  // Session tracking
  tripDistance: number; // km
  topSpeed: number; // km/h in current session
  sessionStartTime: number; // timestamp

  // Lifetime stats
  odometer: number; // lifetime km

  // Fuel tracking
  fuelLogs: FuelLog[];
  isAtFuelPump: boolean;
  idleStartTime: number | null;
  averageMileage: number; // km/L average across all logs

  // Actions
  setCurrentSpeed: (speed: number) => void;
  setCurrentLocation: (latitude: number, longitude: number) => void;
  setTripDistance: (distance: number) => void;
  setTopSpeed: (speed: number) => void;
  setIdleStartTime: (time: number | null) => void;
  setIsAtFuelPump: (isAt: boolean) => void;
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void;
  resetTrip: () => void;
  startNewSession: () => void;
  calculateAverageMileage: () => void;
}

export const useStore = create<TelemetryState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSpeed: 0,
      currentLatitude: 0,
      currentLongitude: 0,
      tripDistance: 0,
      topSpeed: 0,
      sessionStartTime: Date.now(),
      odometer: 0,
      fuelLogs: [],
      isAtFuelPump: false,
      idleStartTime: null,
      averageMileage: 0,

      // Actions
      setCurrentSpeed: (speed: number) => {
        set((state) => {
          const newTopSpeed = Math.max(state.topSpeed, speed);
          return { currentSpeed: speed, topSpeed: newTopSpeed };
        });
      },

      setCurrentLocation: (latitude: number, longitude: number) => {
        set({ currentLatitude: latitude, currentLongitude: longitude });
      },

      setTripDistance: (distance: number) => {
        set((state) => ({
          tripDistance: distance,
          odometer: state.odometer + distance,
        }));
      },

      setTopSpeed: (speed: number) => {
        set((state) => ({
          topSpeed: Math.max(state.topSpeed, speed),
        }));
      },

      setIdleStartTime: (time: number | null) => {
        set({ idleStartTime: time });
      },

      setIsAtFuelPump: (isAt: boolean) => {
        set({ isAtFuelPump: isAt });
      },

      addFuelLog: (log: Omit<FuelLog, 'id'>) => {
        set((state) => {
          const newLog: FuelLog = {
            ...log,
            id: `fuel_${Date.now()}`,
          };
          return {
            fuelLogs: [...state.fuelLogs, newLog],
          };
        });
        get().calculateAverageMileage();
      },

      resetTrip: () => {
        set({
          tripDistance: 0,
          topSpeed: 0,
          sessionStartTime: Date.now(),
        });
      },

      startNewSession: () => {
        set({
          currentSpeed: 0,
          tripDistance: 0,
          topSpeed: 0,
          sessionStartTime: Date.now(),
          idleStartTime: null,
          isAtFuelPump: false,
        });
      },

      calculateAverageMileage: () => {
        set((state) => {
          if (state.fuelLogs.length === 0) {
            return { averageMileage: 0 };
          }
          const totalMileage = state.fuelLogs.reduce((sum, log) => sum + log.mileage, 0);
          const average = totalMileage / state.fuelLogs.length;
          return { averageMileage: parseFloat(average.toFixed(2)) };
        });
      },
    }),
    {
      name: 'speedo-bike-store',
      storage: {
        getItem: async (name) => {
          const item = await AsyncStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        odometer: state.odometer,
        fuelLogs: state.fuelLogs,
        averageMileage: state.averageMileage,
      }),
    }
  )
);
