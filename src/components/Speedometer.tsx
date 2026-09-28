import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useStore } from '../store/useStore';

const Speedometer: React.FC = () => {
  const { currentSpeed, topSpeed, tripDistance, odometer } = useStore();
  const { width } = useWindowDimensions();

  const isLandscape = width > 600;

  const formattedSpeed = Math.round(currentSpeed);
  const formattedTopSpeed = Math.round(topSpeed);
  const formattedTripDistance = tripDistance.toFixed(1);
  const formattedOdometer = odometer.toFixed(0);

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {/* Primary speed display */}
      <View style={styles.speedDisplayWrapper}>
        <Text style={styles.speedValue}>{formattedSpeed}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* Secondary stats row */}
      <View style={[styles.statsRow, isLandscape && styles.statsRowLandscape]}>
        {/* Top Speed */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Top</Text>
          <Text style={styles.statValue}>{formattedTopSpeed}</Text>
          <Text style={styles.statUnit}>km/h</Text>
        </View>

        {/* Trip Distance */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Trip</Text>
          <Text style={styles.statValue}>{formattedTripDistance}</Text>
          <Text style={styles.statUnit}>km</Text>
        </View>

        {/* Odometer */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Odo</Text>
          <Text style={styles.statValue}>{formattedOdometer}</Text>
          <Text style={styles.statUnit}>km</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  containerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  speedDisplayWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speedValue: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 130,
    letterSpacing: -2,
  },
  speedUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AAAAAA',
    letterSpacing: 1,
    marginTop: -8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statsRowLandscape: {
    flexDirection: 'column',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});

export default Speedometer;
