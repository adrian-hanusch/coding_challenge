import { describe, expect, it } from 'vitest'

import { parsePageQuery } from './searchParams.ts'

const parse = (query: string) => parsePageQuery(new URLSearchParams(query))

describe('parsePageQuery', () => {
  it('uses defaults for missing parameters', () => {
    expect(parse('')).toEqual({ query: { q: '', offset: 0, limit: 10 } })
  })

  it('trims the search text', () => {
    expect(parse('q=%20418%20&offset=5&limit=50')).toEqual({ query: { q: '418', offset: 5, limit: 50 } })
  })

  it.each(['0', '51', '-1', 'abc', ''])('rejects the limit "%s"', (limit) => {
    expect(parse(`limit=${limit}`)).toEqual({ errors: [{ field: 'limit', code: 'OUT_OF_RANGE' }] })
  })

  it('reports all invalid parameters', () => {
    expect(parse(`q=${'x'.repeat(101)}&offset=-1`)).toEqual({
      errors: [
        { field: 'q', code: 'TOO_LONG' },
        { field: 'offset', code: 'OUT_OF_RANGE' },
      ],
    })
  })
})
