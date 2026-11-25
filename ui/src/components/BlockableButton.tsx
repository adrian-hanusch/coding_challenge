import { Button, cn, Tooltip } from '@heroui/react'
import { type ReactNode, useState } from 'react'

interface BlockableButtonProps {
  /** Without a reason the button is not blocked. */
  blockedReason: ReactNode
  onPress: () => void
  className?: string
  children: ReactNode
  'data-testid'?: string
}

/** Explains in a tooltip why it is blocked instead of reacting to a press. */
export function BlockableButton({
  blockedReason,
  onPress,
  className,
  children,
  'data-testid': testId,
}: BlockableButtonProps) {
  const [isReasonShown, setIsReasonShown] = useState(false)
  const isBlocked = blockedReason != null
  // Otherwise the tooltip would open by itself the next time the button is blocked.
  if (!isBlocked && isReasonShown) setIsReasonShown(false)

  return (
    <Tooltip delay={0} isDisabled={!isBlocked} isOpen={isBlocked && isReasonShown} onOpenChange={setIsReasonShown}>
      {/* A disabled button gets neither hover nor focus, so the tooltip could never open. */}
      <Button
        aria-disabled={isBlocked || undefined}
        className={cn(className, isBlocked && 'pointer-events-auto!')}
        // Touch has no hover.
        onPress={() => {
          if (isBlocked) setIsReasonShown(true)
          else onPress()
        }}
        data-testid={testId}
      >
        {children}
      </Button>
      <Tooltip.Content placement="top end">{blockedReason}</Tooltip.Content>
    </Tooltip>
  )
}
