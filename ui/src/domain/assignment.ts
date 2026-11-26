import { type Money, type PaymentSplit, SPLIT_TYPES } from '../api/types.ts'
import type { CompleteSplit } from './split.ts'

export function toPaymentSplits(split: CompleteSplit, currency: Money['currency']): PaymentSplit[] {
  return SPLIT_TYPES.map((type) => ({ type, amount: { amountMinor: split[type], currency } }))
}
