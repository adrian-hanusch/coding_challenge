import { describe, expect, it } from 'vitest'

import { ApiError } from '../../../api/client.ts'
import { failureOf, isInvoiceRejected, isRetryable } from './assignmentFailure.ts'

describe('failureOf', () => {
  it('maps each actionable API error to its own failure', () => {
    expect(failureOf(new ApiError(409, 'PAYMENT_ALREADY_ASSIGNED'))).toBe('alreadyAssigned')
    expect(failureOf(new ApiError(404, 'PAYMENT_NOT_FOUND'))).toBe('paymentNotFound')
    expect(failureOf(new ApiError(409, 'INVOICE_NOT_OPEN'))).toBe('invoiceNotOpen')
    expect(failureOf(new ApiError(422, 'INVOICE_NOT_FOUND'))).toBe('invoiceNotFound')
    expect(failureOf(new ApiError(422, 'SPLIT_SUM_MISMATCH'))).toBe('invalidSplit')
    expect(failureOf(new ApiError(422, 'VALIDATION_FAILED'))).toBe('invalidRequest')
  })

  it('treats server, unknown and network errors as unconfirmed', () => {
    expect(failureOf(new ApiError(500, 'INTERNAL_ERROR'))).toBe('unconfirmed')
    expect(failureOf(new ApiError(502, 'UNKNOWN'))).toBe('unconfirmed')
    expect(failureOf(new TypeError('Failed to fetch'))).toBe('unconfirmed')
  })

  it('treats any other client error as a definite rejection', () => {
    expect(failureOf(new ApiError(400, 'INVALID_QUERY'))).toBe('invalidRequest')
    expect(failureOf(new ApiError(404, 'UNKNOWN'))).toBe('invalidRequest')
  })
})

describe('isInvoiceRejected', () => {
  it('is true only for errors that require another invoice', () => {
    expect(isInvoiceRejected(new ApiError(409, 'INVOICE_NOT_OPEN'))).toBe(true)
    expect(isInvoiceRejected(new ApiError(422, 'INVOICE_NOT_FOUND'))).toBe(true)
    expect(isInvoiceRejected(new ApiError(409, 'PAYMENT_ALREADY_ASSIGNED'))).toBe(false)
    expect(isInvoiceRejected(new ApiError(500, 'INTERNAL_ERROR'))).toBe(false)
  })
})

describe('isRetryable', () => {
  it('allows a retry only when the outcome is unknown', () => {
    expect(isRetryable(new TypeError('Failed to fetch'))).toBe(true)
    expect(isRetryable(new ApiError(500, 'INTERNAL_ERROR'))).toBe(true)
    expect(isRetryable(new ApiError(409, 'PAYMENT_ALREADY_ASSIGNED'))).toBe(false)
    expect(isRetryable(new ApiError(409, 'INVOICE_NOT_OPEN'))).toBe(false)
    expect(isRetryable(new ApiError(422, 'SPLIT_SUM_MISMATCH'))).toBe(false)
    expect(isRetryable(new ApiError(404, 'PAYMENT_NOT_FOUND'))).toBe(false)
  })
})
