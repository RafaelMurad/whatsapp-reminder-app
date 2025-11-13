import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { trpc } from '../lib/trpc';

interface Reminder {
  id: string;
  title: string;
  message: string;
  scheduledFor: string;
  sent: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = createSignal<any>(null);
  const [reminders, setReminders] = createSignal<Reminder[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [isCreating, setIsCreating] = createSignal(false);

  const [formData, setFormData] = createSignal({
    title: '',
    message: '',
    scheduledFor: '',
  });

  // Auth guard: fetch current user on mount
  createEffect(async () => {
    try {
      const currentUser = await trpc.auth.me.query();
      setUser(currentUser);
    } catch {
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  });

  // Fetch reminders when user loads
  createEffect(async () => {
    if (user()) {
      try {
        const data = await trpc.reminder.list.query();
        setReminders(data);
      } catch (_err) {
        console.error('Failed to fetch reminders:', _err);
      }
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateReminder = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      await trpc.reminder.create.mutate({
        title: formData().title,
        message: formData().message,
        scheduledFor: new Date(formData().scheduledFor).toISOString(),
      });

      const updated = await trpc.reminder.list.query();
      setReminders(updated);
      setFormData({ title: '', message: '', scheduledFor: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setIsCreating(false);
    }
  };

  const setQuickReminder = (minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const formatted = now.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, scheduledFor: formatted }));
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await trpc.reminder.delete.mutate({ id });
      const updated = await trpc.reminder.list.query();
      setReminders(updated);
    } catch (err: any) {
      console.error('Failed to delete reminder:', err);
    }
  };

  return (
    <Show when={!isLoading()} fallback={<div class="text-center py-12 text-white">Loading...</div>}>
      <div class="min-h-[calc(100vh-4rem)]">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-white">Dashboard</h1>
            <p class="mt-2 text-lg text-white/80">Welcome, {user()?.email}</p>
          </div>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="md:col-span-1">
              <div class="bg-white/10 backdrop-blur-md overflow-hidden shadow-xl rounded-lg p-6 border border-white/20">
                <h2 class="text-xl font-semibold text-white mb-6">Create Reminder</h2>

                {error() && (
                  <div class="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
                    <p class="text-sm font-medium text-red-100">{error()}</p>
                  </div>
                )}

                <form onSubmit={handleCreateReminder} class="space-y-4">
                  <div>
                    <label for="title" class="block text-sm font-medium text-white mb-2">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                      placeholder="Reminder title"
                      value={formData().title}
                      onInput={(e) => handleInputChange('title', e.currentTarget.value)}
                    />
                  </div>

                  <div>
                    <label for="message" class="block text-sm font-medium text-white mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                      placeholder="Message content"
                      rows={3}
                      value={formData().message}
                      onInput={(e) => handleInputChange('message', e.currentTarget.value)}
                    />
                  </div>

                  <div>
                    <label for="scheduledFor" class="block text-sm font-medium text-white mb-2">
                      Scheduled For
                    </label>
                    
                    <div class="mb-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuickReminder(1)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-white bg-white/20 hover:bg-white/30 border border-white/30"
                      >
                        +1 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(5)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-white bg-white/20 hover:bg-white/30 border border-white/30"
                      >
                        +5 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(15)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-white bg-white/20 hover:bg-white/30 border border-white/30"
                      >
                        +15 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(60)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-white bg-white/20 hover:bg-white/30 border border-white/30"
                      >
                        +1 hour
                      </button>
                    </div>
                    
                    <input
                      id="scheduledFor"
                      type="datetime-local"
                      required
                      class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                      value={formData().scheduledFor}
                      onInput={(e) => handleInputChange('scheduledFor', e.currentTarget.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating()}
                    class="w-full rounded-lg bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 px-4 py-3 font-semibold transition-colors shadow-lg"
                  >
                    {isCreating() ? 'Creating...' : 'Create Reminder'}
                  </button>
                </form>
              </div>
            </div>

            <div class="md:col-span-2">
              <div class="bg-white/10 backdrop-blur-md overflow-hidden shadow-xl rounded-lg border border-white/20">
                <div class="px-6 py-4 border-b border-white/20">
                  <h2 class="text-xl font-semibold text-white">
                    Reminders ({reminders().length})
                  </h2>
                </div>

                <Show
                  when={reminders().length > 0}
                  fallback={
                    <div class="px-6 py-12 text-center">
                      <p class="text-white/70">No reminders yet. Create one to get started!</p>
                    </div>
                  }
                >
                  <div class="divide-y divide-white/10">
                    <For each={reminders()}>
                      {(reminder) => (
                        <div class="px-6 py-4 hover:bg-white/5 transition">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h3 class="text-base font-semibold text-white">{reminder.title}</h3>
                              <p class="mt-1 text-sm text-white/80">{reminder.message}</p>
                              <div class="mt-2 flex items-center space-x-4 text-xs text-white/60">
                                <span>
                                  Scheduled: {new Date(reminder.scheduledFor).toLocaleString()}
                                </span>
                                <span
                                  class={`px-2 py-1 rounded ${
                                    reminder.sent
                                      ? 'bg-green-500/30 text-green-100 border border-green-500/50'
                                      : 'bg-yellow-500/30 text-yellow-100 border border-yellow-500/50'
                                  }`}
                                >
                                  {reminder.sent ? 'Sent' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              class="ml-2 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-500/80 hover:bg-red-600 border border-red-500/50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
