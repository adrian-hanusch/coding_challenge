import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useParams } from 'react-router'
import { ApiError } from '../api/client.ts'
import { paymentQueryOptions } from '../api/payments.ts'
import type { Invoice } from '../api/types.ts'
import { Page } from '../components/Page.tsx'
import { PaymentDetailsForm } from '../features/payment-assignment/PaymentDetailsForm.tsx'
import { PaymentDetailsSkeleton } from '../features/payment-assignment/PaymentDetailsSkeleton.tsx'
import { NotFoundPage } from './NotFoundPage.tsx'
import { StatusPage } from './StatusPage.tsx'

/** Assigns one payment, loaded by id from the URL. */
export function AssignPaymentPage() {
  const { paymentId = '' } = useParams()
  // Without the key, react-router would keep the draft when only the id changes.
  return <AssignPayment key={paymentId} paymentId={paymentId} />
}

function AssignPayment({ paymentId }: { paymentId: string }) {
  const { data: payment, error, refetch } = useQuery(paymentQueryOptions(paymentId))
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  if (error) {
    if (error instanceof ApiError && error.code === 'PAYMENT_NOT_FOUND') return <NotFoundPage />
    return (
      <StatusPage
        role="alert"
        data-testid="payment-load-error"
        title={<FormattedMessage id="assign.loadError.title" />}
        description={<FormattedMessage id="assign.loadError.description" />}
        actions={
          <Button variant="secondary" onPress={() => void refetch()}>
            <FormattedMessage id="assign.loadError.retry" />
          </Button>
        }
      />
    )
  }

  return (
    <Page title={<FormattedMessage id="assign.title" />} description={<FormattedMessage id="assign.subtitle" />}>
      {payment ? (
        <PaymentDetailsForm payment={payment} invoice={invoice} onInvoiceChange={setInvoice} />
      ) : (
        <PaymentDetailsSkeleton />
      )}
    </Page>
  )
}
