import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import type { Money } from '../api/types.ts'

/** Formats integer cents in the active locale. */
export function useFormatMoney() {
  const intl = useIntl()
  return useCallback(
    ({ amountMinor, currency }: Money) => intl.formatNumber(amountMinor / 100, { style: 'currency', currency }),
    [intl],
  )
}
