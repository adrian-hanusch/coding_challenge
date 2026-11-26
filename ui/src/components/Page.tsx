import { cn } from '@heroui/react'
import { type ComponentProps, type ReactNode, useRef } from 'react'

import { useFocusWhen } from '../lib/useFocusWhen.ts'
import { Typography } from './Typography.tsx'

interface PageProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** Moves focus to the title, for pages reached by a redirect that removed the focused element. */
  focusTitle?: boolean
}

export function Page({ title, description, focusTitle = false, className, children, ...props }: PageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useFocusWhen(titleRef, focusTitle, { onMount: true })

  return (
    <div {...props} className={cn('mx-auto flex max-w-3xl flex-col gap-8', className)}>
      <div className="flex flex-col gap-1">
        <Typography type="h3" elementType="h1" ref={titleRef} tabIndex={-1} className="outline-none">
          {title}
        </Typography>
        {description ? <Typography color="muted">{description}</Typography> : null}
      </div>
      {children}
    </div>
  )
}
