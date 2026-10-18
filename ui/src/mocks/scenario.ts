import { delay, type HttpResponseResolver, type PathParams } from 'msw'
import { problem } from './problem.ts'
import { readJson } from './storage.ts'

/**
 * Dev-only switches, set via URL and kept in sessionStorage for the tab:
 *
 *   ?mock-delay=2000                       fixed latency in ms (default: realistic 100–400 ms)
 *   ?mock-fail=assignment:409,search:500   failing endpoints; `?mock-fail=` clears them
 *   ?mock-reset                            restores fixtures and clears all switches
 */

const FAILURES = {
  payment: [500],
  search: [500],
  assignment: [409, 500],
} as const

type Endpoint = keyof typeof FAILURES
type FailureStatus = (typeof FAILURES)[Endpoint][number]

export interface Scenario {
  delayMs: number | null
  failures: Partial<Record<Endpoint, FailureStatus>>
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
    const [endpoint = '', status] = entry.split(':')
    const code = Number(status)
    if (Object.hasOwn(FAILURES, endpoint) && (FAILURES[endpoint as Endpoint] as readonly number[]).includes(code)) {
      failures[endpoint as Endpoint] = code as FailureStatus
    } else {
      console.warn(`[mock] Ignoring mock-fail=${entry}, allowed: ${JSON.stringify(FAILURES)}`)
    }
  }
  return failures
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

const FAILURE_RESPONSES: Record<FailureStatus, Parameters<typeof problem>> = {
  409: [409, 'PAYMENT_ALREADY_ASSIGNED', 'Simulated: payment was assigned concurrently'],
  500: [500, 'INTERNAL_ERROR', 'Simulated server error'],
}

/** Wraps a domain resolver with the active latency and, if configured, a simulated failure for its endpoint. */
export function withScenario<Params extends PathParams<keyof Params> = PathParams>(
  endpoint: Endpoint,
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return async (info) => {
    await delay(active.delayMs ?? 'real')
    const status = active.failures[endpoint]
    return status === undefined ? resolver(info) : problem(...FAILURE_RESPONSES[status])
  }
}
