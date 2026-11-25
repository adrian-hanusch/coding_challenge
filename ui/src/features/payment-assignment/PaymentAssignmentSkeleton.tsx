import { Skeleton } from '@heroui/react'

import { SelectionSummary } from '../../components/SelectionSummary.tsx'
import { AssignmentSteps } from './steps/AssignmentSteps.tsx'

const LABEL = <Skeleton className="h-5 w-20" />

export function PaymentAssignmentSkeleton() {
  return (
    <div aria-busy="true" data-testid="payment-details-loading">
      <AssignmentSteps
        payment={{
          status: 'current',
          content: (
            <SelectionSummary
              title={{ label: LABEL, value: <Skeleton className="h-6 w-32" /> }}
              amount={{ label: LABEL, value: <Skeleton className="h-8 w-28" /> }}
              reference={{ label: LABEL, value: <Skeleton className="h-5 w-24" /> }}
              date={{ label: LABEL, value: <Skeleton className="h-5 w-28" /> }}
            />
          ),
        }}
        invoice={{ status: 'locked', hint: <Skeleton className="h-4 w-56" /> }}
        split={{ status: 'locked' }}
      />
    </div>
  )
}
