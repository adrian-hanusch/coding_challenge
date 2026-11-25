import type { ReactNode } from 'react'

import { Typography } from '../Typography.tsx'

interface SearchOptionProps {
  title: ReactNode
  subtitle: ReactNode
  amount: ReactNode
  meta: ReactNode
}

export function SearchOption({ title, subtitle, amount, meta }: SearchOptionProps) {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography type="body-sm" weight="medium" truncate elementType="span">
          {title}
        </Typography>
        <Typography type="body-xs" color="muted" weight="normal" truncate elementType="span">
          {subtitle}
        </Typography>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <Typography type="body-sm" weight="medium" elementType="span" className="tabular-nums">
          {amount}
        </Typography>
        <Typography type="body-xs" color="muted" weight="normal" elementType="span">
          {meta}
        </Typography>
      </div>
    </div>
  )
}
