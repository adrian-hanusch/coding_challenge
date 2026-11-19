import type { ComponentProps } from 'react'
import { PageCard } from '../../components/PageCard.tsx'

/** Same frame for the details and their skeleton. */
export function PaymentCard(props: Omit<ComponentProps<typeof PageCard>, 'className'>) {
  return <PageCard {...props} className="gap-10" />
}
