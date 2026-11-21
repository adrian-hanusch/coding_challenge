import { Alert } from '@heroui/react'
import { Typography } from '../../../components/Typography.tsx'
import { type ReactNode, useId } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import type { Invoice, Payment } from '../../../api/types.ts'
import { SectionHeader } from '../../../components/SectionHeader.tsx'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'
import { InvoiceSearchField } from './invoice-search/InvoiceSearchField.tsx'
import { PaymentCard } from './PaymentCard.tsx'
import { PaymentStatusChip } from '../../../components/PaymentStatusChip.tsx'
import { SelectedInvoice } from './SelectedInvoice.tsx'

interface PaymentDetailsFormProps {
  payment: Payment
  invoice: Invoice | null
  onInvoiceChange: (invoice: Invoice | null) => void
}

/** Read-only payment details and the choice of the invoice to assign. */
export function PaymentDetailsForm({ payment, invoice, onInvoiceChange }: PaymentDetailsFormProps) {
  const isAssigned = payment.status === 'ASSIGNED'
  const titleId = useId()

  return (
    <PaymentCard data-testid="payment-details-form">
      <PaymentOverview payment={payment} />

      <section aria-labelledby={titleId} className="flex flex-col gap-5">
        <SectionHeader
          id={titleId}
          title={<FormattedMessage id="paymentDetails.invoice.title" />}
          description={isAssigned ? undefined : <FormattedMessage id="paymentDetails.invoice.description" />}
        />
        {isAssigned ? (
          <Alert status="default" data-testid="payment-already-assigned">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                <FormattedMessage id="paymentDetails.assigned.title" />
              </Alert.Title>
              <Alert.Description>
                <FormattedMessage id="paymentDetails.assigned.description" />
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : (
          <>
            <InvoiceSearchField
              customerId={payment.customerId}
              senderName={payment.senderName}
              invoice={invoice}
              onInvoiceChange={onInvoiceChange}
            />
            {invoice ? <SelectedInvoice invoice={invoice} paymentAmount={payment.amount} /> : null}
          </>
        )}
      </section>
    </PaymentCard>
  )
}

function PaymentOverview({ payment }: { payment: Payment }) {
  const intl = useIntl()
  const formatMoney = useFormatMoney()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography type="body-sm" color="muted" id={titleId} elementType="h2">
            <FormattedMessage id="paymentDetails.amount" />
          </Typography>
          <Typography type="h1" className="tabular-nums" elementType="p" data-testid="payment-amount">
            {formatMoney(payment.amount)}
          </Typography>
        </div>
        <PaymentStatusChip status={payment.status} />
      </div>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
        <Detail label={<FormattedMessage id="paymentDetails.sender" />} testId="payment-sender">
          {payment.senderName}
        </Detail>
        <Detail label={<FormattedMessage id="paymentDetails.reference" />} testId="payment-reference">
          <span className="font-mono break-all">{payment.referenceNumber}</span>
        </Detail>
        <Detail label={<FormattedMessage id="paymentDetails.receivedAt" />} testId="payment-received-at">
          {intl.formatDate(payment.receivedAt, { dateStyle: 'medium', timeStyle: 'short' })}
        </Detail>
      </dl>
    </section>
  )
}

function Detail({ label, children, testId }: { label: ReactNode; children: ReactNode; testId: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Typography type="body-sm" color="muted" elementType="dt">
        {label}
      </Typography>
      <dd className="font-medium" data-testid={testId}>
        {children}
      </dd>
    </div>
  )
}
