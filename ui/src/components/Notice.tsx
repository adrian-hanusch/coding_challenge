import { Alert } from '@heroui/react'
import type { ReactNode, Ref } from 'react'

interface NoticeProps {
  status: 'accent' | 'success' | 'warning' | 'danger'
  title: ReactNode
  description?: ReactNode
  /** Action below the text. */
  children?: ReactNode
  role?: 'alert'
  /** Makes the notice focusable from code. */
  ref?: Ref<HTMLDivElement>
  'data-testid'?: string
}

export function Notice({ title, description, children, ref, ...props }: NoticeProps) {
  return (
    <Alert {...props} ref={ref} tabIndex={ref ? -1 : undefined} className="outline-none">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {description ? <Alert.Description>{description}</Alert.Description> : null}
        {children}
      </Alert.Content>
    </Alert>
  )
}
