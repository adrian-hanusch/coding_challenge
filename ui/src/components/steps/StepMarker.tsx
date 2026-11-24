import { cn } from '@heroui/react'
import { Check } from 'lucide-react'

export type StepStatus = 'done' | 'current' | 'locked'

export function StepMarker({ step, status }: { step: number; status: StepStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums',
        status === 'done' && 'bg-success-soft text-success-soft-foreground',
        status === 'current' && 'bg-accent text-accent-foreground',
        status === 'locked' && 'border border-border text-muted',
      )}
    >
      {status === 'done' ? <Check className="size-4" /> : step}
    </span>
  )
}
