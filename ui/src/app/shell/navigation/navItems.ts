import { CreditCard, type LucideIcon } from 'lucide-react'
import { PATHS } from '../../paths.ts'

export interface NavItemConfig {
  to: string
  labelId: FormatjsIntl.Message['ids']
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItemConfig[] = [{ to: PATHS.payments, labelId: 'nav.payments', icon: CreditCard }]
