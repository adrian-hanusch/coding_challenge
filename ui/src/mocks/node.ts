import { setupServer } from 'msw/node'
import { afterAll, beforeAll, vi } from 'vitest'

import { handlers } from './handlers/index.ts'

/** For Vitest: no latency, no scenarios. Tests override responses with `server.use(...)`. */
export const server = setupServer(...handlers)

/** Runs the server for a test file in the plain Node environment. */
export function setupNodeMockServer() {
  beforeAll(() => {
    // MSW resolves the relative handler paths against the location, which Node does not have.
    vi.stubGlobal('location', new URL('http://localhost/'))
    server.listen()
  })

  afterAll(() => {
    server.close()
    vi.unstubAllGlobals()
  })
}
