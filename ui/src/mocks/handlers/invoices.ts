import { http, HttpResponse } from 'msw'
import {
  DEFAULT_INVOICE_LIMIT,
  type FieldError,
  type Invoice,
  type InvoiceSearchParams,
  type Page,
} from '../../api/types.ts'
import { db } from '../db.ts'
import { problem } from '../problem.ts'
import { withScenario } from '../scenario.ts'

const MAX_LIMIT = 50
const MAX_QUERY_LENGTH = 100

type ParsedSearch = Required<InvoiceSearchParams>

function parseInteger(value: string | null, fallback: number, min: number, max: number): number | null {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return parsed >= min && parsed <= max ? parsed : null
}

function parseSearch(searchParams: URLSearchParams): { search: ParsedSearch } | { errors: FieldError[] } {
  // Trimmed here, so the length check and the search see the same value.
  const q = (searchParams.get('q') ?? '').trim()
  const offset = parseInteger(searchParams.get('offset'), 0, 0, Number.MAX_SAFE_INTEGER)
  const limit = parseInteger(searchParams.get('limit'), DEFAULT_INVOICE_LIMIT, 1, MAX_LIMIT)

  const errors: FieldError[] = []
  if (q.length > MAX_QUERY_LENGTH) errors.push({ field: 'q', code: 'TOO_LONG' })
  if (offset === null) errors.push({ field: 'offset', code: 'OUT_OF_RANGE' })
  if (limit === null) errors.push({ field: 'limit', code: 'OUT_OF_RANGE' })
  if (offset === null || limit === null || errors.length > 0) return { errors }

  // An empty `customerId=` means no customer, like a missing parameter.
  const customerId = searchParams.get('customerId')
  return { search: { q, customerId: customerId === '' ? null : customerId, offset, limit } }
}

/**
 * Matches invoice number and merchant name (A5). Returns all statuses, so the UI can tell
 * "not found" from "already paid". The order is total, so pages never overlap:
 * exact number match, the customer's invoices, OPEN first, due date, invoice number.
 */
function searchInvoices(invoices: readonly Invoice[], { q, customerId, offset, limit }: ParsedSearch): Page<Invoice> {
  const needle = q.toLowerCase()
  // The three ranking flags as one number, most significant first.
  const rank = (invoice: Invoice) =>
    (invoice.invoiceNumber.toLowerCase() === needle ? 0 : 4) +
    (customerId !== null && invoice.customerId === customerId ? 0 : 2) +
    (invoice.status === 'OPEN' ? 0 : 1)

  const matches = invoices
    .filter(
      (invoice) =>
        needle === '' ||
        invoice.invoiceNumber.toLowerCase().includes(needle) ||
        invoice.merchant.name.toLowerCase().includes(needle),
    )
    .map((invoice) => ({ invoice, rank: rank(invoice) }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.invoice.dueDate.localeCompare(b.invoice.dueDate) ||
        a.invoice.invoiceNumber.localeCompare(b.invoice.invoiceNumber),
    )

  const items = matches.slice(offset, offset + limit).map(({ invoice }) => invoice)
  return { items, total: matches.length, offset, limit }
}

export const invoiceHandlers = [
  http.get(
    '/api/invoices',
    withScenario('search', ({ request }) => {
      const parsed = parseSearch(new URL(request.url).searchParams)
      if ('errors' in parsed) return problem(400, 'INVALID_QUERY', 'Invalid search parameters', parsed.errors)
      return HttpResponse.json(searchInvoices(db.listInvoices(), parsed.search))
    }),
  ),
]
