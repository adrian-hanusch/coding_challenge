import type { ApiErrorCode, ApiProblem } from './types.ts'

export const API_BASE_URL = '/api'

/** `UNKNOWN`: the response was no problem document, e.g. the proxy could not reach the backend. */
export type ApiErrorKind = ApiErrorCode | 'UNKNOWN'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorKind

  constructor(status: number, code: ApiErrorKind) {
    super(`API request failed: ${String(status)} ${code}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function isProblem(body: unknown): body is ApiProblem {
  return typeof body === 'object' && body !== null && 'code' in body && typeof body.code === 'string'
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  return new ApiError(response.status, isProblem(body) ? body.code : 'UNKNOWN')
}

/** JSON request against the API. Throws `ApiError` for every non-2xx response. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}
