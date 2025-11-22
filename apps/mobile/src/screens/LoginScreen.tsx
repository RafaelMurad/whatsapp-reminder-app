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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button, Input, Typography, Alert } from '../components';
import { useAuthStore } from '../store';
import { colors, spacing, gradients } from '../theme';

export function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

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
            <Ionicons name="notifications" size={48} color={colors.white} />
            <Typography variant="h2" color={colors.white} style={styles.title}>
              WhatsApp Reminders
            </Typography>
            <Typography variant="body" color="rgba(255,255,255,0.8)" align="center">
              Never miss an important moment
            </Typography>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Typography variant="h3" style={styles.formTitle}>
              Welcome Back
            </Typography>
            <Typography variant="bodySmall" color={colors.text.secondary} style={styles.formSubtitle}>
              Sign in to manage your reminders
            </Typography>

            {error && (
              <Alert
                variant="error"
                message={error}
                onDismiss={clearError}
                style={styles.alert}
              />
            )}

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={validationErrors.email}
              required
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={validationErrors.password}
              required
            />

            <Button
              title={isLoading ? 'Signing in...' : 'Sign In'}
              variant="gradient"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Typography variant="bodySmall" color={colors.text.secondary}>
                Don't have an account?{' '}
              </Typography>
              <TouchableOpacity onPress={handleRegister}>
                <Typography variant="bodySmall" color={colors.primary[600]}>
                  Sign up
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingBottom: spacing[8],
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing[8],
    paddingHorizontal: spacing[6],
  },
  title: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  formContainer: {
    flex: 1,
    marginTop: -spacing[6],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  formCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing[6],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    marginBottom: spacing[1],
  },
  formSubtitle: {
    marginBottom: spacing[6],
  },
  alert: {
    marginBottom: spacing[4],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
});

export default LoginScreen;
