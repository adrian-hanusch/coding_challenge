import { cn } from '@heroui/react'

/** Layout shared by everything that is a row of the sidebar. */
export const navRow = (collapsed: boolean) =>
  cn('h-10 w-full rounded-field text-sm font-medium', collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3')
