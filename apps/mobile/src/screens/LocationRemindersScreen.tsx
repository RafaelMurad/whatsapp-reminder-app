import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle } from 'react-native-maps';

import {
  Card,
  Typography,
  StatusBadge,
  Loading,
  Alert,
  Button,
} from '../components';
import { useLocationStore, useAuthStore } from '../store';
import { locationService } from '../services';
import { colors, spacing, gradients } from '../theme';
import { Geofence } from '../types';

export function LocationRemindersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    geofences,
    currentLocation,
    isLoading,
    error,
    locationPermission,
    backgroundPermission,
    isTracking,
    fetchGeofences,
    deleteGeofence,
    clearError,
  } = useLocationStore();

  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);

  useEffect(() => {
    initializeLocation();
    fetchGeofences();
  }, []);

  const initializeLocation = async () => {
    await locationService.checkPermissions();
    await locationService.getCurrentLocation();
  };

  const handleRefresh = useCallback(async () => {
    await fetchGeofences();
    await locationService.getCurrentLocation();
  }, [fetchGeofences]);

  const handleRequestPermission = async () => {
    const foreground = await locationService.requestForegroundPermission();
    if (foreground) {
      await locationService.requestBackgroundPermission();
    }
  };

  const handleToggleTracking = async () => {
    if (isTracking) {
      await locationService.stopBackgroundTracking();
      await locationService.stopGeofencing();
    } else {
      const started = await locationService.startBackgroundTracking();
      if (started && geofences.length > 0) {
        await locationService.startGeofencing(geofences);
      }
    }
  };

  const handleAddGeofence = () => {
    router.push('/create-geofence');
  };

  const handleDeleteGeofence = (geofence: Geofence) => {
    RNAlert.alert(
      'Delete Location Reminder',
      `Are you sure you want to delete "${geofence.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGeofence(geofence.id);
            // Refresh native geofences
            if (isTracking) {
              const remaining = geofences.filter((g) => g.id !== geofence.id);
              await locationService.startGeofencing(remaining);
            }
          },
        },
      ]
    );
  };

  const getDistanceText = (geofence: Geofence): string => {
    if (!currentLocation) return 'Unknown distance';
    const distance = locationService.calculateDistanceToGeofence(currentLocation, geofence);
    return locationService.formatDistance(distance);
  };

  const renderPermissionBanner = () => {
    if (locationPermission === 'granted' && backgroundPermission === 'granted') {
      return null;
    }

    return (
      <Alert
        variant="warning"
        title="Location Permission Required"
        message="Enable location access to use location-based reminders. Background access is needed for geofencing."
        action={{
          label: 'Grant Permission',
          onPress: handleRequestPermission,
        }}
        style={styles.permissionBanner}
      />
    );
  };

  const renderGeofence = ({ item }: { item: Geofence }) => {
    const isSelected = selectedGeofence?.id === item.id;
    const distance = getDistanceText(item);
    const isInside = currentLocation
      ? locationService.isInsideGeofence(currentLocation, item)
      : false;

    return (
      <Card
        variant={isSelected ? 'outlined' : 'elevated'}
        padding="md"
        style={[styles.geofenceCard, isSelected && styles.selectedCard]}
        onPress={() => setSelectedGeofence(isSelected ? null : item)}
      >
        <View style={styles.geofenceHeader}>
          <View style={styles.geofenceInfo}>
            <View style={styles.geofenceNameRow}>
              <Ionicons
                name="location"
                size={20}
                color={item.enabled ? colors.primary[500] : colors.gray[400]}
              />
              <Typography variant="h4" style={styles.geofenceName} numberOfLines={1}>
                {item.name}
              </Typography>
            </View>
            <Typography variant="caption" color={colors.text.tertiary}>
              {distance} away • Radius: {item.radiusMeters}m
            </Typography>
          </View>

          <View style={styles.geofenceBadges}>
            {isInside && (
              <StatusBadge label="Inside" variant="success" icon="checkmark-circle" size="sm" />
            )}
            <StatusBadge
              label={
                item.triggerOn === 'enter'
                  ? 'On Enter'
                  : item.triggerOn === 'exit'
                  ? 'On Exit'
                  : 'Both'
              }
              variant="info"
              size="sm"
            />
          </View>
        </View>

        <Typography
          variant="bodySmall"
          color={colors.text.secondary}
          numberOfLines={2}
          style={styles.geofenceMessage}
        >
          {item.message}
        </Typography>

        {isSelected && (
          <View style={styles.geofenceActions}>
            <Button
              title="Delete"
              variant="danger"
              size="sm"
              icon={<Ionicons name="trash-outline" size={16} color={colors.white} />}
              onPress={() => handleDeleteGeofence(item)}
            />
          </View>
        )}
      </Card>
    );
  };

  const renderMap = () => {
    if (!currentLocation && geofences.length === 0) return null;

    const initialRegion = currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : {
          latitude: geofences[0].latitude,
          longitude: geofences[0].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };

    return (
      <Card variant="elevated" padding="none" style={styles.mapCard}>
        <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
          {geofences.map((geofence) => (
            <React.Fragment key={geofence.id}>
              <Circle
                center={{
                  latitude: geofence.latitude,
                  longitude: geofence.longitude,
                }}
                radius={geofence.radiusMeters}
                fillColor={
                  selectedGeofence?.id === geofence.id
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(59, 130, 246, 0.15)'
                }
                strokeColor={colors.primary[500]}
                strokeWidth={2}
              />
              <Marker
                coordinate={{
                  latitude: geofence.latitude,
                  longitude: geofence.longitude,
                }}
                title={geofence.name}
                description={geofence.message}
                onPress={() => setSelectedGeofence(geofence)}
              />
            </React.Fragment>
          ))}
        </MapView>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color={colors.gray[300]} />
      <Typography variant="h4" color={colors.text.secondary} style={styles.emptyTitle}>
        No location reminders
      </Typography>
      <Typography variant="bodySmall" color={colors.text.tertiary} align="center">
        Create location-based reminders that trigger when you arrive or leave places
      </Typography>
      <Button
        title="Add Location Reminder"
        variant="primary"
        icon={<Ionicons name="add" size={20} color={colors.white} />}
        onPress={handleAddGeofence}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Typography variant="h3" color={colors.white}>
                Location Reminders
              </Typography>
              <Typography variant="bodySmall" color="rgba(255,255,255,0.8)">
                {geofences.length} location{geofences.length !== 1 ? 's' : ''} configured
              </Typography>
            </View>

            <TouchableOpacity
              style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
              onPress={handleToggleTracking}
            >
              <Ionicons
                name={isTracking ? 'navigate' : 'navigate-outline'}
                size={20}
                color={isTracking ? colors.primary[600] : colors.white}
              />
              <Typography
                variant="caption"
                color={isTracking ? colors.primary[600] : colors.white}
              >
                {isTracking ? 'Tracking' : 'Track'}
              </Typography>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {renderPermissionBanner()}

        {error && (
          <Alert
            variant="error"
            message={error}
            onDismiss={clearError}
            style={styles.alert}
          />
        )}

        {isLoading && geofences.length === 0 ? (
          <Loading message="Loading locations..." />
        ) : (
          <FlatList
            data={geofences}
            renderItem={renderGeofence}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={geofences.length > 0 ? renderMap : null}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[
              styles.listContent,
              geofences.length === 0 && styles.listEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
                tintColor={colors.primary[500]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {geofences.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddGeofence}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingBottom: spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
  },
  trackingButtonActive: {
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  permissionBanner: {
    margin: spacing[4],
  },
  alert: {
    marginHorizontal: spacing[4],
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  listEmpty: {
    flex: 1,
  },
  mapCard: {
    height: 200,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  geofenceCard: {
    marginBottom: spacing[3],
  },
  selectedCard: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  geofenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  geofenceInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  geofenceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  geofenceName: {
    marginLeft: spacing[2],
    flex: 1,
  },
  geofenceBadges: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  geofenceMessage: {
    marginBottom: spacing[2],
  },
  geofenceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  emptyTitle: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyButton: {
    marginTop: spacing[6],
  },
  fab: {
    position: 'absolute',
    right: spacing[5],
    bottom: spacing[5],
    borderRadius: 28,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocationRemindersScreen;
