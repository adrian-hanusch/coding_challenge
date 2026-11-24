import { generatePath } from 'react-router'

export const PATHS = {
  selectPayment: '/payments',
  assignPayment: '/payments/:paymentId/assign',
} as const

export const assignPaymentPath = (paymentId: string) => generatePath(PATHS.assignPayment, { paymentId })
