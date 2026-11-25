import type { Ref } from 'react'
import { FormattedMessage } from 'react-intl'

import { Notice } from '../../../components/Notice.tsx'

/** `ref` points at the notice itself, so it can receive focus. */
export function AssignedNotice({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <Notice
      ref={ref}
      status="accent"
      title={<FormattedMessage id="paymentDetails.assigned.title" />}
      description={<FormattedMessage id="paymentDetails.assigned.description" />}
      data-testid="payment-already-assigned"
    />
  )
}
