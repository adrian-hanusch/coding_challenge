import { ApiError } from '../../../api/client.ts'

/** `unconfirmed`: no usable answer (network error, 5xx), so the assignment may or may not have been stored. */
export type AssignmentFailure =
  'alreadyAssigned' | 'invoiceNotOpen' | 'invoiceNotFound' | 'invalidSplit' | 'invalidRequest' | 'unconfirmed'

export function failureOf(error: Error): AssignmentFailure {
  if (!(error instanceof ApiError)) return 'unconfirmed'
  switch (error.code) {
    case 'PAYMENT_ALREADY_ASSIGNED':
      return 'alreadyAssigned'
    case 'INVOICE_NOT_OPEN':
      return 'invoiceNotOpen'
    case 'INVOICE_NOT_FOUND':
      return 'invoiceNotFound'
    case 'SPLIT_SUM_MISMATCH':
      return 'invalidSplit'
    case 'VALIDATION_FAILED':
      return 'invalidRequest'
    default:
      return 'unconfirmed'
  }
}

export const isInvoiceRejected = (error: Error) => {
  const failure = failureOf(error)
  return failure === 'invoiceNotOpen' || failure === 'invoiceNotFound'
}

/** A retry is safe: the server stores an assignment only once and answers PAYMENT_ALREADY_ASSIGNED otherwise. */
export const isRetryable = (error: Error) => failureOf(error) === 'unconfirmed'
