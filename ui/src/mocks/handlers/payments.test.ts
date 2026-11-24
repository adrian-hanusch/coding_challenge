import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Page, Payment } from '../../api/types.ts'
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

const search = (query: string) => fetch(`http://localhost/api/payments?${query}`)

async function searchIds(query: string) {
  const page = (await (await search(`status=UNMATCHED&${query}`)).json()) as Page<Payment>
  return page.items.map((payment) => payment.id)
}

describe('GET /payments', () => {
  it('lists unmatched payments, oldest first', async () => {
    expect(await searchIds('')).toEqual(['pay-exact', 'pay-mismatch', 'pay-unknown-sender', 'pay-many-invoices'])
  })

  it.each([
    ['sender', 'weber', 'pay-unknown-sender'],
    ['reference', '55813', 'pay-mismatch'],
    ['id', 'PAY-MANY', 'pay-many-invoices'],
  ])('matches the %s', async (_field, q, id) => {
    expect(await searchIds(`q=${q}`)).toEqual([id])
  })

  it('pages through the results', async () => {
    expect(await searchIds('offset=1&limit=2')).toEqual(['pay-mismatch', 'pay-unknown-sender'])
  })

  it.each(['', 'status=', 'status=ASSIGNED'])('rejects the query "%s" without status UNMATCHED', async (query) => {
    const response = await search(query)

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      code: 'INVALID_QUERY',
      errors: [{ field: 'status', code: 'INVALID_STATUS' }],
    })
  })
})
