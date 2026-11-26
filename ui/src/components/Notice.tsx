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
  /** Marks the notice as the target when focus moves to the first error; also makes it focusable. */
  'data-focus-on-error'?: true
  'data-testid'?: string
}

export function Notice({ title, description, children, ref, ...props }: NoticeProps) {
  const isFocusable = ref != null || props['data-focus-on-error'] === true

  return (
    <Alert
      {...props}
      ref={ref}
      tabIndex={isFocusable ? -1 : undefined}
      // Visible only when focus arrived by keyboard, e.g. after pressing the confirm button with Enter.
      className="outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {description ? <Alert.Description>{description}</Alert.Description> : null}
        {children}
      </Alert.Content>
    </Alert>
  )
}
