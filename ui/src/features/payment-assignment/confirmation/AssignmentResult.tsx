import { Alert, Link } from '@heroui/react'
import { useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment, PaymentAssignment } from '../../../api/types.ts'
import { PATHS } from '../../../app/paths.ts'
import { PageCard } from '../../../components/PageCard.tsx'
import { splitOf } from '../../../domain/assignment.ts'
import { SplitBreakdown } from './SplitBreakdown.tsx'

interface AssignmentResultProps {
  payment: Payment
  invoice: Invoice
  assignment: PaymentAssignment
}

/** Success state with the split as the server stored it. */
export function AssignmentResult({ payment, invoice, assignment }: AssignmentResultProps) {
  const messageRef = useRef<HTMLDivElement>(null)

  // The dialog's trigger unmounted with the form, so focus would otherwise fall back to the page body.
  useEffect(() => {
    messageRef.current?.focus()
  }, [])

  return (
    <PageCard data-testid="assignment-result">
      <div ref={messageRef} tabIndex={-1} className="rounded-2xl outline-none">
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              <FormattedMessage id="assignment.result.title" />
            </Alert.Title>
            <Alert.Description>
              <FormattedMessage
                id="assignment.result.description"
                values={{ number: invoice.invoiceNumber, merchant: invoice.merchant.name }}
              />
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
      <SplitBreakdown paymentAmount={payment.amount} split={splitOf(assignment.splits)} />
      <Link href={PATHS.payments} className="self-start">
        <FormattedMessage id="nav.backToPayments" />
      </Link>
    </PageCard>
  )
}
