import { invoiceHandlers } from './invoices.ts'
import { paymentHandlers } from './payments.ts'

/** Domain handlers shared by the browser worker and the Vitest server. Each one applies the scenario, see scenario.ts. */
export const handlers = [...paymentHandlers, ...invoiceHandlers]
