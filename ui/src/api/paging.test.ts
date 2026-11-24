import { describe, expect, it } from 'vitest'

import { pagedSearchOptions } from './paging.ts'
import type { Page } from './types.ts'

describe('pagedSearchOptions', () => {
  const options = pagedSearchOptions<number>(['test'], () => Promise.reject(new Error('not used')))
  const nextOffset = (last: Page<number>) => options.getNextPageParam(last, [last], last.offset, [last.offset])

  it('continues after the last loaded item', () => {
    expect(nextOffset({ items: [1, 2], total: 5, offset: 2, limit: 2 })).toBe(4)
  })

  it('stops once all items are loaded', () => {
    expect(nextOffset({ items: [5], total: 5, offset: 4, limit: 2 })).toBeUndefined()
    expect(nextOffset({ items: [], total: 0, offset: 0, limit: 2 })).toBeUndefined()
  })
})
