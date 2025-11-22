import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isPast } from 'date-fns';

import {
  Card,
  Typography,
  Button,
  StatusBadge,
  Loading,
  Alert,
} from '../../src/components';
import { useReminderStore } from '../../src/store';
import { colors, spacing } from '../../src/theme';
import { Reminder } from '../../src/types';

export default function ReminderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, deleteReminder, isLoading, error, clearError } = useReminderStore();

  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    const found = reminders.find((r) => r.id === id);
    setReminder(found || null);
  }, [id, reminders]);

  const handleDelete = () => {
    RNAlert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteReminder(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const getStatus = () => {
    if (!reminder) return null;

    if (reminder.sent) {
      return { label: 'Sent', variant: 'success' as const, icon: 'checkmark-circle' as const };
    }
    if (isPast(new Date(reminder.scheduledFor))) {
      return { label: 'Pending Delivery', variant: 'warning' as const, icon: 'time' as const };
    }
    return { label: 'Scheduled', variant: 'neutral' as const, icon: 'calendar' as const };
  };

  if (!reminder) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading fullScreen message="Loading reminder..." />
      </SafeAreaView>
    );
  }

  const status = getStatus();
  const scheduledDate = new Date(reminder.scheduledFor);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h4">Reminder Details</Typography>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color={colors.error.main} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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

        {/* Status Card */}
        <Card variant="elevated" padding="lg" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={32} color={colors.primary[500]} />
            </View>
            {status && (
              <StatusBadge
                label={status.label}
                variant={status.variant}
                icon={status.icon}
              />
            )}
          </View>

          <Typography variant="h3" style={styles.title}>
            {reminder.title}
          </Typography>

          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />
              <Typography variant="body" color={colors.text.secondary}>
                {format(scheduledDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
              <Typography variant="body" color={colors.text.secondary}>
                {format(scheduledDate, 'h:mm a')}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Message Card */}
        <Typography variant="label" style={styles.sectionLabel}>
          Message
        </Typography>
        <Card variant="outlined" padding="md" style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp.main} />
            <Typography variant="bodySmall" color={colors.text.tertiary}>
              WhatsApp Message
            </Typography>
          </View>
          <Typography variant="body" style={styles.message}>
            {reminder.message}
          </Typography>
        </Card>

        {/* Info Card */}
        <Typography variant="label" style={styles.sectionLabel}>
          Information
        </Typography>
        <Card variant="outlined" padding="none" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Typography variant="bodySmall" color={colors.text.tertiary}>
              Created
            </Typography>
            <Typography variant="bodySmall">
              {format(new Date(reminder.createdAt), 'MMM d, yyyy h:mm a')}
            </Typography>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Typography variant="bodySmall" color={colors.text.tertiary}>
              Status
            </Typography>
            <Typography variant="bodySmall">
              {reminder.sent ? 'Delivered' : 'Pending'}
            </Typography>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Typography variant="bodySmall" color={colors.text.tertiary}>
              Reminder ID
            </Typography>
            <Typography variant="caption" color={colors.text.tertiary}>
              {reminder.id.substring(0, 8)}...
            </Typography>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!reminder.sent && (
            <Button
              title="Edit Reminder"
              variant="outline"
              size="lg"
              fullWidth
              icon={<Ionicons name="pencil-outline" size={20} color={colors.primary[600]} />}
              onPress={() => {}}
              style={styles.editButton}
            />
          )}

          <Button
            title="Delete Reminder"
            variant="danger"
            size="lg"
            fullWidth
            icon={<Ionicons name="trash-outline" size={20} color={colors.white} />}
            onPress={handleDelete}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  deleteButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  alert: {
    marginBottom: spacing[4],
  },
  statusCard: {
    marginBottom: spacing[6],
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing[4],
  },
  dateTimeSection: {
    gap: spacing[2],
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  messageCard: {
    marginBottom: spacing[6],
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  message: {
    lineHeight: 24,
  },
  infoCard: {
    marginBottom: spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  actions: {
    gap: spacing[3],
  },
  editButton: {
    marginBottom: spacing[0],
  },
});
