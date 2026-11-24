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

const RELOAD_KEY = 'mock:reloaded'

/**
 * An already active worker does not control a page after a hard reload, or after another tab unregistered it. MSW starts
 * anyway, but every request reaches the proxy. A normal reload fixes it, tried once to avoid a loop.
 */
async function ensureControlled() {
  if (navigator.serviceWorker.controller) {
    sessionStorage.removeItem(RELOAD_KEY)
    return
  }
  if (sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.removeItem(RELOAD_KEY)
    throw new Error('The service worker does not control this page')
  }
  sessionStorage.setItem(RELOAD_KEY, 'true')
  window.location.reload()
  await new Promise(() => undefined)
}

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
  await ensureControlled()
  console.info('[mock] Scenario:', scenario)
}
