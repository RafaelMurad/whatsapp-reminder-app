import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { Card, Typography, Button } from '../components';
import { useAuthStore, useReminderStore, useLocationStore } from '../store';
import { colors, spacing, gradients } from '../theme';

export function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { reminders } = useReminderStore();
  const { geofences, isTracking } = useLocationStore();

  const handleLogout = () => {
    RNAlert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const stats = [
    {
      label: 'Total Reminders',
      value: reminders.length,
      icon: 'notifications-outline' as const,
    },
    {
      label: 'Sent',
      value: reminders.filter((r) => r.sent).length,
      icon: 'checkmark-done-outline' as const,
    },
    {
      label: 'Location Reminders',
      value: geofences.length,
      icon: 'location-outline' as const,
    },
  ];

  const menuItems = [
    {
      title: 'Notification Settings',
      icon: 'notifications-outline' as const,
      onPress: () => {},
    },
    {
      title: 'Location Settings',
      icon: 'location-outline' as const,
      subtitle: isTracking ? 'Background tracking enabled' : 'Background tracking disabled',
      onPress: () => router.push('/(tabs)/locations'),
    },
    {
      title: 'WhatsApp Connection',
      icon: 'logo-whatsapp' as const,
      subtitle: 'Connected',
      onPress: () => {},
    },
    {
      title: 'Privacy & Security',
      icon: 'shield-checkmark-outline' as const,
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: () => {},
    },
    {
      title: 'About',
      icon: 'information-circle-outline' as const,
      subtitle: 'Version 1.0.0',
      onPress: () => {},
    },
  ];

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
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={colors.primary[600]} />
            </View>
            <Typography variant="h3" color={colors.white} style={styles.userName}>
              {user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="bodySmall" color="rgba(255,255,255,0.8)">
              {user?.email}
            </Typography>
            {user?.createdAt && (
              <Typography variant="caption" color="rgba(255,255,255,0.6)" style={styles.memberSince}>
                Member since {format(new Date(user.createdAt), 'MMM yyyy')}
              </Typography>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <Card variant="elevated" padding="md" style={styles.statsCard}>
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon} size={20} color={colors.primary[500]} />
                  </View>
                  <Typography variant="h3" color={colors.text.primary}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color={colors.text.tertiary}>
                    {stat.label}
                  </Typography>
                </View>
                {index < stats.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Account Info */}
        <Typography variant="label" style={styles.sectionTitle}>
          Account
        </Typography>

        <Card variant="elevated" padding="none" style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="mail-outline" size={20} color={colors.primary[500]} />
              </View>
              <View>
                <Typography variant="body">Email</Typography>
                <Typography variant="caption" color={colors.text.tertiary}>
                  {user?.email}
                </Typography>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.whatsapp.main + '20' }]}>
                <Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp.main} />
              </View>
              <View>
                <Typography variant="body">WhatsApp Number</Typography>
                <Typography variant="caption" color={colors.text.tertiary}>
                  {user?.phoneNumber}
                </Typography>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Settings Menu */}
        <Typography variant="label" style={styles.sectionTitle}>
          Settings
        </Typography>

        <Card variant="elevated" padding="none" style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={20} color={colors.gray[600]} />
                  </View>
                  <View>
                    <Typography variant="body">{item.title}</Typography>
                    {item.subtitle && (
                      <Typography variant="caption" color={colors.text.tertiary}>
                        {item.subtitle}
                      </Typography>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          variant="outline"
          size="lg"
          fullWidth
          icon={<Ionicons name="log-out-outline" size={20} color={colors.error.main} />}
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={{ color: colors.error.main }}
        />

        <Typography variant="caption" color={colors.text.tertiary} align="center" style={styles.version}>
          WhatsApp Reminders v1.0.0
        </Typography>
      </ScrollView>
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
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingHorizontal: spacing[6],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  userName: {
    marginBottom: spacing[1],
  },
  memberSince: {
    marginTop: spacing[2],
  },
  content: {
    flex: 1,
    marginTop: -spacing[3],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  statsCard: {
    marginBottom: spacing[6],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.light,
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  menuCard: {
    marginBottom: spacing[4],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  logoutButton: {
    marginTop: spacing[4],
    borderColor: colors.error.main,
  },
  version: {
    marginTop: spacing[6],
  },
});

export default ProfileScreen;
