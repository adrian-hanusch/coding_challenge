import { Alert } from '@heroui/react'
import { type Ref, useId } from 'react'
import { FormattedMessage } from 'react-intl'

import { SectionHeader } from '../../../components/SectionHeader.tsx'

/** `ref` points at the notice itself, so it can receive focus. */
export function AssignedNotice({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5">
      <SectionHeader id={titleId} title={<FormattedMessage id="paymentDetails.invoice.title" />} />
      <div ref={ref} tabIndex={-1} className="rounded-2xl outline-none">
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
      </div>
    </section>
  )
}
