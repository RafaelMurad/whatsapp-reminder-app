import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  server: {
    preset: 'vercel',
    compatibilityDate: '2025-11-13',
  },
  vite: {
    ssr: {
      external: ['dotenv'],
      noExternal: ['@repo/api', '@repo/db'],
    },
  },
})
