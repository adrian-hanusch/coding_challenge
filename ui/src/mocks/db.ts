import type { Invoice, Payment, PaymentAssignment, PaymentSplit } from '../api/types.ts'
import { ASSIGNMENTS, INVOICES, PAYMENTS } from './fixtures.ts'
import { readJson } from './storage.ts'

interface MockState {
  payments: Payment[]
  invoices: Invoice[]
  assignments: PaymentAssignment[]
}

// Bump when the fixtures change, so a stale state in sessionStorage is discarded.
const STATE_VERSION = 2
const STORAGE_KEY = 'mock:db'

function seed(): MockState {
  return structuredClone({ payments: PAYMENTS, invoices: INVOICES, assignments: ASSIGNMENTS }) as MockState
}

let state = seed()
let storage: Storage | null = null

function persist() {
  storage?.setItem(STORAGE_KEY, JSON.stringify({ version: STATE_VERSION, state }))
}

/**
 * In-memory backend state. Reads return read-only views; responses are serialized anyway.
 * Without `enablePersistence` (Vitest), the state lives only as long as the module.
 */
export const db = {
  /** Keeps the state across reloads, so a confirmed payment stays assigned (browser only). */
  enablePersistence(target: Storage) {
    storage = target
    const stored = readJson(target, STORAGE_KEY) as { version: number; state: MockState } | null
    if (stored?.version === STATE_VERSION) state = stored.state
    else persist()
  },

  reset() {
    state = seed()
    persist()
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
    persist()
    return assignment
  },
}
