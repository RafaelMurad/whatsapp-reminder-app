import { defineConfig } from '@solidjs/start/config'

export default defineConfig({
  server: {
    preset: 'node-server',
  },
  vite: {
    ssr: {
      external: ['dotenv'],
      noExternal: ['@repo/api', '@repo/db'],
    },
  },
})
