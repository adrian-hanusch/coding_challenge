import { FormattedMessage } from 'react-intl'

import { PaymentSearchField } from './payment/search/PaymentSearchField.tsx'
import { AssignmentSteps } from './steps/AssignmentSteps.tsx'

interface PaymentSelectionProps {
  autoFocusSearch: boolean
  onSelect: (paymentId: string) => void
}

export function PaymentSelection({ autoFocusSearch, onSelect }: PaymentSelectionProps) {
  return (
    <AssignmentSteps
      payment={{
        status: 'current',
        description: <FormattedMessage id="steps.payment.description" />,
        content: <PaymentSearchField autoFocus={autoFocusSearch} onSelect={onSelect} />,
      }}
      invoice={{ status: 'locked' }}
      split={{ status: 'locked' }}
    />
  )
}
