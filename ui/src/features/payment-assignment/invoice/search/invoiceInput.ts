import type { Invoice } from '../../../../api/types.ts'

export type InvoiceInputError = { code: 'missing' } | { code: 'notFound'; query: string } | { code: 'searchFailed' }

export const MISSING: InvoiceInputError = { code: 'missing' }
export const SEARCH_FAILED: InvoiceInputError = { code: 'searchFailed' }

export type InvoiceInputResolution = { invoice: Invoice } | { error: InvoiceInputError }

export const isExactNumber = (invoice: Invoice, query: string) =>
  query !== '' && invoice.invoiceNumber.toLowerCase() === query.toLowerCase()

/**
 * `candidates` is the first search page for the trimmed `query`, only open invoices; an exact number match ranks first.
 * Without an exact match, text that matches nothing is reported as not found, otherwise the user has to pick from the list.
 */
export function resolveInvoiceInput(query: string, candidates: readonly Invoice[]): InvoiceInputResolution {
  const exact = candidates.find((invoice) => isExactNumber(invoice, query))

  if (exact) return { invoice: exact }
  if (candidates.length === 0) return { error: { code: 'notFound', query } }
  return { error: MISSING }
}
