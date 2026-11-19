import { cn } from '@heroui/react'
import { Typography } from './Typography.tsx'
import type { ComponentProps, ReactNode } from 'react'

interface PageProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
}

export function Page({ title, description, className, children, ...props }: PageProps) {
  return (
    <div {...props} className={cn('mx-auto flex w-full max-w-3xl flex-col gap-8', className)}>
      <div className="flex flex-col gap-1">
        <Typography type="h3" elementType="h1">
          {title}
        </Typography>
        {description ? <Typography color="muted">{description}</Typography> : null}
      </div>
      {children}
    </div>
  )
}
