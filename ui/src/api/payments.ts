import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from './client.ts'
import { pagedSearchOptions } from './paging.ts'
import type { CreateAssignmentRequest, Page, Payment, PaymentAssignment } from './types.ts'

export const paymentKeys = {
  all: ['payments'] as const,
  detail: (paymentId: string) => [...paymentKeys.all, 'detail', paymentId] as const,
  searches: () => [...paymentKeys.all, 'search'] as const,
  search: (q: string) => [...paymentKeys.searches(), q] as const,
}

export function paymentQueryOptions(paymentId: string) {
  return queryOptions({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: ({ signal }) => apiFetch<Payment>(`/payments/${encodeURIComponent(paymentId)}`, { signal }),
  })
}

function fetchUnmatchedPayments(q: string, offset: number, signal: AbortSignal) {
  const params = new URLSearchParams({ status: 'UNMATCHED', offset: String(offset) })
  if (q) params.set('q', q)
  return apiFetch<Page<Payment>>(`/payments?${params.toString()}`, { signal })
}

export function unmatchedPaymentSearchOptions(q: string) {
  return pagedSearchOptions(paymentKeys.search(q), (offset, signal) => fetchUnmatchedPayments(q, offset, signal))
}

export function createAssignment(paymentId: string, request: CreateAssignmentRequest) {
  return apiFetch<PaymentAssignment>(`/payments/${encodeURIComponent(paymentId)}/assignment`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
