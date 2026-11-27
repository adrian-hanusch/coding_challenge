import { describe, expect, it } from 'vitest'

import type { Invoice, Page } from '../../api/types.ts'
import { setupNodeMockServer } from '../node.ts'

setupNodeMockServer()

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
