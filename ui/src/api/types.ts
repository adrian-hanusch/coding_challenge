// API contract shared by the client and the mock handlers.

/** Integer cents, e.g. `124900` = €1,249.00. */
export interface Money {
  amountMinor: number
  currency: 'EUR'
}

export type PaymentStatus = 'UNMATCHED' | 'ASSIGNED'
export type InvoiceStatus = 'OPEN' | 'PAID'

export const SPLIT_TYPES = ['PLATFORM_FEE', 'PROVIDER_FEE', 'LOGISTICS_FEE', 'MERCHANT_PAYOUT'] as const
export type SplitType = (typeof SPLIT_TYPES)[number]

export interface Payment {
  id: string
  amount: Money
  senderName: string
  referenceNumber: string
  customerId: string | null
  /** ISO 8601 */
  receivedAt: string
  status: PaymentStatus
}

/** `merchantId` is resolved to `{ id, name }` so search results can show the merchant without a second request. */
export interface Invoice {
  id: string
  /** e.g. "418" */
  invoiceNumber: string
  merchant: { id: string; name: string }
  customerId: string
  amount: Money
  status: InvoiceStatus
  /** ISO 8601 date */
  dueDate: string
}

export interface PaymentSplit {
  type: SplitType
  amount: Money
}

export interface PaymentAssignment {
  paymentId: string
  invoiceId: string
  /** Exactly 4, one per SplitType, summing up to the payment amount. */
  splits: PaymentSplit[]
}

export interface CreateAssignmentRequest {
  invoiceId: string
  splits: PaymentSplit[]
}

/** Longer search texts are rejected with INVALID_QUERY. */
export const MAX_SEARCH_LENGTH = 100

export interface Page<T> {
  items: T[]
  /** Number of all matches, independent of offset and limit. */
  total: number
  offset: number
  limit: number
}

export type ApiErrorCode =
  | 'PAYMENT_NOT_FOUND'
  | 'INVOICE_NOT_FOUND'
  | 'INVALID_QUERY'
  | 'PAYMENT_ALREADY_ASSIGNED'
  | 'INVOICE_NOT_OPEN'
  | 'VALIDATION_FAILED'
  | 'SPLIT_SUM_MISMATCH'
  | 'INTERNAL_ERROR'

export interface FieldError {
  field: string
  code: string
}

/** RFC 9457 problem details. The UI maps `code` to a message id and never shows `title`. */
export interface ApiProblem {
  status: number
  code: ApiErrorCode
  title: string
  errors?: FieldError[]
}
