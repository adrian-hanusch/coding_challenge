import { Link } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'
import { PATHS } from '../app/paths.ts'

interface StatusPageProps {
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
  role?: 'alert'
  'data-testid'?: string
}

export function StatusPage({ title, description, actions, ...rest }: StatusPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-3" {...rest}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted">{description}</p>
      <div className="flex flex-wrap items-center gap-4">
        {actions}
        <Link href={PATHS.payments}>
          <FormattedMessage id="nav.backToPayments" />
        </Link>
      </div>
    </div>
  )
}
