import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { trpc, setAuthToken } from '../lib/trpc';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await trpc.auth.register.mutate({
        email: formData().email,
        password: formData().password,
        phoneNumber: formData().phoneNumber,
      });

      setAuthToken(result.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 shadow-xl">
        <div>
          <h2 class="text-center text-3xl font-bold text-white mb-6">
            Create Account
          </h2>
        </div>

        <form class="space-y-4" onSubmit={handleSubmit}>
          {error() && (
            <div class="rounded-md bg-red-50 p-4">
              <p class="text-sm font-medium text-red-800">{error()}</p>
            </div>
          )}

          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                placeholder="you@example.com"
                value={formData().email}
                onInput={(e) => handleInputChange('email', e.currentTarget.value)}
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-white mb-2">
                Phone Number (E.164 format)
              </label>
              <input
                id="phone"
                type="tel"
                required
                class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                placeholder="+14155238886"
                value={formData().phoneNumber}
                onInput={(e) => handleInputChange('phoneNumber', e.currentTarget.value)}
              />
              <p class="mt-1 text-xs text-white/70">Include country code, e.g., +1 for US</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                placeholder="••••••••"
                value={formData().password}
                onInput={(e) => handleInputChange('password', e.currentTarget.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="w-full rounded-lg bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 px-4 py-3 font-semibold transition-colors shadow-lg"
          >
            {isLoading() ? 'Creating account...' : 'Sign Up'}
          </button>

          <p class="text-center text-sm text-white/80 mt-4">
            Already have an account?{' '}
            <A href="/login" class="text-white font-semibold hover:underline">
              Sign In
            </A>
          </p>
        </form>
      </div>
    </div>
  );
}
