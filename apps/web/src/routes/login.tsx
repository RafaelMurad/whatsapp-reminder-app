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
    <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div class="w-full max-w-md bg-white/5 backdrop-blur rounded-lg border border-white/10 p-6">
        <h1 class="text-2xl font-semibold text-white mb-4">Login</h1>

        {error() && (
          <div class="mb-4 rounded bg-red-500/15 border border-red-500/40 p-3 text-red-200 text-sm">
            {error()}
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              required
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full rounded bg-slate-800 text-slate-100 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-200 mb-1">Password</label>
            <input
              type="password"
              required
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full rounded bg-slate-800 text-slate-100 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading()}
            class="w-full rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 font-medium text-white transition-colors"
          >
            {loading() ? "Logging in..." : "Login"}
          </button>
        </form>

        <p class="text-center text-xs text-slate-400 mt-4">
          Don't have an account?{" "}
          <A href="/register" class="text-blue-400 hover:text-blue-300 underline">
            Register
          </A>
        </p>
      </div>
    </main>
  );
}
