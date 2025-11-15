import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@repo/api";

/**
 * Field-specific error mapping for auth forms
 */
export interface FieldErrors {
  [key: string]: string | undefined;
  email?: string;
  password?: string;
  phoneNumber?: string;
  general?: string;
}

/**
 * Parses tRPC authentication errors and maps them to specific form fields
 *
 * @param error - The tRPC error from mutation
 * @param availableFields - Array of field names available in the form
 * @returns Object with field-specific error messages
 *
 * @example
 * // In login form (email + password)
 * const errors = parseAuthError(error, ['email', 'password']);
 * // Returns: { general: "Invalid email or password" }
 *
 * @example
 * // In register form (email + password + phoneNumber)
 * const errors = parseAuthError(error, ['email', 'password', 'phoneNumber']);
 * // Returns: { email: "This email is already registered" }
 */
export function parseAuthError(
  error: TRPCClientError<AppRouter>,
  availableFields: string[] = []
): FieldErrors {
  const errors: FieldErrors = {};
  const message = error.message.toLowerCase();

  // Email-related errors
  if (message.includes("email")) {
    if (message.includes("already") || message.includes("in use")) {
      errors.email = "This email is already registered";
    } else if (message.includes("invalid")) {
      errors.email = "Invalid email address";
    } else {
      errors.email = error.message;
    }
    return errors;
  }

  // Password-related errors
  if (message.includes("password") && !message.includes("credentials")) {
    errors.password = error.message;
    return errors;
  }

  // Phone number errors (if available in form)
  if (
    message.includes("phone") &&
    availableFields.includes("phoneNumber")
  ) {
    errors.phoneNumber = error.message;
    return errors;
  }

  // Invalid credentials (login-specific)
  if (
    message.includes("invalid credentials") ||
    message.includes("unauthorized")
  ) {
    errors.general = "Invalid email or password";
    return errors;
  }

  // Network, server, or unknown errors
  errors.general = error.message;
  return errors;
}

/**
 * User-friendly error messages for common auth errors
 */
export const AUTH_ERROR_MESSAGES = {
  EMAIL_IN_USE: "This email is already registered",
  INVALID_EMAIL: "Invalid email address",
  INVALID_CREDENTIALS: "Invalid email or password",
  WEAK_PASSWORD: "Password must be at least 8 characters",
  INVALID_PHONE: "Please enter a valid phone number with country code",
  NETWORK_ERROR: "Network error. Please check your connection and try again",
  SERVER_ERROR: "Server error. Please try again later",
} as const;
