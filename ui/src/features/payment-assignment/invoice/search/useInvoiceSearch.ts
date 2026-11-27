import { useMemo } from 'react'

import { invoiceSearchOptions } from '../../../../api/invoices.ts'
import type { Invoice } from '../../../../api/types.ts'
import { usePagedSearch } from '../../../../lib/usePagedSearch.ts'
import { isExactNumber } from './invoiceInput.ts'

interface UseInvoiceSearchParams {
  query: string
  customerId: string | null
}

export function useInvoiceSearch({ query, customerId }: UseInvoiceSearchParams) {
  const { items: invoices, ...search } = usePagedSearch(query, (q) => invoiceSearchOptions({ q, customerId }))
  const groups = useMemo(() => groupInvoices(invoices, query, customerId), [invoices, query, customerId])

  return { ...search, ...groups, invoices }
}

/** Same priority as the server's ranking: an exact number match, then the sender's invoices, then the rest. */
function groupInvoices(invoices: Invoice[], query: string, customerId: string | null) {
  const exactMatches = invoices.filter((invoice) => isExactNumber(invoice, query))
  const rest = invoices.filter((invoice) => !isExactNumber(invoice, query))
  const isFromSender = (invoice: Invoice) => customerId !== null && invoice.customerId === customerId
  return {
    exactMatches,
    fromSender: rest.filter(isFromSender),
    others: rest.filter((invoice) => !isFromSender(invoice)),
  }
}
