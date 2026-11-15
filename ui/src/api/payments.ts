import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from './client.ts'
import type { CreateAssignmentRequest, Payment, PaymentAssignment } from './types.ts'

export const paymentKeys = {
  all: ['payments'] as const,
  detail: (paymentId: string) => [...paymentKeys.all, paymentId] as const,
}

export function paymentQueryOptions(paymentId: string) {
  return queryOptions({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: ({ signal }) => apiFetch<Payment>(`/payments/${encodeURIComponent(paymentId)}`, { signal }),
  })
}

export function createAssignment(paymentId: string, request: CreateAssignmentRequest) {
  return apiFetch<PaymentAssignment>(`/payments/${encodeURIComponent(paymentId)}/assignment`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
