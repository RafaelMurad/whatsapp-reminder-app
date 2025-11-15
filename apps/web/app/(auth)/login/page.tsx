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
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setErrors({});
      authLogin(data.token, {
        id: data.user.id,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
      });
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      const newErrors = parseAuthError(error, ["email", "password"]);
      if (newErrors.general && !newErrors.general.includes("Invalid email")) {
        toast.error(newErrors.general);
      }
      setErrors(newErrors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                className={cn(hasCredentialError && "border-destructive")}
              />
            </FormField>

            {/* Password Field */}
            <FormField label="Password" error={errors.password} required>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                minLength={8}
                disabled={isLoading}
                className={cn(hasCredentialError && "border-destructive")}
              />
            </FormField>
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
