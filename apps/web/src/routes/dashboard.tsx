import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { trpc, clearAuthToken } from '../lib/trpc';

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
      const currentUser = await trpc.auth.getMe.query();
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
        const data = await trpc.reminder.getAll.query();
        setReminders(data.reminders);
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

      const updated = await trpc.reminder.getAll.query();
      setReminders(updated.reminders);
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
      const updated = await trpc.reminder.getAll.query();
      setReminders(updated.reminders);
    } catch (err: any) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  return (
    <Show when={!isLoading()} fallback={<div class="text-center py-12">Loading...</div>}>
      <div class="min-h-screen bg-gray-50">
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p class="mt-1 text-sm text-gray-500">Welcome, {user()?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="md:col-span-1">
              <div class="bg-white overflow-hidden shadow rounded-lg p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Create Reminder</h2>

                {error() && (
                  <div class="mb-4 rounded-md bg-red-50 p-4">
                    <p class="text-sm font-medium text-red-800">{error()}</p>
                  </div>
                )}

                <form onSubmit={handleCreateReminder} class="space-y-4">
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Reminder title"
                      value={formData().title}
                      onInput={(e) => handleInputChange('title', e.currentTarget.value)}
                    />
                  </div>

                  <div>
                    <label for="message" class="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Message content"
                      rows={3}
                      value={formData().message}
                      onInput={(e) => handleInputChange('message', e.currentTarget.value)}
                    />
                  </div>

                  <div>
                    <label for="scheduledFor" class="block text-sm font-medium text-gray-700">
                      Scheduled For
                    </label>
                    
                    <div class="mt-1 mb-2 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuickReminder(1)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      >
                        +1 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(5)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      >
                        +5 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(15)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      >
                        +15 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickReminder(60)}
                        class="px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      >
                        +1 hour
                      </button>
                    </div>
                    
                    <input
                      id="scheduledFor"
                      type="datetime-local"
                      required
                      class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData().scheduledFor}
                      onInput={(e) => handleInputChange('scheduledFor', e.currentTarget.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating()}
                    class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isCreating() ? 'Creating...' : 'Create Reminder'}
                  </button>
                </form>
              </div>
            </div>

            <div class="md:col-span-2">
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-medium text-gray-900">
                    Reminders ({reminders().length})
                  </h2>
                </div>

                <Show
                  when={reminders().length > 0}
                  fallback={
                    <div class="px-6 py-12 text-center">
                      <p class="text-gray-500">No reminders yet. Create one to get started!</p>
                    </div>
                  }
                >
                  <div class="divide-y divide-gray-200">
                    <For each={reminders()}>
                      {(reminder) => (
                        <div class="px-6 py-4 hover:bg-gray-50">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <h3 class="text-sm font-medium text-gray-900">{reminder.title}</h3>
                              <p class="mt-1 text-sm text-gray-600">{reminder.message}</p>
                              <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>
                                  Scheduled: {new Date(reminder.scheduledFor).toLocaleString()}
                                </span>
                                <span
                                  class={`px-2 py-1 rounded ${
                                    reminder.sent
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {reminder.sent ? 'Sent' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              class="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
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
