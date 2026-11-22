import { type Invoice, type Money, type PaymentSplit, SPLIT_TYPES, type SplitType } from '../api/types.ts'
import type { CompleteSplit, SplitEvaluation } from './split.ts'

export type AssignmentBlocker = 'invoiceMissing' | 'splitIncomplete' | 'splitUnbalanced'

/** Why the assignment cannot be confirmed yet, in the order the page asks for the input. */
export function assignmentBlockers(invoice: Invoice | null, split: SplitEvaluation): AssignmentBlocker[] {
  const blockers: AssignmentBlocker[] = []
  if (!invoice) blockers.push('invoiceMissing')
  if (split.error) blockers.push('splitUnbalanced')
  else if (!split.validSplit) blockers.push('splitIncomplete')
  return blockers
}

export function toPaymentSplits(split: CompleteSplit, currency: Money['currency']): PaymentSplit[] {
  return SPLIT_TYPES.map((type) => ({ type, amount: { amountMinor: split[type], currency } }))
}

/** Inverse of `toPaymentSplits`. Throws if a type is missing, so a broken response is never shown as a zero amount. */
export function splitOf(splits: readonly PaymentSplit[]): CompleteSplit {
  const amountOf = (type: SplitType) => {
    const split = splits.find((candidate) => candidate.type === type)
    if (!split) throw new Error(`Assignment response has no ${type} split`)
    return split.amount.amountMinor
  }
  return {
    PLATFORM_FEE: amountOf('PLATFORM_FEE'),
    PROVIDER_FEE: amountOf('PROVIDER_FEE'),
    LOGISTICS_FEE: amountOf('LOGISTICS_FEE'),
    MERCHANT_PAYOUT: amountOf('MERCHANT_PAYOUT'),
  }
}
