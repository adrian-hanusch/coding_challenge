import type { Invoice } from '../api/types.ts'

/** Only open invoices can be assigned. */
export const isSelectable = (invoice: Invoice) => invoice.status === 'OPEN'
