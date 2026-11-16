import { Button } from '@heroui/react'
import { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { StatusPage } from '../pages/StatusPage.tsx'

export function RouteError() {
  const error = useRouteError()

  useEffect(() => {
    console.error('[router] Route failed to render', error)
  }, [error])

  return (
    <StatusPage
      role="alert"
      data-testid="route-error"
      title={<FormattedMessage id="error.title" />}
      description={
        isRouteErrorResponse(error) ? (
          <FormattedMessage id="error.status" values={{ status: error.status }} />
        ) : (
          <FormattedMessage id="error.description" />
        )
      }
      actions={
        <Button variant="secondary" onPress={() => window.location.reload()}>
          <FormattedMessage id="error.reload" />
        </Button>
      }
    />
  )
}
