import { Wallet } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Typography } from '../../components/Typography.tsx'

export function BrandLogo() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-field bg-accent text-accent-foreground">
      <Wallet className="size-4" aria-hidden />
    </span>
  )
}

export function Brand({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <>
      <BrandLogo />
      {showTitle && (
        <Typography type="h6" truncate elementType="span" className="min-w-0">
          <FormattedMessage id="app.title" />
        </Typography>
      )}
    </>
  )
}
