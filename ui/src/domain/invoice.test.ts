import { describe, expect, it } from 'vitest'

import type { Invoice } from '../api/types.ts'
import { invoiceDifference } from './invoice.ts'

const PAYMENT = 124900

const INVOICE: Invoice = {
  id: 'inv-418',
  invoiceNumber: '418',
  merchant: { id: 'm-1', name: 'Merchant' },
  customerId: 'c-1',
  amount: { amountMinor: PAYMENT, currency: 'EUR' },
  status: 'OPEN',
  dueDate: '2026-12-01',
}

describe('invoiceDifference', () => {
  it('is positive when the payment is higher than the invoice', () => {
    const lower = { ...INVOICE, amount: { amountMinor: PAYMENT - 5000, currency: 'EUR' as const } }
    expect(invoiceDifference({ amountMinor: PAYMENT, currency: 'EUR' }, lower)).toBe(5000)
  })
})
