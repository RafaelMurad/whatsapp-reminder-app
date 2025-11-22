import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

import {
  Card,
  Typography,
  StatusBadge,
  Loading,
  Alert,
  Button,
} from '../components';
import { useReminderStore, useAuthStore } from '../store';
import { colors, spacing, gradients } from '../theme';
import { Reminder } from '../types';

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    reminders,
    isLoading,
    error,
    fetchReminders,
    clearError,
  } = useReminderStore();

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAddReminder = () => {
    router.push('/create-reminder');
  };

  const handleReminderPress = (reminder: Reminder) => {
    router.push({
      pathname: '/reminder/[id]',
      params: { id: reminder.id },
    });
  };

  const getTimeLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const getReminderStatus = (reminder: Reminder): {
    label: string;
    variant: 'success' | 'warning' | 'neutral';
    icon: keyof typeof Ionicons.glyphMap;
  } => {
    if (reminder.sent) {
      return { label: 'Sent', variant: 'success', icon: 'checkmark-circle' };
    }
    if (isPast(new Date(reminder.scheduledFor))) {
      return { label: 'Pending', variant: 'warning', icon: 'time' };
    }
    return { label: 'Scheduled', variant: 'neutral', icon: 'calendar' };
  };

  const renderReminder = ({ item }: { item: Reminder }) => {
    const status = getReminderStatus(item);
    const scheduledDate = new Date(item.scheduledFor);

    return (
      <Card
        variant="elevated"
        padding="md"
        style={styles.reminderCard}
        onPress={() => handleReminderPress(item)}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderTitleRow}>
            <Ionicons
              name="notifications"
              size={20}
              color={colors.primary[500]}
            />
            <Typography variant="h4" style={styles.reminderTitle} numberOfLines={1}>
              {item.title}
            </Typography>
          </View>
          <StatusBadge
            label={status.label}
            variant={status.variant}
            icon={status.icon}
            size="sm"
          />
        </View>

        <Typography
          variant="bodySmall"
          color={colors.text.secondary}
          numberOfLines={2}
          style={styles.reminderMessage}
        >
          {item.message}
        </Typography>

        <View style={styles.reminderFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Typography variant="caption" color={colors.text.tertiary}>
              {getTimeLabel(item.scheduledFor)} at {format(scheduledDate, 'h:mm a')}
            </Typography>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={colors.gray[300]} />
      <Typography variant="h4" color={colors.text.secondary} style={styles.emptyTitle}>
        No reminders yet
      </Typography>
      <Typography variant="bodySmall" color={colors.text.tertiary} align="center">
        Create your first reminder and never forget important moments
      </Typography>
      <Button
        title="Create Reminder"
        variant="primary"
        icon={<Ionicons name="add" size={20} color={colors.white} />}
        onPress={handleAddReminder}
        style={styles.emptyButton}
      />
    </View>
  );

  const upcomingReminders = reminders.filter(
    (r) => !r.sent && new Date(r.scheduledFor) > new Date()
  );
  const pastReminders = reminders.filter(
    (r) => r.sent || new Date(r.scheduledFor) <= new Date()
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
              <Typography variant="bodySmall" color="rgba(255,255,255,0.8)">
                Welcome back,
              </Typography>
              <Typography variant="h3" color={colors.white}>
                {user?.email?.split('@')[0] || 'User'}
              </Typography>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person-circle" size={40} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Typography variant="h2" color={colors.white}>
                {upcomingReminders.length}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Upcoming
              </Typography>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Typography variant="h2" color={colors.white}>
                {pastReminders.length}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Completed
              </Typography>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {error && (
          <Alert
            variant="error"
            message={error}
            onDismiss={clearError}
            style={styles.alert}
          />
        )}

        {isLoading && reminders.length === 0 ? (
          <Loading message="Loading reminders..." />
        ) : (
          <FlatList
            data={reminders}
            renderItem={renderReminder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              reminders.length === 0 && styles.listEmpty,
            ]}
            ListEmptyComponent={renderEmpty}
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

      {reminders.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddReminder}
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
    paddingBottom: spacing[6],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  profileButton: {
    padding: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
    paddingHorizontal: spacing[8],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
    marginTop: -spacing[3],
  },
  alert: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  listEmpty: {
    flex: 1,
  },
  reminderCard: {
    marginBottom: spacing[3],
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing[2],
  },
  reminderTitle: {
    marginLeft: spacing[2],
    flex: 1,
  },
  reminderMessage: {
    marginBottom: spacing[3],
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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

export default HomeScreen;
