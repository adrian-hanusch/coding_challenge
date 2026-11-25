import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { assignPaymentPath } from '../../app/paths.ts'
import { PaymentSearchField } from './payment/search/PaymentSearchField.tsx'
import { AssignmentSteps } from './steps/AssignmentSteps.tsx'

export function PaymentSelection({ autoFocusSearch }: { autoFocusSearch: boolean }) {
  const navigate = useNavigate()

  return (
    <AssignmentSteps
      payment={{
        status: 'current',
        description: <FormattedMessage id="steps.payment.description" />,
        content: (
          <PaymentSearchField
            autoFocus={autoFocusSearch}
            onSelect={(paymentId) => void navigate(assignPaymentPath(paymentId))}
          />
        ),
      }}
      invoice={{ status: 'locked' }}
      split={{ status: 'locked' }}
    />
  )
}
