import { setupServer } from 'msw/node'

import { handlers } from './handlers/index.ts'

/** For Vitest: no latency, no scenarios. Tests override responses with `server.use(...)`. */
export const server = setupServer(...handlers)
