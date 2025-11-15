"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parseAuthError, type FieldErrors } from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Clear any previous errors
      setErrors({});
      // Store token and user in auth context
      authLogin(data.token, {
        id: data.user.id,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
      });
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      // Use utility to parse error and map to specific fields
      const newErrors = parseAuthError(error, ["email", "password"]);

      // Show toast for general/network errors (but not credential errors)
      if (newErrors.general && !newErrors.general.includes("Invalid email")) {
        toast.error(newErrors.general);
      }

      setErrors(newErrors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors on new submit
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;
  const hasCredentialError = !!errors.general;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in to your WhatsApp Reminder account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* General Error (shown at top for credential errors) */}
            {errors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <span className="text-base mt-0.5">⚠</span>
                <p>{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={!!errors.email || hasCredentialError}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  (errors.email || hasCredentialError) && "border-destructive"
                )}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <span className="text-base">⚠</span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={8}
                disabled={isLoading}
                aria-invalid={!!errors.password || hasCredentialError}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  (errors.password || hasCredentialError) &&
                    "border-destructive"
                )}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <span className="text-base">⚠</span>
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
