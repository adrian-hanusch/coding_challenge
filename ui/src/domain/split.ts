import { SPLIT_TYPES, type SplitType } from '../api/types.ts'
import { type AmountInput, isTooPrecise } from '../lib/money.ts'

export type FeeType = Exclude<SplitType, 'MERCHANT_PAYOUT'>
export const FEE_TYPES = SPLIT_TYPES.filter((type): type is FeeType => type !== 'MERCHANT_PAYOUT')

/** What the user entered. */
export interface SplitDraft {
  fees: Record<FeeType, AmountInput>
  /** `null` uses the calculated payout. */
  merchantOverride: AmountInput
}

export const EMPTY_SPLIT_DRAFT: SplitDraft = {
  fees: { PLATFORM_FEE: null, PROVIDER_FEE: null, LOGISTICS_FEE: null },
  merchantOverride: null,
}

export type SplitFieldError = 'missing' | 'tooPrecise'

export type SplitError =
  { code: 'feesExceedPayment'; excess: number } | { code: 'sumMismatch'; total: number; difference: number }

export interface SplitEvaluation {
  /** Payment minus all fees. Negative when the fees exceed the payment. */
  calculatedPayout: number
  /** What the payout field shows: the entered value, else the calculated one unless it is negative. */
  displayedPayout: AmountInput
  isOverridden: boolean
  fieldErrors: Partial<Record<SplitType, SplitFieldError>>
  error: SplitError | null
  /** The amounts once the split has no errors left, i.e. what can be confirmed. */
  validSplit: CompleteSplit | null
}

/** Cents per position. */
export type CompleteSplit = Record<SplitType, number>

const isComplete = (amounts: Record<SplitType, number | null>): amounts is CompleteSplit =>
  SPLIT_TYPES.every((type) => amounts[type] !== null)

const centsOrNull = (amount: AmountInput) => (typeof amount === 'number' ? amount : null)
const centsOf = (amount: AmountInput) => centsOrNull(amount) ?? 0

const calculatePayout = (paymentMinor: number, draft: SplitDraft) =>
  paymentMinor - FEE_TYPES.reduce((sum, type) => sum + centsOf(draft.fees[type]), 0)

function fieldErrorOf(amount: AmountInput): SplitFieldError | undefined {
  if (amount === null) return 'missing'
  if (isTooPrecise(amount)) return 'tooPrecise'
  return undefined
}

/**
 * Fees that are not valid yet count as 0, so the payout updates while the user is still entering fees. The sum is only
 * checked once every field is valid; before that the field errors are the more useful message.
 */
export function evaluateSplit(paymentMinor: number, draft: SplitDraft): SplitEvaluation {
  const calculatedPayout = calculatePayout(paymentMinor, draft)

  const fieldErrors: Partial<Record<SplitType, SplitFieldError>> = {}
  for (const type of FEE_TYPES) {
    const fieldError = fieldErrorOf(draft.fees[type])
    if (fieldError) fieldErrors[type] = fieldError
  }
  if (isTooPrecise(draft.merchantOverride)) fieldErrors.MERCHANT_PAYOUT = 'tooPrecise'

  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  const difference = typeof draft.merchantOverride === 'number' ? calculatedPayout - draft.merchantOverride : 0

  let error: SplitError | null = null
  if (calculatedPayout < 0) error = { code: 'feesExceedPayment', excess: -calculatedPayout }
  else if (!hasFieldErrors && difference !== 0)
    error = { code: 'sumMismatch', total: paymentMinor - difference, difference }

  let displayedPayout: AmountInput = draft.merchantOverride
  if (displayedPayout === null && calculatedPayout >= 0) displayedPayout = calculatedPayout

  const amounts = {
    PLATFORM_FEE: centsOrNull(draft.fees.PLATFORM_FEE),
    PROVIDER_FEE: centsOrNull(draft.fees.PROVIDER_FEE),
    LOGISTICS_FEE: centsOrNull(draft.fees.LOGISTICS_FEE),
    MERCHANT_PAYOUT: centsOrNull(displayedPayout),
  }

  return {
    calculatedPayout,
    displayedPayout,
    isOverridden: draft.merchantOverride !== null,
    fieldErrors,
    error,
    // Without errors every amount is set; `isComplete` only narrows the type.
    validSplit: !hasFieldErrors && error === null && isComplete(amounts) ? amounts : null,
  }
}

export function withFee(draft: SplitDraft, type: FeeType, value: AmountInput): SplitDraft {
  return { ...draft, fees: { ...draft.fees, [type]: value } }
}

/** Entering exactly the calculated value, or clearing the field, goes back to the calculated payout. */
export function withMerchantPayout(draft: SplitDraft, value: AmountInput, paymentMinor: number): SplitDraft {
  return { ...draft, merchantOverride: value === calculatePayout(paymentMinor, draft) ? null : value }
}
