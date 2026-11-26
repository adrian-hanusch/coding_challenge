import { delay, type HttpResponseResolver, type PathParams } from 'msw'

import { problem } from './problem.ts'

/**
 * Mock switches, set via URL and kept in sessionStorage for the tab:
 *
 *   ?mock-delay=2000                       fixed latency in ms (default: realistic 100–400 ms)
 *   ?mock-fail=assignment:409,search:500   failing endpoints; `?mock-fail=` clears them
 *                                          (`assignment:409-invoice` simulates INVOICE_NOT_OPEN)
 *   ?mock-reset                            clears all switches
 */

// The HTTP status, with a suffix where one status has several causes.
const FAILURES = {
  payment: ['500'],
  paymentSearch: ['500'],
  search: ['500'],
  assignment: ['409', '409-invoice', '500'],
} as const

type Endpoint = keyof typeof FAILURES
type Failure = (typeof FAILURES)[Endpoint][number]

export interface Scenario {
  delayMs: number | null
  failures: Partial<Record<Endpoint, Failure>>
}

const STORAGE_KEY = 'mock:scenario'
const DEFAULT_SCENARIO: Scenario = { delayMs: null, failures: {} }

// Vitest never sets a scenario, so tests run without failures and with MSW's 5 ms Node latency.
let active = DEFAULT_SCENARIO

function parseDelay(value: string): number | null {
  if (value === '') return null
  const delayMs = Number(value)
  if (Number.isSafeInteger(delayMs) && delayMs >= 0) return delayMs
  console.warn(`[mock] Ignoring mock-delay=${value}, expected milliseconds`)
  return null
}

function parseFailures(value: string): Scenario['failures'] {
  const failures: Scenario['failures'] = {}
  for (const entry of value.split(',').filter(Boolean)) {
    const [endpoint = '', failure = ''] = entry.split(':')
    if (Object.hasOwn(FAILURES, endpoint) && (FAILURES[endpoint as Endpoint] as readonly string[]).includes(failure)) {
      failures[endpoint as Endpoint] = failure as Failure
    } else {
      console.warn(`[mock] Ignoring mock-fail=${entry}, allowed: ${JSON.stringify(FAILURES)}`)
    }
  }
  return failures
}

/** Missing or corrupt entries count as absent. */
function readJson(storage: Storage, key: string): unknown {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

/** Activates the switches from the URL, or the ones stored for this tab. Returns whether `?mock-reset` was given. */
export function loadScenario(url: URL, storage: Storage): { scenario: Scenario; reset: boolean } {
  const params = url.searchParams
  if (params.has('mock-reset')) {
    storage.removeItem(STORAGE_KEY)
    active = DEFAULT_SCENARIO
    return { scenario: active, reset: true }
  }

  const stored = (readJson(storage, STORAGE_KEY) as Scenario | null) ?? DEFAULT_SCENARIO
  const delayParam = params.get('mock-delay')
  const failParam = params.get('mock-fail')
  active = {
    delayMs: delayParam === null ? stored.delayMs : parseDelay(delayParam),
    failures: failParam === null ? stored.failures : parseFailures(failParam),
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(active))
  return { scenario: active, reset: false }
}

const FAILURE_RESPONSES: Record<Failure, Parameters<typeof problem>> = {
  '409': [409, 'PAYMENT_ALREADY_ASSIGNED', 'Simulated: payment was assigned concurrently'],
  '409-invoice': [409, 'INVOICE_NOT_OPEN', 'Simulated: invoice was assigned concurrently'],
  '500': [500, 'INTERNAL_ERROR', 'Simulated server error'],
}

/** Wraps a domain resolver with the active latency and, if configured, a simulated failure for its endpoint. */
export function withScenario<Params extends PathParams<keyof Params> = PathParams>(
  endpoint: Endpoint,
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return async (info) => {
    await delay(active.delayMs ?? 'real')
    const failure = active.failures[endpoint]
    return failure === undefined ? resolver(info) : problem(...FAILURE_RESPONSES[failure])
  }
}
