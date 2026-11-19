import { Card, cn } from '@heroui/react'
import type { ComponentProps, ReactNode } from 'react'
import { SectionHeader } from './SectionHeader.tsx'

interface PageCardProps extends Omit<ComponentProps<typeof Card>, 'title'> {
  title?: ReactNode
  description?: ReactNode
}

export function PageCard({ title, description, className, children, ...props }: PageCardProps) {
  return (
    <Card {...props} className={cn('gap-5 p-6 sm:p-8', className)}>
      {title ? <SectionHeader title={title} description={description} /> : null}
      {children}
    </Card>
  )
}
