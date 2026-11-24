import { http, HttpResponse } from 'msw'

import {
  type FieldError,
  type Page,
  type Payment,
  type PaymentSplit,
  SPLIT_TYPES,
  type SplitType,
} from '../../api/types.ts'
import { db } from '../db.ts'
import { problem } from '../problem.ts'
import { withScenario } from '../scenario.ts'
import { pageOf, type PageQuery, parsePageQuery } from '../searchParams.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSplitType(value: unknown): value is SplitType {
  return SPLIT_TYPES.includes(value as SplitType)
}

/** Exactly one split per type, each a non-negative integer amount in EUR. */
function validateSplits(raw: unknown[]): { splits: PaymentSplit[] } | { errors: FieldError[] } {
  if (raw.length !== SPLIT_TYPES.length) return { errors: [{ field: 'splits', code: 'SPLIT_COUNT' }] }

  const errors: FieldError[] = []
  const splits: PaymentSplit[] = []
  const seen = new Set<SplitType>()

  raw.forEach((split, index) => {
    const field = `splits[${String(index)}]`
    const type = isRecord(split) ? split.type : undefined
    const amount = isRecord(split) && isRecord(split.amount) ? split.amount : undefined

    if (!isSplitType(type)) errors.push({ field: `${field}.type`, code: 'INVALID_SPLIT_TYPE' })
    else if (seen.has(type)) errors.push({ field: `${field}.type`, code: 'DUPLICATE_SPLIT_TYPE' })
    else seen.add(type)

    const amountMinor = amount?.amountMinor
    if (typeof amountMinor !== 'number' || !Number.isSafeInteger(amountMinor) || amountMinor < 0) {
      errors.push({ field: `${field}.amount.amountMinor`, code: 'INVALID_AMOUNT' })
    }
    if (amount?.currency !== 'EUR') errors.push({ field: `${field}.amount.currency`, code: 'UNSUPPORTED_CURRENCY' })

    if (isSplitType(type) && typeof amountMinor === 'number') {
      splits.push({ type, amount: { amountMinor, currency: 'EUR' } })
    }
  })

  return errors.length > 0 ? { errors } : { splits }
}

function parseSearch(searchParams: URLSearchParams): { query: PageQuery } | { errors: FieldError[] } {
  if (searchParams.get('status') !== 'UNMATCHED') return { errors: [{ field: 'status', code: 'INVALID_STATUS' }] }
  return parsePageQuery(searchParams)
}

/**
 * Matches id, sender and reference. The order is total, so pages never overlap:
 * exact id match, then the oldest payment first, as it has waited longest.
 */
function searchUnmatchedPayments(payments: readonly Payment[], query: PageQuery): Page<Payment> {
  const needle = query.q.toLowerCase()
  const matches = payments
    .filter((payment) => payment.status === 'UNMATCHED')
    .filter(
      (payment) =>
        needle === '' ||
        [payment.id, payment.senderName, payment.referenceNumber].some((text) => text.toLowerCase().includes(needle)),
    )
    .sort(
      (a, b) =>
        Number(b.id.toLowerCase() === needle) - Number(a.id.toLowerCase() === needle) ||
        a.receivedAt.localeCompare(b.receivedAt) ||
        a.id.localeCompare(b.id),
    )

  return pageOf(matches, query)
}

export const paymentHandlers = [
  http.get(
    '/api/payments',
    withScenario('paymentSearch', ({ request }) => {
      const parsed = parseSearch(new URL(request.url).searchParams)
      if ('errors' in parsed) return problem(400, 'INVALID_QUERY', 'Invalid search parameters', parsed.errors)
      return HttpResponse.json(searchUnmatchedPayments(db.listPayments(), parsed.query))
    }),
  ),

  http.get(
    '/api/payments/:paymentId',
    withScenario<{ paymentId: string }>('payment', ({ params }) => {
      const payment = db.findPayment(params.paymentId)
      if (!payment) return problem(404, 'PAYMENT_NOT_FOUND', `Payment ${params.paymentId} not found`)
      return HttpResponse.json(payment)
    }),
  ),

  http.post(
    '/api/payments/:paymentId/assignment',
    withScenario<{ paymentId: string }>('assignment', async ({ params, request }) => {
      // Read the body first: from here on everything runs synchronously, so two concurrent requests
      // cannot both pass the UNMATCHED check before one of them assigns.
      const body: unknown = await request.json().catch(() => null)

      const payment = db.findPayment(params.paymentId)
      if (!payment) return problem(404, 'PAYMENT_NOT_FOUND', `Payment ${params.paymentId} not found`)
      if (payment.status !== 'UNMATCHED') {
        return problem(409, 'PAYMENT_ALREADY_ASSIGNED', `Payment ${payment.id} is already assigned`)
      }

      if (!isRecord(body) || typeof body.invoiceId !== 'string' || !Array.isArray(body.splits)) {
        return problem(422, 'VALIDATION_FAILED', 'Request body must contain invoiceId and splits', [
          { field: 'body', code: 'INVALID_BODY' },
        ])
      }

      const invoice = db.findInvoice(body.invoiceId)
      if (!invoice) return problem(422, 'INVOICE_NOT_FOUND', `Invoice ${body.invoiceId} not found`)
      if (invoice.status !== 'OPEN') {
        return problem(409, 'INVOICE_NOT_OPEN', `Invoice ${invoice.invoiceNumber} is not open`)
      }

      const result = validateSplits(body.splits)
      if ('errors' in result) return problem(422, 'VALIDATION_FAILED', 'Invalid splits', result.errors)

      const total = result.splits.reduce((sum, split) => sum + split.amount.amountMinor, 0)
      if (total !== payment.amount.amountMinor) {
        return problem(422, 'SPLIT_SUM_MISMATCH', 'The splits do not add up to the payment amount', [
          { field: 'splits', code: 'SPLIT_SUM_MISMATCH' },
        ])
      }

      return HttpResponse.json(db.assign(payment.id, invoice.id, result.splits), { status: 201 })
    }),
  ),
]
