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

// Tolerates the float error of `euros * 100`, e.g. 0.29 * 100 = 28.999999999999996.
const CENT_EPSILON = 1e-6

/** Converts a parsed euro value (`NaN` for an empty field) into cents without rounding away extra decimals. */
export function toAmountInput(euros: number): AmountInput {
  if (Number.isNaN(euros)) return null
  const cents = Math.round(euros * 100)
  return Math.abs(euros * 100 - cents) < CENT_EPSILON ? cents : { tooPrecise: euros }
}

/**
 * Removes the currency symbol, the currency code and spaces from pasted text such as "1.249,00 €" or "EUR 62.45".
 * The field shows the currency as a suffix and only parses plain numbers, so it would reject such text as a whole.
 */
export function stripCurrency(text: string, symbol: string, currency: string): string {
  return [symbol, currency].reduce((rest, token) => rest.split(token).join(''), text).replace(/\s/g, '')
}

/** Inverse of `toAmountInput`, `NaN` for an empty field. */
export function toEuros(amount: AmountInput): number {
  if (amount === null) return Number.NaN
  if (isTooPrecise(amount)) return amount.tooPrecise
  return amount / 100
}
