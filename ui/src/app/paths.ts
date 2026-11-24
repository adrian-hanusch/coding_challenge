import { generatePath } from 'react-router'

export const PATHS = {
  selectPayment: '/payments',
  assignPayment: '/payments/:paymentId/assign',
} as const

export const assignPaymentPath = (paymentId: string) => generatePath(PATHS.assignPayment, { paymentId })

/** Navigation state of the redirect to the payment selection after an assignment. */
export const AFTER_ASSIGNMENT = 'afterAssignment'
