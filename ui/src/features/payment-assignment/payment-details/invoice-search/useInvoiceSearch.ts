import { type InfiniteData, keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { invoiceSearchOptions } from '../../../../api/invoices.ts'
import type { Invoice, Page } from '../../../../api/types.ts'
import { isSelectable } from '../../../../domain/invoice.ts'
import { useDebouncedValue } from '../../../../lib/useDebouncedValue.ts'

const SEARCH_DEBOUNCE_MS = 250

interface InvoiceSearchParams {
  query: string
  customerId: string | null
  enabled: boolean
}

/** Debounced, paged invoice search, split into the sender's invoices and all others. */
export function useInvoiceSearch({ query, customerId, enabled }: InvoiceSearchParams) {
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const { data, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    ...invoiceSearchOptions({ q: debouncedQuery, customerId }),
    placeholderData: keepPreviousData,
    // No request for outdated text, e.g. a just deselected number.
    enabled: enabled && debouncedQuery === query,
  })

  const groups = useMemo(() => groupInvoices(data, customerId), [data, customerId])

  return {
    ...groups,
    isSearching: isFetching && !isFetchingNextPage,
    isLoadingMore: isFetchingNextPage,
    isError,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
    },
  }
}

function groupInvoices(data: InfiniteData<Page<Invoice>> | undefined, customerId: string | null) {
  const invoices = data?.pages.flatMap((page) => page.items) ?? []
  const isFromSender = (invoice: Invoice) => customerId !== null && invoice.customerId === customerId
  const fromSender = invoices.filter(isFromSender)
  const others = invoices.filter((invoice) => !isFromSender(invoice))
  const disabledKeys = invoices.filter((invoice) => !isSelectable(invoice)).map((invoice) => invoice.id)
  return { invoices, fromSender, others, disabledKeys }
}
