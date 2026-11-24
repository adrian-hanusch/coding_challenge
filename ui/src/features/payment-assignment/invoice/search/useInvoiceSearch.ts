import { useMemo } from 'react'

import { invoiceSearchOptions } from '../../../../api/invoices.ts'
import type { Invoice } from '../../../../api/types.ts'
import { isSelectable } from '../../../../domain/invoice.ts'
import { usePagedSearch } from '../../../../lib/usePagedSearch.ts'

interface UseInvoiceSearchParams {
  query: string
  customerId: string | null
  enabled: boolean
}

export function useInvoiceSearch({ query, customerId, enabled }: UseInvoiceSearchParams) {
  const { items: invoices, ...search } = usePagedSearch(query, (q) => invoiceSearchOptions({ q, customerId }), {
    enabled,
  })
  const groups = useMemo(() => groupInvoices(invoices, customerId), [invoices, customerId])

  return { ...search, ...groups, invoices }
}

function groupInvoices(invoices: Invoice[], customerId: string | null) {
  const isFromSender = (invoice: Invoice) => customerId !== null && invoice.customerId === customerId
  const fromSender = invoices.filter(isFromSender)
  const others = invoices.filter((invoice) => !isFromSender(invoice))
  const disabledKeys = invoices.filter((invoice) => !isSelectable(invoice)).map((invoice) => invoice.id)
  return { fromSender, others, disabledKeys }
}
