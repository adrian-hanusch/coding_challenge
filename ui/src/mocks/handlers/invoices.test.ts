import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Invoice, Page } from '../../api/types.ts'
import { server } from '../node.ts'

beforeAll(() => {
  // MSW resolves the relative handler paths against the location, which Node does not have.
  vi.stubGlobal('location', new URL('http://localhost/'))
  server.listen()
})

afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})

async function search(query: string) {
  return (await (await fetch(`http://localhost/api/invoices?${query}`)).json()) as Page<Invoice>
}

describe('GET /invoices', () => {
  it('returns only open invoices', async () => {
    const page = await search('limit=50')
    expect(page.items).toHaveLength(page.total)
    expect(page.items.every((invoice) => invoice.status === 'OPEN')).toBe(true)
  })

  it('does not find a paid invoice by its number', async () => {
    expect((await search('q=420')).items).toEqual([])
  })
})
