import { Button } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

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
  const navigate = useNavigate()

  return (
    <Page title={title} description={description} className="items-start gap-3" {...rest}>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <Button variant="secondary" onPress={() => void navigate(PATHS.selectPayment)}>
          <FormattedMessage id="nav.backToPayments" />
        </Button>
      </div>
    </Page>
  )
}
