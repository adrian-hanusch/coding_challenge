import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

import { db } from './db.ts'
import { handlers } from './handlers/index.ts'
import { loadScenario } from './scenario.ts'

declare global {
  interface Window {
    /** Dev console helper, e.g. `__mockDb.reset()`. */
    __mockDb?: typeof db
  }
}

// Like a real backend, unknown API routes answer 404 instead of silently reaching the proxy.
const unknownApiRoute = http.all('/api/*', ({ request }) => {
  console.warn(`[mock] No handler for ${request.method} ${new URL(request.url).pathname}`)
  return new HttpResponse(null, { status: 404 })
})

/** Starts the mock API in the browser. Must resolve before the app renders, or the first queries miss the worker. */
export async function startMockApi() {
  db.enablePersistence(sessionStorage)

  const url = new URL(window.location.href)
  const { scenario, reset } = loadScenario(url, sessionStorage)
  if (reset) {
    db.reset()
    // Otherwise every reload would reset again.
    url.searchParams.delete('mock-reset')
    window.history.replaceState(window.history.state, '', url)
  }
  window.__mockDb = db

  const worker = setupWorker(...handlers, unknownApiRoute)
  // Everything outside /api (page, Vite modules, assets) goes to the dev server as usual.
  await worker.start({ onUnhandledFrame: 'bypass' })
  console.info('[mock] Scenario:', scenario)
}
