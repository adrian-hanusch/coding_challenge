import { useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { invoiceSearchOptions } from '../../../../api/invoices.ts'
import { type InvoiceInputResolution, resolveInvoiceInput } from './invoiceInput.ts'

/**
 * `track` every text change and selection: `lookup` returns `null` once the text has changed, e.g. after React Aria
 * selected an entry in the same Enter key event.
 */
export function useInvoiceNumberLookup(customerId: string | null) {
  const queryClient = useQueryClient()
  const latestText = useRef('')

  function track(text: string) {
    latestText.current = text
  }

  async function lookup(query: string): Promise<InvoiceInputResolution | null> {
    const isCurrent = () => latestText.current.trim() === query
    if (!isCurrent()) return null
    try {
      const result = await queryClient.infiniteQuery(invoiceSearchOptions({ q: query, customerId }))
      return isCurrent() ? resolveInvoiceInput(query, result.pages[0]?.items ?? []) : null
    } catch {
      return isCurrent() ? { error: { code: 'searchFailed' } } : null
    }
  }

  return { track, lookup }
}
