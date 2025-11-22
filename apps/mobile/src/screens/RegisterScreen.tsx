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

export function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    // Phone number validation (E.164 format)
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Use international format (e.g., +1234567890)';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
      });
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleLogin = () => {
    router.back();
  };

  const clearFieldError = (field: keyof typeof validationErrors) => {
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
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
            <TouchableOpacity onPress={handleLogin} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Ionicons name="person-add" size={40} color={colors.white} />
            <Typography variant="h3" color={colors.white} style={styles.title}>
              Create Account
            </Typography>
            <Typography variant="bodySmall" color="rgba(255,255,255,0.8)" align="center">
              Get started with WhatsApp reminders
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
                clearFieldError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={validationErrors.email}
              required
            />

            <Input
              label="WhatsApp Phone Number"
              placeholder="+1234567890"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                clearFieldError('phoneNumber');
              }}
              keyboardType="phone-pad"
              leftIcon="logo-whatsapp"
              error={validationErrors.phoneNumber}
              hint="International format with country code"
              required
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError('password');
              }}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={validationErrors.password}
              hint="At least 8 characters with uppercase and number"
              required
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={validationErrors.confirmPassword}
              required
            />

            <Button
              title={isLoading ? 'Creating account...' : 'Create Account'}
              variant="gradient"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              onPress={handleRegister}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Typography variant="bodySmall" color={colors.text.secondary}>
                Already have an account?{' '}
              </Typography>
              <TouchableOpacity onPress={handleLogin}>
                <Typography variant="bodySmall" color={colors.primary[600]}>
                  Sign in
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
    paddingBottom: spacing[6],
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing[4],
    paddingHorizontal: spacing[6],
  },
  backButton: {
    position: 'absolute',
    left: spacing[4],
    top: spacing[4],
    padding: spacing[2],
  },
  title: {
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  formContainer: {
    flex: 1,
    marginTop: -spacing[4],
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

export default RegisterScreen;
