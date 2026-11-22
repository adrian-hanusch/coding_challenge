import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { Typography } from './Typography.tsx'

export function SuccessNote({ children, 'data-testid': testId }: { children: ReactNode; 'data-testid'?: string }) {
  return (
    <Typography type="body-sm" className="flex items-center gap-2 text-success" data-testid={testId}>
      <CircleCheck aria-hidden className="size-4 shrink-0" />
      {children}
    </Typography>
  )
}
