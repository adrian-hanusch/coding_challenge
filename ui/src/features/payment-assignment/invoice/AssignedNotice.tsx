import { Alert } from '@heroui/react'
import type { Ref } from 'react'
import { FormattedMessage } from 'react-intl'

/** `ref` points at the notice itself, so it can receive focus. */
export function AssignedNotice({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
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
  )
}
