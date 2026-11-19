import { infiniteQueryOptions } from '@tanstack/react-query'
import { apiFetch } from './client.ts'
import { DEFAULT_INVOICE_LIMIT, type Invoice, type InvoiceSearchParams, type Page } from './types.ts'

type InvoiceSearch = Omit<InvoiceSearchParams, 'offset'>

export const invoiceKeys = {
  all: ['invoices'] as const,
  search: (search: Required<InvoiceSearch>) => [...invoiceKeys.all, 'search', search] as const,
}

export function fetchInvoices({ q, customerId, offset, limit }: Required<InvoiceSearchParams>, signal?: AbortSignal) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  if (q) params.set('q', q)
  if (customerId) params.set('customerId', customerId)
  return apiFetch<Page<Invoice>>(`/invoices?${params.toString()}`, { signal })
}

/** Paged search for the autocomplete. The next offset comes from the last page. */
export function invoiceSearchOptions({ q = '', customerId = null, limit = DEFAULT_INVOICE_LIMIT }: InvoiceSearch) {
  return infiniteQueryOptions({
    queryKey: invoiceKeys.search({ q, customerId, limit }),
    queryFn: ({ pageParam, signal }) => fetchInvoices({ q, customerId, offset: pageParam, limit }, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const next = last.offset + last.items.length
      return next < last.total ? next : undefined
    },
  })
}
