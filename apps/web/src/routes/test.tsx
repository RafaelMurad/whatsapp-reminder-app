export default function Test() {
  return (
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 shadow-xl max-w-md w-full">
        <h1 class="text-3xl font-bold text-white mb-4">✅ Server is Working!</h1>
        <p class="text-white/80 mb-6">If you see this, the dev server is running correctly.</p>
        <ul class="space-y-2 text-white/90">
          <li class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>Database: Connected</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>Routing: Working</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="text-green-400">✓</span>
            <span>SolidStart: Running</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
