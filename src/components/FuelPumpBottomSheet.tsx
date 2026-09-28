import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store/useStore';

const FuelPumpBottomSheet: React.FC = () => {
  const {
    setIsAtFuelPump,
    addFuelLog,
    tripDistance,
    currentLatitude,
    currentLongitude,
    resetTrip,
  } = useStore();

  const [liters, setLiters] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogFuel = async () => {
    if (!liters || parseFloat(liters) <= 0) {
      alert('Please enter a valid amount of fuel');
      return;
    }

    setIsSubmitting(true);

    try {
      const litersAmount = parseFloat(liters);
      const mileage = tripDistance / litersAmount; // km/L

      // Add fuel log
      addFuelLog({
        timestamp: Date.now(),
        liters: litersAmount,
        mileage,
        tripDistance,
        location: {
          latitude: currentLatitude,
          longitude: currentLongitude,
        },
      });

      // Reset trip distance
      resetTrip();

      // Close bottom sheet
      setIsAtFuelPump(false);

      // Clear input
      setLiters('');

      // Show confirmation
      alert(`Logged ${litersAmount}L. Mileage: ${mileage.toFixed(2)} km/L`);
    } catch (error) {
      console.error('Error logging fuel:', error);
      alert('Error logging fuel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsAtFuelPump(false);
    setLiters('');
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={true}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.backdrop} />

        <View style={styles.bottomSheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <Text style={styles.title}>⛽ At a fuel pump?</Text>
          <Text style={styles.subtitle}>
            Log fuel to track your mileage efficiency
          </Text>

          {/* Fuel stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trip Distance</Text>
              <Text style={styles.statValue}>{tripDistance.toFixed(1)} km</Text>
            </View>
          </View>

          {/* Input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Fuel Pumped (Liters)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                value={liters}
                onChangeText={setLiters}
                editable={!isSubmitting}
              />
              <Text style={styles.inputUnit}>L</Text>
            </View>
          </View>

          {/* Calculated mileage preview */}
          {liters && parseFloat(liters) > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Estimated Mileage</Text>
              <Text style={styles.previewValue}>
                {(tripDistance / parseFloat(liters)).toFixed(2)} km/L
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleLogFuel}
              disabled={isSubmitting || !liters}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Logging...' : 'Log Fuel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444444',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingRight: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
  },
  previewBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  previewLabel: {
    fontSize: 12,
    color: '#4CAF50',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FuelPumpBottomSheet;
