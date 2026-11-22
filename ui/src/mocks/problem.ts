import { HttpResponse } from 'msw'

import type { ApiErrorCode, ApiProblem, FieldError } from '../api/types.ts'

/** RFC 9457 error response. */
export function problem(status: number, code: ApiErrorCode, title: string, errors?: FieldError[]) {
  const body: ApiProblem = { status, code, title, errors }
  return HttpResponse.json(body, { status, headers: { 'Content-Type': 'application/problem+json' } })
}
