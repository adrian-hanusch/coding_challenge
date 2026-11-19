import { generatePath } from 'react-router'

export const PATHS = {
  payments: '/payments',
  assignPayment: '/payments/:paymentId/assign',
} as const

export const assignPaymentPath = (paymentId: string) => generatePath(PATHS.assignPayment, { paymentId })
