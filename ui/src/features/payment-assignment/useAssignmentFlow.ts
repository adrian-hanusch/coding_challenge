import { useState } from 'react'

import type { Invoice, Payment } from '../../api/types.ts'
import { useAssignPayment } from './confirmation/useAssignPayment.ts'
import { useSplitDraft } from './fee-splitter/useSplitDraft.ts'
import type { InvoiceSearchStart } from './invoice/search/InvoiceSearchField.tsx'

interface InvoiceChoice {
  invoice: Invoice | null
  /** How the search field starts while no invoice is chosen. */
  search: InvoiceSearchStart
}

const EMPTY_SEARCH: InvoiceSearchStart = { text: '', autoFocus: false }

/** State of one assignment: the chosen invoice, the split, the open dialog and the request. */
export function useAssignmentFlow(payment: Payment, onAssigned: () => void) {
  const [{ invoice, search }, setInvoiceChoice] = useState<InvoiceChoice>({ invoice: null, search: EMPTY_SEARCH })
  const [isConfirming, setIsConfirming] = useState(false)
  const split = useSplitDraft(payment.amount)
  const { submission, isAssigned } = useAssignPayment(payment, onAssigned)

  return {
    invoice,
    invoiceSearch: search,
    split,
    submission,
    /** The request succeeded; the page is about to leave. */
    isAssigned,
    isConfirming,
    setIsConfirming,
    // A refetch that finds the payment assigned must not pull the open dialog away; submitting then reports it.
    isEditable: payment.status === 'UNMATCHED' || isConfirming,
    selectInvoice: (next: Invoice) => {
      setInvoiceChoice({ invoice: next, search: EMPTY_SEARCH })
    },
    changeInvoice: () => {
      setInvoiceChoice({ invoice: null, search: { text: '', autoFocus: true } })
    },
    rejectInvoice: () => {
      // Keeps the number visible, so the user knows which invoice was rejected.
      setInvoiceChoice((current) => ({
        invoice: null,
        search: { text: current.invoice?.invoiceNumber ?? '', autoFocus: false },
      }))
    },
  }
}
