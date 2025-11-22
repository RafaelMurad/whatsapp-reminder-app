/**
 * Push Notification Service
 * Handles local and push notifications using Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Reminder, Geofence } from '../types';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  // ==================== Permission Management ====================

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications');
      return false;
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await this.setupAndroidChannel();
    }

    return true;
  }

  private async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    await Notifications.setNotificationChannelAsync('location', {
      name: 'Location Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22C55E',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });
  }

  // ==================== Push Token Management ====================

  async getExpoPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    if (!Device.isDevice) {
      return null;
    }

    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Update with your Expo project ID
      });
      this.expoPushToken = token;
      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // ==================== Local Notifications ====================

  async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    const scheduledTime = new Date(reminder.scheduledFor);

    // Don't schedule if in the past
    if (scheduledTime <= new Date()) {
      return null;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${reminder.title}`,
          body: reminder.message,
          data: {
            type: 'reminder',
            reminderId: reminder.id,
          },
          sound: true,
          badge: 1,
        },
        trigger: {
          date: scheduledTime,
          channelId: 'reminders',
        },
      });

      console.log(`Scheduled notification ${identifier} for reminder ${reminder.id}`);
      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelReminderNotification(reminderId: string): Promise<void> {
    // Get all scheduled notifications and cancel the one for this reminder
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.reminderId === reminderId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification for reminder ${reminderId}`);
      }
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // ==================== Geofence Notifications ====================

  async showGeofenceNotification(
    geofence: Geofence,
    event: 'enter' | 'exit'
  ): Promise<void> {
    const eventText = event === 'enter' ? 'arrived at' : 'left';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📍 Location Reminder`,
        body: `You ${eventText} ${geofence.name}: ${geofence.message}`,
        data: {
          type: 'geofence',
          geofenceId: geofence.id,
          event,
        },
        sound: true,
        badge: 1,
      },
      trigger: null, // Immediate
    });
  }

  // ==================== Instant Notifications ====================

  async showInstantNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  // ==================== Badge Management ====================

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // ==================== Notification Listeners ====================

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // ==================== Utility ====================

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
