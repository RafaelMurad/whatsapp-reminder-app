"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { parseAuthError, type FieldErrors } from "@/lib/auth-errors";
import { FormField, ErrorAlert } from "@/components/form";

export default function RegisterPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setErrors({});
      authLogin(data.token, {
        id: data.user.id,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
      });
      toast.success("Account created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      const newErrors = parseAuthError(error, [
        "email",
        "password",
        "phoneNumber",
      ]);
      if (newErrors.general) {
        toast.error(newErrors.general);
      }
      setErrors(newErrors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            {/* General Error Alert */}
            {errors.general && <ErrorAlert>{errors.general}</ErrorAlert>}

            {/* Email Field */}
            <FormField label="Email" error={errors.email} required>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </FormField>

            {/* Password Field */}
            <FormField
              label="Password"
              error={errors.password}
              hint="At least 8 characters"
              required
            >
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                disabled={isLoading}
              />
            </FormField>

            {/* Phone Number Field */}
            <FormField
              label="Phone Number"
              error={errors.phoneNumber}
              hint="Include country code (e.g., +1 for US)"
              required
            >
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                minLength={6}
                maxLength={20}
                disabled={isLoading}
              />
            </FormField>
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
