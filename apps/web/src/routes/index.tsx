import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div class="text-center text-white max-w-4xl">
        <h1 class="text-6xl font-bold mb-4">📱 WhatsApp Reminder App</h1>
        <p class="text-2xl mb-8">Never forget important tasks again! 🚀</p>
        
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 class="text-xl font-semibold mb-4">✨ Features</h2>
            <ul class="text-left space-y-2">
              <li>📅 Schedule reminders</li>
              <li>💬 WhatsApp notifications</li>
              <li>🔔 Never miss a task</li>
              <li>🔒 Secure & private</li>
            </ul>
          </div>
          
          <div class="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 class="text-xl font-semibold mb-4">🛠️ Tech Stack</h2>
            <ul class="text-left space-y-2">
              <li>✅ SolidStart</li>
              <li>✅ tRPC</li>
              <li>✅ Drizzle ORM + SQLite</li>
              <li>✅ TypeScript</li>
              <li>✅ Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <A 
            href="/register" 
            class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Get Started
          </A>
          <A 
            href="/login" 
            class="bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/30 transition border border-white/30"
          >
            Login
          </A>
        </div>
      </div>
    </main>
  )
}
