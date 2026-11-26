import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const DEMO_MODE = 'demo'

// The msw plugin emits no worker in `worker-only` mode, so the demo build copies it next to index.html.
const emitMockWorker: Plugin = {
  name: 'emit-mock-worker',
  apply: (_, { command, mode }) => command === 'build' && mode === DEMO_MODE,
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'mockServiceWorker.js',
      source: readFileSync(createRequire(import.meta.url).resolve('msw/mockServiceWorker.js')),
    })
  },
}

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
      emitMockWorker,
    ],
    define: {
      // Being a compile-time constant, the regular build drops the mock entirely; only `--mode demo` keeps it.
      __MOCK_API__: JSON.stringify(env.VITE_API_MOCKING === 'true' && (command === 'serve' || mode === DEMO_MODE)),
    },
    build: {
      rolldownOptions: {
        output: {
          // Libraries change less often than the app, so they stay cached across deploys.
          codeSplitting: {
            groups: [
              { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/ },
              {
                name: 'ui',
                test: /[\\/]node_modules[\\/](@heroui|react-aria|react-aria-components|react-stately|@react-aria|@react-stately|@react-types|@internationalized|tailwind-variants|tailwind-merge)[\\/]/,
              },
              { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
            ],
          },
        },
      },
    },
    server: {
      // Only reached with VITE_API_MOCKING=false, otherwise the service worker answers first.
      proxy: { '/api': env.API_URL || 'http://localhost:8080' },
    },
  }
})
