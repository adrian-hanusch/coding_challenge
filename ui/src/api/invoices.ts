import { apiFetch } from './client.ts'
import { pagedSearchOptions } from './paging.ts'
import type { Invoice, Page } from './types.ts'

interface InvoiceSearch {
  q: string
  customerId: string | null
}

export const invoiceKeys = {
  all: ['invoices'] as const,
  search: (search: InvoiceSearch) => [...invoiceKeys.all, 'search', search] as const,
}

function fetchInvoices({ q, customerId }: InvoiceSearch, offset: number, signal: AbortSignal) {
  const params = new URLSearchParams({ offset: String(offset) })
  if (q) params.set('q', q)
  if (customerId) params.set('customerId', customerId)
  return apiFetch<Page<Invoice>>(`/invoices?${params.toString()}`, { signal })
}

export function invoiceSearchOptions(search: InvoiceSearch) {
  return pagedSearchOptions(invoiceKeys.search(search), (offset, signal) => fetchInvoices(search, offset, signal))
}
