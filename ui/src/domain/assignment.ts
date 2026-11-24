import { type Invoice, type Money, type PaymentSplit, SPLIT_TYPES } from '../api/types.ts'
import { type CompleteSplit, type SplitEvaluation } from './split.ts'

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
