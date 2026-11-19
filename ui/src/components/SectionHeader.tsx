import { Typography } from './Typography.tsx'
import type { ReactNode } from 'react'

interface SectionHeaderProps {
  id?: string
  title: ReactNode
  description?: ReactNode
}

export function SectionHeader({ id, title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <Typography type="h5" id={id} elementType="h2">
        {title}
      </Typography>
      {description ? (
        <Typography type="body-sm" color="muted">
          {description}
        </Typography>
      ) : null}
    </div>
  )
}
