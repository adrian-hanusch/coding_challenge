import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // The empty prefix loads all variables, so API_URL from .env*.local works too, not only VITE_*.
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Serves mockServiceWorker.js in dev only, so neither a generated file in public/ nor a worker in dist/.
      // `worker-only` keeps the stable setupWorker API instead of the experimental `virtual:msw` network.
      { ...msw({ mode: 'worker-only' }), apply: 'serve' },
    ],
    define: {
      // Same condition as the worker plugin above. Being a compile-time constant, builds drop the mock entirely.
      __MOCK_API__: JSON.stringify(command === 'serve' && env.VITE_API_MOCKING === 'true'),
    },
    server: {
      // Only reached with VITE_API_MOCKING=false, otherwise the service worker answers first.
      proxy: { '/api': env.API_URL || 'http://localhost:8080' },
    },
  }
})
