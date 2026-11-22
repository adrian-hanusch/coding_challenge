import { Link } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'

import { PATHS } from '../app/paths.ts'
import { Page } from '../components/Page.tsx'

interface StatusPageProps {
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
  role?: 'alert'
  'data-testid'?: string
}

export function StatusPage({ title, description, actions, ...rest }: StatusPageProps) {
  return (
    <Page title={title} description={description} className="items-start gap-3" {...rest}>
      <div className="flex flex-wrap items-center gap-4">
        {actions}
        <Link href={PATHS.payments}>
          <FormattedMessage id="nav.backToPayments" />
        </Link>
      </div>
    </Page>
  )
}
