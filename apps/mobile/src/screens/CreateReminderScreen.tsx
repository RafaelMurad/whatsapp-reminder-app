import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addHours } from 'date-fns';

import { Button, Input, Typography, Alert, Card } from '../components';
import { useReminderStore } from '../store';
import { colors, spacing } from '../theme';

export function CreateReminderScreen() {
  const router = useRouter();
  const { createReminder, isLoading, error, clearError } = useReminderStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState(addHours(new Date(), 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    message?: string;
    scheduledFor?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (!message.trim()) {
      errors.message = 'Message is required';
    } else if (message.length > 500) {
      errors.message = 'Message must be 500 characters or less';
    }

    if (scheduledFor <= new Date()) {
      errors.scheduledFor = 'Scheduled time must be in the future';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createReminder({
        title: title.trim(),
        message: message.trim(),
        scheduledFor: scheduledFor.toISOString(),
      });
      router.back();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(scheduledFor);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduledFor(newDate);
      setValidationErrors((prev) => ({ ...prev, scheduledFor: undefined }));
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledFor);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledFor(newDate);
      setValidationErrors((prev) => ({ ...prev, scheduledFor: undefined }));
    }
  };

  // Quick time presets
  const presets = [
    { label: 'In 30 min', minutes: 30 },
    { label: 'In 1 hour', minutes: 60 },
    { label: 'In 3 hours', minutes: 180 },
    { label: 'Tomorrow', minutes: 24 * 60 },
  ];

  const applyPreset = (minutes: number) => {
    const newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + minutes);
    setScheduledFor(newDate);
    setValidationErrors((prev) => ({ ...prev, scheduledFor: undefined }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h4">New Reminder</Typography>
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
            label="Title"
            placeholder="What should I remind you about?"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setValidationErrors((prev) => ({ ...prev, title: undefined }));
            }}
            leftIcon="text"
            error={validationErrors.title}
            maxLength={100}
            required
          />

          <Input
            label="Message"
            placeholder="Enter the reminder message to send via WhatsApp"
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setValidationErrors((prev) => ({ ...prev, message: undefined }));
            }}
            leftIcon="chatbubble-outline"
            error={validationErrors.message}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.messageInput}
            required
          />

          <Typography variant="label" style={styles.sectionLabel}>
            When should I remind you?
          </Typography>

          {/* Quick presets */}
          <View style={styles.presetsContainer}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetButton}
                onPress={() => applyPreset(preset.minutes)}
              >
                <Typography variant="bodySmall" color={colors.primary[600]}>
                  {preset.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date/Time picker cards */}
          <Card variant="outlined" padding="none" style={styles.dateTimeCard}>
            <TouchableOpacity
              style={styles.dateTimeRow}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeLeft}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary[500]} />
                <Typography variant="body" style={styles.dateTimeLabel}>
                  Date
                </Typography>
              </View>
              <View style={styles.dateTimeRight}>
                <Typography variant="body" color={colors.text.secondary}>
                  {format(scheduledFor, 'EEEE, MMM d, yyyy')}
                </Typography>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.dateTimeRow}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeLeft}>
                <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
                <Typography variant="body" style={styles.dateTimeLabel}>
                  Time
                </Typography>
              </View>
              <View style={styles.dateTimeRight}>
                <Typography variant="body" color={colors.text.secondary}>
                  {format(scheduledFor, 'h:mm a')}
                </Typography>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>
          </Card>

          {validationErrors.scheduledFor && (
            <Typography variant="bodySmall" color={colors.error.main} style={styles.dateError}>
              {validationErrors.scheduledFor}
            </Typography>
          )}

          {/* Date/Time pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={scheduledFor}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledFor}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.infoBox}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp.main} />
            <Typography variant="bodySmall" color={colors.text.secondary} style={styles.infoText}>
              This reminder will be sent to your WhatsApp at the scheduled time
            </Typography>
          </View>

          <Button
            title={isLoading ? 'Creating...' : 'Create Reminder'}
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
    height: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    marginBottom: spacing[3],
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  presetButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  dateTimeCard: {
    marginBottom: spacing[2],
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  dateTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeLabel: {
    marginLeft: spacing[3],
  },
  dateTimeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[4],
  },
  dateError: {
    marginBottom: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing[4],
    borderRadius: 8,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  infoText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  submitButton: {
    marginTop: spacing[2],
  },
});

export default CreateReminderScreen;
