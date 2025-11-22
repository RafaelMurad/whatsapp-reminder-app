import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, Region, MapPressEvent } from 'react-native-maps';
import Slider from '@react-native-community/slider';

import { Button, Input, Typography, Alert, Card } from '../components';
import { useLocationStore, useAuthStore } from '../store';
import { locationService } from '../services';
import { colors, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TriggerOn = 'enter' | 'exit' | 'both';

export function CreateGeofenceScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const { createGeofence, isLoading, error, clearError, currentLocation } = useLocationStore();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [latitude, setLatitude] = useState(currentLocation?.latitude || 0);
  const [longitude, setLongitude] = useState(currentLocation?.longitude || 0);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [triggerOn, setTriggerOn] = useState<TriggerOn>('enter');
  const [cooldownMinutes, setCooldownMinutes] = useState(30);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    message?: string;
    location?: string;
  }>({});

  useEffect(() => {
    // Get current location if not available
    if (!currentLocation) {
      locationService.getCurrentLocation();
    }
  }, []);

  useEffect(() => {
    // Set initial map location
    if (currentLocation && latitude === 0 && longitude === 0) {
      setLatitude(currentLocation.latitude);
      setLongitude(currentLocation.longitude);
    }
  }, [currentLocation]);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length > 50) {
      errors.name = 'Name must be 50 characters or less';
    }

    if (!message.trim()) {
      errors.message = 'Message is required';
    } else if (message.length > 500) {
      errors.message = 'Message must be 500 characters or less';
    }

    if (latitude === 0 && longitude === 0) {
      errors.location = 'Please select a location on the map';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createGeofence({
        name: name.trim(),
        latitude,
        longitude,
        radiusMeters,
        message: message.trim(),
        phoneNumber: user?.phoneNumber || '',
        triggerOn,
        cooldownMinutes,
      });

      // Update native geofencing
      const { geofences, isTracking } = useLocationStore.getState();
      if (isTracking) {
        await locationService.startGeofencing(geofences);
      }

      router.back();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
    setValidationErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleUseCurrentLocation = async () => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
      setValidationErrors((prev) => ({ ...prev, location: undefined }));

      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const triggerOptions: { value: TriggerOn; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'enter', label: 'On Arrive', icon: 'enter-outline' },
    { value: 'exit', label: 'On Leave', icon: 'exit-outline' },
    { value: 'both', label: 'Both', icon: 'swap-horizontal-outline' },
  ];

  const initialRegion: Region = {
    latitude: latitude || currentLocation?.latitude || 37.78825,
    longitude: longitude || currentLocation?.longitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h4">New Location Reminder</Typography>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <Alert
              variant="error"
              message={error}
              onDismiss={clearError}
              style={styles.alert}
            />
          )}

          <Input
            label="Location Name"
            placeholder="e.g., Home, Office, Gym"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setValidationErrors((prev) => ({ ...prev, name: undefined }));
            }}
            leftIcon="location-outline"
            error={validationErrors.name}
            maxLength={50}
            required
          />

          <Input
            label="Reminder Message"
            placeholder="What should I remind you when you arrive/leave?"
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setValidationErrors((prev) => ({ ...prev, message: undefined }));
            }}
            leftIcon="chatbubble-outline"
            error={validationErrors.message}
            multiline
            numberOfLines={3}
            maxLength={500}
            style={styles.messageInput}
            required
          />

          {/* Map Section */}
          <Typography variant="label" style={styles.sectionLabel}>
            Select Location
          </Typography>

          <Card variant="outlined" padding="none" style={styles.mapCard}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegion}
              onPress={handleMapPress}
              showsUserLocation
            >
              {latitude !== 0 && longitude !== 0 && (
                <>
                  <Circle
                    center={{ latitude, longitude }}
                    radius={radiusMeters}
                    fillColor="rgba(59, 130, 246, 0.2)"
                    strokeColor={colors.primary[500]}
                    strokeWidth={2}
                  />
                  <Marker coordinate={{ latitude, longitude }} draggable onDragEnd={handleMapPress}>
                    <View style={styles.markerContainer}>
                      <Ionicons name="location" size={32} color={colors.primary[600]} />
                    </View>
                  </Marker>
                </>
              )}
            </MapView>

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="locate" size={20} color={colors.primary[600]} />
            </TouchableOpacity>
          </Card>

          {validationErrors.location && (
            <Typography variant="bodySmall" color={colors.error.main} style={styles.locationError}>
              {validationErrors.location}
            </Typography>
          )}

          <Typography variant="caption" color={colors.text.tertiary} style={styles.mapHint}>
            Tap on the map or drag the marker to set the location
          </Typography>

          {/* Radius Slider */}
          <Typography variant="label" style={styles.sectionLabel}>
            Radius: {radiusMeters}m
          </Typography>

          <View style={styles.sliderContainer}>
            <Typography variant="caption" color={colors.text.tertiary}>50m</Typography>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={1000}
              step={10}
              value={radiusMeters}
              onValueChange={setRadiusMeters}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.gray[300]}
              thumbTintColor={colors.primary[600]}
            />
            <Typography variant="caption" color={colors.text.tertiary}>1km</Typography>
          </View>

          {/* Trigger Option */}
          <Typography variant="label" style={styles.sectionLabel}>
            Trigger When
          </Typography>

          <View style={styles.triggerOptions}>
            {triggerOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.triggerOption,
                  triggerOn === option.value && styles.triggerOptionActive,
                ]}
                onPress={() => setTriggerOn(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={triggerOn === option.value ? colors.primary[600] : colors.text.tertiary}
                />
                <Typography
                  variant="bodySmall"
                  color={triggerOn === option.value ? colors.primary[600] : colors.text.secondary}
                >
                  {option.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cooldown */}
          <Typography variant="label" style={styles.sectionLabel}>
            Cooldown: {cooldownMinutes} minutes
          </Typography>

          <View style={styles.sliderContainer}>
            <Typography variant="caption" color={colors.text.tertiary}>5m</Typography>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={120}
              step={5}
              value={cooldownMinutes}
              onValueChange={setCooldownMinutes}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.gray[300]}
              thumbTintColor={colors.primary[600]}
            />
            <Typography variant="caption" color={colors.text.tertiary}>2h</Typography>
          </View>

          <Typography variant="caption" color={colors.text.tertiary} style={styles.cooldownHint}>
            Minimum time between repeated triggers
          </Typography>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={colors.info.main} />
            <Typography variant="bodySmall" color={colors.text.secondary} style={styles.infoText}>
              Background location access is required for geofencing to work when the app is closed
            </Typography>
          </View>

          <Button
            title={isLoading ? 'Creating...' : 'Create Location Reminder'}
            variant="gradient"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            onPress={handleCreate}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  alert: {
    marginBottom: spacing[4],
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  mapCard: {
    height: 220,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    right: spacing[3],
    bottom: spacing[3],
    backgroundColor: colors.white,
    padding: spacing[2],
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationError: {
    marginTop: spacing[1],
  },
  mapHint: {
    marginTop: spacing[1],
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing[2],
  },
  triggerOptions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  triggerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  triggerOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  cooldownHint: {
    marginTop: spacing[1],
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info.light,
    padding: spacing[4],
    borderRadius: 8,
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
  infoText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  submitButton: {
    marginTop: spacing[2],
  },
});

export default CreateGeofenceScreen;
