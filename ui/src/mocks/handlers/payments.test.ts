import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Page, Payment } from '../../api/types.ts'
import { db } from '../db.ts'
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

describe('POST /payments/:paymentId/assignment', () => {
  afterEach(() => {
    db.reset()
  })

  const invoiceId = () => db.listInvoices().find(({ invoiceNumber }) => invoiceNumber === '418')?.id
  const splits = (payout: number) => [
    { type: 'PLATFORM_FEE', amount: { amountMinor: 0, currency: 'EUR' } },
    { type: 'PROVIDER_FEE', amount: { amountMinor: 0, currency: 'EUR' } },
    { type: 'LOGISTICS_FEE', amount: { amountMinor: 124900 - payout, currency: 'EUR' } },
    { type: 'MERCHANT_PAYOUT', amount: { amountMinor: payout, currency: 'EUR' } },
  ]
  const assign = (payout: number) =>
    fetch('http://localhost/api/payments/pay-exact/assignment', {
      method: 'POST',
      body: JSON.stringify({ invoiceId: invoiceId(), splits: splits(payout) }),
    })

  it('answers a repeated identical request with the stored assignment', async () => {
    expect((await assign(124900)).status).toBe(201)

    const repeated = await assign(124900)

    expect(repeated.status).toBe(200)
    expect(await repeated.json()).toEqual({ paymentId: 'pay-exact', invoiceId: invoiceId(), splits: splits(124900) })
  })

  it('rejects a different request once the payment is assigned', async () => {
    expect((await assign(124900)).status).toBe(201)

    const different = await assign(120000)

    expect(different.status).toBe(409)
    expect(await different.json()).toMatchObject({ code: 'PAYMENT_ALREADY_ASSIGNED' })
  })
})
