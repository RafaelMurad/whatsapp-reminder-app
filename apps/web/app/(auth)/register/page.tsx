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

export default function RegisterPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Clear any previous errors
      setErrors({});
      // Store token and user in auth context
      authLogin(data.token, {
        id: data.user.id,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
      });
      toast.success("Account created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      // Use utility to parse error and map to specific fields
      const newErrors = parseAuthError(error, [
        "email",
        "password",
        "phoneNumber",
      ]);

      // Show toast for general/network errors
      if (newErrors.general) {
        toast.error(newErrors.general);
      }

      setErrors(newErrors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors on new submit
    setErrors({});
    registerMutation.mutate({ email, password, phoneNumber });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up for WhatsApp Reminder notifications
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(errors.email && "border-destructive")}
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
                autoComplete="new-password"
                minLength={8}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : "password-hint"
                }
                className={cn(errors.password && "border-destructive")}
              />
              {errors.password ? (
                <p
                  id="password-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <span className="text-base">⚠</span>
                  {errors.password}
                </p>
              ) : (
                <p id="password-hint" className="text-xs text-muted-foreground">
                  At least 8 characters
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoComplete="tel"
                minLength={6}
                maxLength={20}
                disabled={isLoading}
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={
                  errors.phoneNumber ? "phone-error" : "phone-hint"
                }
                className={cn(errors.phoneNumber && "border-destructive")}
              />
              {errors.phoneNumber ? (
                <p
                  id="phone-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <span className="text-base">⚠</span>
                  {errors.phoneNumber}
                </p>
              ) : (
                <p id="phone-hint" className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <span className="text-base mt-0.5">⚠</span>
                <p>{errors.general}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}