import type { Invoice, Money } from '../api/types.ts'

/** Only open invoices can be assigned. */
export const isSelectable = (invoice: Invoice) => invoice.status === 'OPEN'

/** Payment minus invoice amount. Positive when the payment is higher. */
export const invoiceDifference = (payment: Money, invoice: Invoice) => payment.amountMinor - invoice.amount.amountMinor
