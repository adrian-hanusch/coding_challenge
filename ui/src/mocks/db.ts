import type { Invoice, Payment, PaymentAssignment, PaymentSplit } from '../api/types.ts'
import { ASSIGNMENTS, INVOICES, PAYMENTS } from './fixtures.ts'

interface MockState {
  payments: Payment[]
  invoices: Invoice[]
  assignments: PaymentAssignment[]
}

function seed(): MockState {
  return structuredClone({ payments: PAYMENTS, invoices: INVOICES, assignments: ASSIGNMENTS }) as MockState
}

let state = seed()

/**
 * In-memory backend state. Reads return read-only views; responses are serialized anyway.
 * It lives as long as the page, so a reload starts from the fixtures again.
 */
export const db = {
  reset() {
    state = seed()
  },

  findPayment(id: string): Readonly<Payment> | undefined {
    return state.payments.find((payment) => payment.id === id)
  },

  listPayments(): readonly Payment[] {
    return state.payments
  },

  findInvoice(id: string): Readonly<Invoice> | undefined {
    return state.invoices.find((invoice) => invoice.id === id)
  },

  listInvoices(): readonly Invoice[] {
    return state.invoices
  },

  /**
   * Stores the assignment, marks the payment as assigned and the invoice as paid (the backend decides).
   * A paid invoice is no longer OPEN, which keeps it from being assigned twice.
   */
  assign(paymentId: string, invoiceId: string, splits: PaymentSplit[]): PaymentAssignment {
    const assignment: PaymentAssignment = { paymentId, invoiceId, splits }
    state.assignments.push(assignment)
    state.payments = state.payments.map((payment) =>
      payment.id === paymentId ? { ...payment, status: 'ASSIGNED' } : payment,
    )
    state.invoices = state.invoices.map((invoice) =>
      invoice.id === invoiceId ? { ...invoice, status: 'PAID' } : invoice,
    )
    return assignment
  },
}
