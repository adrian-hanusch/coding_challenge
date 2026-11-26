import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { invoiceSearchOptions } from '../../../../api/invoices.ts'
import { type InvoiceInputResolution, resolveInvoiceInput, SEARCH_FAILED } from './invoiceInput.ts'

/**
 * `track` every text change and selection: `lookup` returns `null` once the text has changed, e.g. after React Aria
 * selected an entry in the same Enter key event.
 */
export function useInvoiceNumberLookup(customerId: string | null, initialText: string) {
  const queryClient = useQueryClient()
  const latestText = useRef(initialText)
  const isMounted = useRef(false)

  // A lookup that outlives the field must not select an invoice later.
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  function track(text: string) {
    latestText.current = text
  }

  async function lookup(query: string): Promise<InvoiceInputResolution | null> {
    const isCurrent = () => isMounted.current && latestText.current.trim() === query
    if (!isCurrent()) return null
    try {
      const result = await queryClient.infiniteQuery(invoiceSearchOptions({ q: query, customerId }))
      return isCurrent() ? resolveInvoiceInput(query, result.pages[0]?.items ?? []) : null
    } catch {
      return isCurrent() ? { error: SEARCH_FAILED } : null
    }
  }

  return { track, lookup }
}
