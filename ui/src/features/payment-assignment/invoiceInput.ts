import type { Invoice } from '../../api/types.ts'
import { isSelectable } from '../../domain/invoice.ts'

export type InvoiceInputError =
  | { code: 'missing' }
  | { code: 'notFound'; query: string }
  | { code: 'notOpen'; invoice: Invoice }
  | { code: 'searchFailed' }

export type InvoiceInputResolution = { invoice: Invoice } | { error: InvoiceInputError }

/**
 * `candidates` is the first search page for the trimmed `query`; an exact number match ranks first.
 * Without an exact match, text that matches nothing is reported as not found, otherwise the user has to pick from the list.
 */
export function resolveInvoiceInput(query: string, candidates: readonly Invoice[]): InvoiceInputResolution {
  const exact = candidates.find((invoice) => invoice.invoiceNumber.toLowerCase() === query.toLowerCase())

  if (exact) return isSelectable(exact) ? { invoice: exact } : { error: { code: 'notOpen', invoice: exact } }
  if (candidates.length === 0) return { error: { code: 'notFound', query } }
  return { error: { code: 'missing' } }
}
