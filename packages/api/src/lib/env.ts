// Environment variable validation
// Call validateEnv() at application startup to fail fast on missing config

const requiredEnvVars = [
  'JWT_SECRET',
] as const;

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function assertEnv(): void {
  const result = validateEnv();

  if (!result.valid) {
    throw new Error(
      `Missing required environment variables: ${result.missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
}
