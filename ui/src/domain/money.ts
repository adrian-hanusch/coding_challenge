/** €1 billion. Far above any real payment, and sums of a few such amounts stay exact integers in a JS number. */
export const MAX_AMOUNT_MINOR = 100_000_000_000

/** More decimals than the currency has cents for. Keeps the typed euros so the field can still show them. */
export interface TooPreciseAmount {
  tooPrecise: number
}

/** Entered amount: cents, `null` for an empty field, or a value that is reported instead of being rounded. */
export type AmountInput = number | null | TooPreciseAmount

export const isTooPrecise = (amount: AmountInput): amount is TooPreciseAmount =>
  typeof amount === 'object' && amount !== null

/** Converts a parsed euro value (`NaN` for an empty field) into cents without rounding away extra decimals. */
export function toAmountInput(euros: number): AmountInput {
  if (Number.isNaN(euros)) return null
  // Compared in decimal, not via `euros * 100`, whose float error grows with the amount (0.29 * 100 = 28.999999999999996).
  if (Number(euros.toFixed(2)) !== euros) return { tooPrecise: euros }
  return Math.round(euros * 100)
}

/** Inverse of `toAmountInput`, `NaN` for an empty field. */
export function toEuros(amount: AmountInput): number {
  if (amount === null) return Number.NaN
  if (isTooPrecise(amount)) return amount.tooPrecise
  return amount / 100
}
