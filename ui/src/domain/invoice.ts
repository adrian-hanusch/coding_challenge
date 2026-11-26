import type { Invoice, Money } from '../api/types.ts'

/** Payment minus invoice amount. Positive when the payment is higher. */
export const invoiceDifference = (payment: Money, invoice: Invoice) => payment.amountMinor - invoice.amount.amountMinor
