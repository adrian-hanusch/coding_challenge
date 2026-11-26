import { http, HttpResponse } from 'msw'

import { type FieldError, type Invoice, type Page } from '../../api/types.ts'
import { db } from '../db.ts'
import { problem } from '../problem.ts'
import { withScenario } from '../scenario.ts'
import { pageOf, type PageQuery, parsePageQuery } from '../searchParams.ts'

interface InvoiceSearch extends PageQuery {
  /** Ranks this customer's invoices first. Does not filter. */
  customerId: string | null
}

function parseSearch(searchParams: URLSearchParams): { search: InvoiceSearch } | { errors: FieldError[] } {
  const parsed = parsePageQuery(searchParams)
  if ('errors' in parsed) return parsed

  // An empty `customerId=` means no customer, like a missing parameter.
  const customerId = searchParams.get('customerId')
  return { search: { ...parsed.query, customerId: customerId === '' ? null : customerId } }
}

/**
 * Matches invoice number and merchant name of open invoices, the only ones a payment can be assigned to.
 * The order is total, so pages never overlap: exact number match, the customer's invoices, due date, invoice number.
 */
function searchInvoices(invoices: readonly Invoice[], search: InvoiceSearch): Page<Invoice> {
  const { customerId } = search
  const needle = search.q.toLowerCase()
  // The two ranking flags as one number, most significant first.
  const rank = (invoice: Invoice) =>
    (invoice.invoiceNumber.toLowerCase() === needle ? 0 : 2) +
    (customerId !== null && invoice.customerId === customerId ? 0 : 1)

  const matches = invoices
    .filter((invoice) => invoice.status === 'OPEN')
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

  return pageOf(
    matches.map(({ invoice }) => invoice),
    search,
  )
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
