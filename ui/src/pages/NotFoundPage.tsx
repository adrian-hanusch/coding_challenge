import { FormattedMessage } from 'react-intl'

import { StatusPage } from './StatusPage.tsx'

export function NotFoundPage() {
  return (
    <StatusPage
      data-testid="not-found"
      title={<FormattedMessage id="notFound.title" />}
      description={<FormattedMessage id="notFound.description" />}
    />
  )
}
