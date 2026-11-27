import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { FormattedMessage } from 'react-intl'
import { useNavigate, useParams } from 'react-router'

import { ApiError } from '../api/client.ts'
import { paymentQueryOptions } from '../api/payments.ts'
import { PATHS, type SelectPaymentReason } from '../app/paths.ts'
import { StatusPage } from '../app/StatusPage.tsx'
import { Page } from '../components/Page.tsx'
import { PaymentAssignment } from '../features/payment-assignment/PaymentAssignment.tsx'
import { PaymentAssignmentSkeleton } from '../features/payment-assignment/PaymentAssignmentSkeleton.tsx'
import { NotFoundPage } from './NotFoundPage.tsx'

export function AssignPaymentPage() {
  const { paymentId } = useParams()
  if (!paymentId) return <NotFoundPage />
  // Without the key, react-router would keep the draft when only the id changes.
  return <AssignPayment key={paymentId} paymentId={paymentId} />
}

function AssignPayment({ paymentId }: { paymentId: string }) {
  const navigate = useNavigate()
  const { data: payment, error, refetch } = useQuery(paymentQueryOptions(paymentId))

  // Once the payment is loaded, a failed background refetch must not unmount the form and discard the user's input.
  if (error && !payment) {
    if (error instanceof ApiError && error.code === 'PAYMENT_NOT_FOUND') return <NotFoundPage />
    return (
      <StatusPage
        role="alert"
        data-testid="payment-load-error"
        title={<FormattedMessage id="assign.loadError.title" />}
        description={<FormattedMessage id="assign.loadError.description" />}
        actions={
          <Button onPress={() => void refetch()}>
            <FormattedMessage id="assign.loadError.retry" />
          </Button>
        }
      />
    )
  }

  if (payment) {
    return (
      <PaymentAssignment
        payment={payment}
        onChangePayment={() => {
          void navigate(PATHS.selectPayment, { state: 'changePayment' satisfies SelectPaymentReason })
        }}
        onAssigned={() => {
          void navigate(PATHS.selectPayment, { state: 'afterAssignment' satisfies SelectPaymentReason, replace: true })
        }}
      />
    )
  }

  return (
    <Page title={<FormattedMessage id="assign.title" />}>
      <PaymentAssignmentSkeleton />
    </Page>
  )
}
