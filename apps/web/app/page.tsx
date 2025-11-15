"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const registerMutation = trpc.auth.register.useMutation({
    onError: (error) => {
      // Only bubble non-conflict errors
      if (error.message !== "Email already in use") {
        toast.error(error.message);
      }
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login successful!");
      console.log("Login response:", data);
    },
    onError: (error) => {
      toast.error(error.message);
      console.error("Login error:", error);
    },
  });

  const handleTestLogin = async () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    try {
      await registerMutation.mutateAsync({
        ...credentials,
        phoneNumber: "+15555550123",
      });
      toast.success("Seed user created");
    } catch (error) {
      // Ignore conflict errors; user already exists
      const conflict =
        error instanceof Error && error.message.includes("already in use");
      if (!conflict) {
        console.error("Register error:", error);
        return;
      }
    }

    loginMutation.mutate(credentials);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">WhatsApp Reminder App</h1>
        <p className="mt-4 text-muted-foreground">
          Next.js 16 + React 19 + tRPC + Tailwind v4
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleTestLogin}
          disabled={loginMutation.isPending || registerMutation.isPending}
        >
          {loginMutation.isPending || registerMutation.isPending
            ? "Testing..."
            : "Test tRPC Login"}
        </Button>

        {loginMutation.isSuccess && (
          <p className="text-sm text-green-600">✓ tRPC connection working!</p>
        )}
      </div>
    </div>
  );
}

