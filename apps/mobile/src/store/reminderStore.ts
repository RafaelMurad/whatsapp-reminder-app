/**
 * Reminder Store
 * Manages reminder state using Zustand
 */

import { create } from 'zustand';
import { api } from '../services/api';
import { Reminder, CreateReminderInput, UpdateReminderInput } from '../types';

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  selectedReminder: Reminder | null;

  // Actions
  fetchReminders: () => Promise<void>;
  createReminder: (input: CreateReminderInput) => Promise<Reminder>;
  updateReminder: (input: UpdateReminderInput) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  selectReminder: (reminder: Reminder | null) => void;
  clearError: () => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,
  selectedReminder: null,

  fetchReminders: async () => {
    try {
      set({ isLoading: true, error: null });

      const reminders = await api.getReminders();

      // Sort by scheduled date (soonest first)
      const sortedReminders = reminders.sort(
        (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      );

      set({ reminders: sortedReminders, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reminders',
      });
    }
  },

  createReminder: async (input: CreateReminderInput) => {
    try {
      set({ isLoading: true, error: null });

      const newReminder = await api.createReminder(input);

      set((state) => ({
        reminders: [...state.reminders, newReminder].sort(
          (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
        ),
        isLoading: false,
      }));

      return newReminder;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create reminder',
      });
      throw error;
    }
  },

  updateReminder: async (input: UpdateReminderInput) => {
    try {
      set({ isLoading: true, error: null });

      const updatedReminder = await api.updateReminder(input);

      set((state) => ({
        reminders: state.reminders
          .map((r) => (r.id === input.id ? updatedReminder : r))
          .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
        isLoading: false,
        selectedReminder:
          state.selectedReminder?.id === input.id ? updatedReminder : state.selectedReminder,
      }));

      return updatedReminder;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update reminder',
      });
      throw error;
    }
  },

  deleteReminder: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.deleteReminder(id);

      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        isLoading: false,
        selectedReminder: state.selectedReminder?.id === id ? null : state.selectedReminder,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete reminder',
      });
      throw error;
    }
  },

  selectReminder: (reminder: Reminder | null) => {
    set({ selectedReminder: reminder });
  },

  clearError: () => set({ error: null }),
}));

// Selector helpers
export const useUpcomingReminders = () =>
  useReminderStore((state) =>
    state.reminders.filter(
      (r) => !r.sent && new Date(r.scheduledFor) > new Date()
    )
  );

export const usePastReminders = () =>
  useReminderStore((state) =>
    state.reminders.filter(
      (r) => r.sent || new Date(r.scheduledFor) <= new Date()
    )
  );
