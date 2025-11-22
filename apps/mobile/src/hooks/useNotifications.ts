/**
 * Notification Hook
 * Provides notification handling with automatic cleanup
 */

import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { notificationService } from '../services';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notifications
    notificationService.requestPermissions();

    // Handle notifications received while app is foregrounded
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Handle user tapping on notification
    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === 'reminder' && data?.reminderId) {
          // Navigate to reminder detail
          router.push({
            pathname: '/reminder/[id]',
            params: { id: data.reminderId as string },
          });
        } else if (data?.type === 'geofence') {
          // Navigate to locations tab
          router.push('/(tabs)/locations');
        }
      }
    );

    // Clear badge on app open
    notificationService.clearBadge();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  const scheduleNotification = useCallback(
    async (title: string, body: string, date: Date) => {
      return notificationService.scheduleReminderNotification({
        id: Date.now().toString(),
        userId: '',
        title,
        message: body,
        scheduledFor: date.toISOString(),
        sent: false,
        createdAt: new Date().toISOString(),
      });
    },
    []
  );

  const showInstant = useCallback(async (title: string, body: string) => {
    return notificationService.showInstantNotification(title, body);
  }, []);

  return {
    scheduleNotification,
    showInstant,
    requestPermissions: notificationService.requestPermissions.bind(notificationService),
    clearBadge: notificationService.clearBadge.bind(notificationService),
  };
}

export default useNotifications;
