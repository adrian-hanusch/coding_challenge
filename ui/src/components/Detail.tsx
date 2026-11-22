import { cn } from '@heroui/react'
import type { ReactNode } from 'react'

import { Typography } from './Typography.tsx'

// Literal class names, so Tailwind can find them.
const COLUMNS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const

export function DetailList({
  columns,
  className,
  children,
}: {
  columns: keyof typeof COLUMNS
  className?: string
  children: ReactNode
}) {
  return <dl className={cn('grid grid-cols-1 gap-x-8 gap-y-5', COLUMNS[columns], className)}>{children}</dl>
}

export function Detail({
  label,
  children,
  'data-testid': testId,
}: {
  label: ReactNode
  children: ReactNode
  'data-testid': string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Typography type="body-sm" color="muted" elementType="dt">
        {label}
      </Typography>
      <dd className="font-medium" data-testid={testId}>
        {children}
      </dd>
    </div>
  )
}
