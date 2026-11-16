import { Wallet } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

export function BrandLogo() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
      <Wallet className="size-4" aria-hidden />
    </span>
  )
}

export function Brand({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <>
      <BrandLogo />
      {showTitle && (
        <span className="min-w-0 truncate font-semibold">
          <FormattedMessage id="app.title" />
        </span>
      )}
    </>
  )
}
