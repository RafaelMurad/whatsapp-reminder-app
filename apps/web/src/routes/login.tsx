import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { trpc, setAuthToken } from "../lib/trpc";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);

  const navigate = useNavigate();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await trpc.auth.login.mutate({
        email: email().trim(),
        password: password()
      });

      setAuthToken(result.token);
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.message ?? "Login failed. Check credentials or try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div class="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 shadow-xl">
        <h1 class="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h1>

        {error() && (
          <div class="mb-4 rounded bg-red-500/15 border border-red-500/40 p-3 text-red-200 text-sm">
            {error()}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white mb-2">Email</label>
            <input
              type="email"
              required
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Password</label>
            <input
              type="password"
              required
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full rounded-lg bg-white/10 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading()}
            class="w-full rounded-lg bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 px-4 py-3 font-semibold transition-colors shadow-lg"
          >
            {loading() ? "Logging in..." : "Login"}
          </button>
        </form>

        <p class="text-center text-sm text-white/80 mt-6">
          Don't have an account?{" "}
          <A href="/register" class="text-white font-semibold hover:underline">
            Register here
          </A>
        </p>
      </div>
    </main>
  );
}
