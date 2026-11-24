import { toast } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIntl } from 'react-intl'

import { invoiceKeys } from '../../../api/invoices.ts'
import { createAssignment, paymentKeys, paymentQueryOptions } from '../../../api/payments.ts'
import type { Invoice, Payment } from '../../../api/types.ts'
import { toPaymentSplits } from '../../../domain/assignment.ts'
import type { CompleteSplit } from '../../../domain/split.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'
import { failureOf, isInvoiceRejected } from './assignmentFailure.ts'

interface AssignVariables {
  invoice: Invoice
  split: CompleteSplit
}

export function useAssignPayment(payment: Payment) {
  const queryClient = useQueryClient()
  const intl = useIntl()
  const formatMoney = useFormatMoney()

  return useMutation({
    mutationFn: ({ invoice, split }: AssignVariables) =>
      createAssignment(payment.id, {
        invoiceId: invoice.id,
        splits: toPaymentSplits(split, payment.amount.currency),
      }),
    onSuccess: (_assignment, { invoice }) => {
      toast.success(
        intl.formatMessage(
          { id: 'assignment.success.toast' },
          { amount: formatMoney(payment.amount), sender: payment.senderName, number: invoice.invoiceNumber },
        ),
      )
      // Neither the list nor a direct visit may offer the payment again from the cache.
      queryClient.setQueryData(paymentQueryOptions(payment.id).queryKey, { ...payment, status: 'ASSIGNED' })
      queryClient.removeQueries({ queryKey: paymentKeys.searches() })
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    // The server state changed, or may have. The open dialog keeps the form mounted, so the refetch is safe.
    onError: (error) => {
      const failure = failureOf(error)
      if (failure === 'alreadyAssigned' || failure === 'unconfirmed') {
        void queryClient.invalidateQueries({ queryKey: paymentKeys.detail(payment.id) })
      }
      if (isInvoiceRejected(error)) void queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

export type AssignPaymentMutation = ReturnType<typeof useAssignPayment>
