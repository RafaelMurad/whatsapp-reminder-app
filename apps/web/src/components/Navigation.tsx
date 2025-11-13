import { A } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  onMount(() => {
    // Check if user has a token
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  });

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <nav class="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <A 
              href="/" 
              class="text-white font-bold text-xl hover:text-blue-200 transition"
            >
              📱 WhatsApp Reminder
            </A>
            
            <div class="hidden md:flex space-x-4">
              <A 
                href="/" 
                class="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                activeClass="bg-white/20 text-white"
              >
                Home
              </A>
              {isAuthenticated() && (
                <A 
                  href="/dashboard" 
                  class="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  activeClass="bg-white/20 text-white"
                >
                  Dashboard
                </A>
              )}
              <A 
                href="/test" 
                class="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                activeClass="bg-white/20 text-white"
              >
                Test
              </A>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                class="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            ) : (
              <>
                <A 
                  href="/login" 
                  class="text-white/80 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </A>
                <A 
                  href="/register" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Register
                </A>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div class="md:hidden px-4 pb-3 space-y-1">
        <A 
          href="/" 
          class="block text-white/80 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          activeClass="bg-white/20 text-white"
        >
          Home
        </A>
        {isAuthenticated() && (
          <A 
            href="/dashboard" 
            class="block text-white/80 hover:text-white px-3 py-2 rounded-md text-base font-medium"
            activeClass="bg-white/20 text-white"
          >
            Dashboard
          </A>
        )}
        <A 
          href="/test" 
          class="block text-white/80 hover:text-white px-3 py-2 rounded-md text-base font-medium"
          activeClass="bg-white/20 text-white"
        >
          Test
        </A>
      </div>
    </nav>
  );
}
