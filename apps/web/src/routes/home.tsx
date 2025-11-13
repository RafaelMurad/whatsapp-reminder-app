import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="text-center text-white">
        <h1 class="text-6xl font-bold mb-4">📱 WhatsApp Reminder App</h1>
        <p class="text-2xl mb-8">Never miss what matters—get WhatsApp reminders on time! 🚀</p>
        
        <div class="flex gap-4 justify-center mb-8">
          <A
            href="/register"
            class="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
          >
            Get Started
          </A>
          <A
            href="/login"
            class="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/30 transition"
          >
            Sign In
          </A>
        </div>

        <div class="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-md mx-auto">
          <h2 class="text-xl font-semibold mb-4">Tech Stack</h2>
          <ul class="text-left space-y-2">
            <li>✅ Vite + Solid</li>
            <li>✅ tRPC</li>
            <li>✅ Prisma + PostgreSQL</li>
            <li>✅ TypeScript</li>
            <li>✅ Tailwind CSS</li>
            <li>✅ Twilio WhatsApp</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
