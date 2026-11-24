import { describe, expect, it } from 'vitest'

import type { Invoice } from '../api/types.ts'
import { assignmentBlockers, toPaymentSplits } from './assignment.ts'
import { invoiceDifference } from './invoice.ts'
import { evaluateSplit, INITIAL_SPLIT_DRAFT, type SplitDraft } from './split.ts'

const PAYMENT = 124900
const COMPLETE_FEES = { PLATFORM_FEE: 6245, PROVIDER_FEE: 1874, LOGISTICS_FEE: 1490 }
const SPLIT = { ...COMPLETE_FEES, MERCHANT_PAYOUT: 115291 }

const INVOICE: Invoice = {
  id: 'inv-418',
  invoiceNumber: '418',
  merchant: { id: 'm-1', name: 'Merchant' },
  customerId: 'c-1',
  amount: { amountMinor: PAYMENT, currency: 'EUR' },
  status: 'OPEN',
  dueDate: '2026-12-01',
}

const evaluate = (fees: Partial<SplitDraft['fees']>, merchantOverride: SplitDraft['merchantOverride'] = null) =>
  evaluateSplit(PAYMENT, { fees: { ...INITIAL_SPLIT_DRAFT.fees, ...fees }, merchantOverride })

describe('assignmentBlockers', () => {
  it('reports nothing once an invoice is selected and the split balances', () => {
    expect(assignmentBlockers(INVOICE, evaluate(COMPLETE_FEES))).toEqual([])
  })

  it('reports a missing invoice and an incomplete split', () => {
    expect(assignmentBlockers(null, evaluate({ PLATFORM_FEE: null }))).toEqual(['invoiceMissing', 'splitIncomplete'])
  })

  it('reports an unbalanced split instead of an incomplete one', () => {
    expect(assignmentBlockers(INVOICE, evaluate({ PLATFORM_FEE: 130000 }))).toEqual(['splitUnbalanced'])
    expect(assignmentBlockers(INVOICE, evaluate(COMPLETE_FEES, 100000))).toEqual(['splitUnbalanced'])
  })
})

describe('invoiceDifference', () => {
  it('is positive when the payment is higher than the invoice', () => {
    const lower = { ...INVOICE, amount: { amountMinor: PAYMENT - 5000, currency: 'EUR' as const } }
    expect(invoiceDifference({ amountMinor: PAYMENT, currency: 'EUR' }, lower)).toBe(5000)
  })
})

describe('toPaymentSplits', () => {
  it('builds one split per type', () => {
    const splits = toPaymentSplits(SPLIT, 'EUR')

    expect(splits).toEqual([
      { type: 'PLATFORM_FEE', amount: { amountMinor: 6245, currency: 'EUR' } },
      { type: 'PROVIDER_FEE', amount: { amountMinor: 1874, currency: 'EUR' } },
      { type: 'LOGISTICS_FEE', amount: { amountMinor: 1490, currency: 'EUR' } },
      { type: 'MERCHANT_PAYOUT', amount: { amountMinor: 115291, currency: 'EUR' } },
    ])
  })
})
