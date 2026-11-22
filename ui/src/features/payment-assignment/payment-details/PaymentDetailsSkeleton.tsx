import { Skeleton } from '@heroui/react'

import { PaymentCard } from './PaymentCard.tsx'

export function PaymentDetailsSkeleton() {
  return (
    <PaymentCard aria-busy="true" data-testid="payment-details-loading">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </PaymentCard>
  )
}
