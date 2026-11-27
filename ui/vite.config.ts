import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// The msw plugin emits no worker in `worker-only` mode, so a build with the mock copies it next to index.html.
const emitMockWorker: Plugin = {
  name: 'emit-mock-worker',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'mockServiceWorker.js',
      source: readFileSync(createRequire(import.meta.url).resolve('msw/mockServiceWorker.js')),
    })
  },
}

export default defineConfig(({ command, mode }) => {
  // The empty prefix loads all variables, so API_URL from .env*.local works too, not only VITE_*.
  const env = loadEnv(mode, import.meta.dirname, '')
  // Limited to the dev server and `--mode demo`: a regular build also reads .env.local, which must not ship the mock.
  const mocking = env.VITE_API_MOCKING === 'true' && (command === 'serve' || mode === 'demo')

  return {
    plugins: [
      react(),
      tailwindcss(),
      // `worker-only` keeps the stable setupWorker API instead of the experimental `virtual:msw` network.
      { ...msw({ mode: 'worker-only' }), apply: 'serve' },
      command === 'build' && mocking && emitMockWorker,
    ],
    define: {
      // Being a compile-time constant, a build without it drops the mock entirely.
      __MOCK_API__: JSON.stringify(mocking),
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
