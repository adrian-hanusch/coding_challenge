import { type FieldError, MAX_SEARCH_LENGTH, type Page } from '../api/types.ts'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

export interface PageQuery {
  q: string
  offset: number
  limit: number
}

function parseInteger(value: string | null, fallback: number, min: number, max: number): number | null {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= min && parsed <= max ? parsed : null
}

export function parsePageQuery(searchParams: URLSearchParams): { query: PageQuery } | { errors: FieldError[] } {
  // Trimmed here, so the length check and the search see the same value.
  const q = (searchParams.get('q') ?? '').trim()
  const offset = parseInteger(searchParams.get('offset'), 0, 0, Number.MAX_SAFE_INTEGER)
  const limit = parseInteger(searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)

  const errors: FieldError[] = []
  if (q.length > MAX_SEARCH_LENGTH) errors.push({ field: 'q', code: 'TOO_LONG' })
  if (offset === null) errors.push({ field: 'offset', code: 'OUT_OF_RANGE' })
  if (limit === null) errors.push({ field: 'limit', code: 'OUT_OF_RANGE' })
  if (offset === null || limit === null || errors.length > 0) return { errors }
  return { query: { q, offset, limit } }
}

export function pageOf<T>(matches: readonly T[], { offset, limit }: PageQuery): Page<T> {
  return { items: matches.slice(offset, offset + limit), total: matches.length, offset, limit }
}
