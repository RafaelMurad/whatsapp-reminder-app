"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Bell,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [typedText, setTypedText] = useState("");
  const fullText = "Never Forget Again";

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Typewriter effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card px-8 py-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-purple border-t-transparent" />
            <p className="text-text-secondary">Loading...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-bg-primary to-accent-pink/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent-purple/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent-pink/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20"
        style={{ opacity, scale }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-accent-amber" />
              <span className="gradient-text-purple-pink">Powered by AI & WhatsApp</span>
            </motion.div>

            {/* Headline with Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
                <span className="gradient-text-purple-pink">{typedText}</span>
                <span className="animate-pulse">|</span>
              </h1>
              <p className="text-xl text-text-secondary md:text-2xl max-w-3xl mx-auto">
                The most beautiful way to manage reminders. Get notified on WhatsApp,
                earn achievements, and never miss what matters.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/register"
                className="group magnetic-button relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/login"
                className="glass-card-hover px-8 py-4 font-semibold rounded-xl flex items-center gap-2"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-6 text-sm text-text-tertiary"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-green" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-green" />
                <span>Free forever</span>
              </div>
            </motion.div>
          </div>

          {/* Floating Reminder Cards (3D) */}
          <div className="relative mt-20 perspective-1000">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 preserve-3d"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {[
                { title: "Team Meeting", time: "Today at 3:00 PM", color: "purple" },
                { title: "Gym Workout", time: "Tomorrow at 6:00 AM", color: "pink" },
                { title: "Call Mom", time: "Friday at 5:00 PM", color: "cyan" },
              ].map((reminder, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50, rotateX: -15 },
                    visible: { opacity: 1, y: 0, rotateX: 0 },
                  }}
                  transition={{ duration: 0.6 }}
                  className="glass-card-hover p-6 space-y-3 float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full gradient-bg-${reminder.color === 'purple' ? 'purple-pink' : reminder.color === 'pink' ? 'purple-pink' : 'green-cyan'} flex items-center justify-center pulse-glow`}>
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{reminder.title}</h3>
                      <p className="text-sm text-text-tertiary">{reminder.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="gradient-text-green-cyan">Why Choose Us?</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Packed with features that make reminder management feel like a game
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "WhatsApp Integration",
                description: "Get reminders directly on WhatsApp. No app needed.",
                gradient: "purple-pink",
              },
              {
                icon: Zap,
                title: "Instant Sync",
                description: "Real-time updates across all your devices.",
                gradient: "green-cyan",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "End-to-end encryption. Your data stays yours.",
                gradient: "purple-pink",
              },
              {
                icon: TrendingUp,
                title: "Gamification",
                description: "Earn XP, unlock achievements, build streaks.",
                gradient: "green-cyan",
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                description: "AI-powered suggestions for optimal timing.",
                gradient: "purple-pink",
              },
              {
                icon: Sparkles,
                title: "Beautiful UI",
                description: "Award-winning design that sparks joy.",
                gradient: "green-cyan",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-hover p-8 space-y-4"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg-${feature.gradient}`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center space-y-8 gradient-border"
          >
            <h2 className="text-4xl font-bold md:text-5xl gradient-text-purple-pink">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Join thousands of users who never miss a beat. Start your streak today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="magnetic-button"
              >
                <span className="flex items-center gap-2">
                  Get Started Free
                  <Sparkles className="h-5 w-5" />
                </span>
              </Link>
            </div>
            <p className="text-sm text-text-tertiary">
              No credit card • No commitments • Just results
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-tertiary text-sm">
              © 2025 WhatsApp Reminder App. Built with ❤️ and cutting-edge tech.
            </p>
            <div className="flex gap-6 text-sm text-text-tertiary">
              <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
