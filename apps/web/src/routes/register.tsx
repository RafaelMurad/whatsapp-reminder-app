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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
        </div>

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error() && (
            <div class="rounded-md bg-red-50 p-4">
              <p class="text-sm font-medium text-red-800">{error()}</p>
            </div>
          )}

          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                value={formData().email}
                onInput={(e) => handleInputChange('email', e.currentTarget.value)}
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Phone Number (E.164 format)
              </label>
              <input
                id="phone"
                type="tel"
                required
                class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+14155238886"
                value={formData().phoneNumber}
                onInput={(e) => handleInputChange('phoneNumber', e.currentTarget.value)}
              />
              <p class="mt-1 text-xs text-gray-500">Include country code, e.g., +1 for US</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                value={formData().password}
                onInput={(e) => handleInputChange('password', e.currentTarget.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading() ? 'Creating account...' : 'Sign Up'}
          </button>

          <p class="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <A href="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign In
            </A>
          </p>
        </form>
      </div>
    </div>
  );
}
