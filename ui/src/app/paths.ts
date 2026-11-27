import { generatePath } from 'react-router'

export const PATHS = {
  selectPayment: '/payments',
  assignPayment: '/payments/:paymentId/assign',
} as const

export const assignPaymentPath = (paymentId: string) => generatePath(PATHS.assignPayment, { paymentId })

/** Why the payment selection was opened, passed as navigation state. */
const SELECT_PAYMENT_REASONS = ['afterAssignment', 'changePayment'] as const
export type SelectPaymentReason = (typeof SELECT_PAYMENT_REASONS)[number]

/** `location.state` is untyped and survives in the browser history, so it is checked instead of cast. */
export function selectPaymentReason(state: unknown): SelectPaymentReason | null {
  return SELECT_PAYMENT_REASONS.find((reason) => reason === state) ?? null
}
