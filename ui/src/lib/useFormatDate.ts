import { useCallback } from 'react'
import { useIntl } from 'react-intl'

/** UTC keeps the day of a plain date such as a due date, whatever the viewer's time zone. */
export function useFormatPlainDate() {
  const intl = useIntl()
  return useCallback((date: string) => intl.formatDate(date, { dateStyle: 'medium', timeZone: 'UTC' }), [intl])
}

export function useFormatDateTime() {
  const intl = useIntl()
  return useCallback(
    (timestamp: string) => intl.formatDate(timestamp, { dateStyle: 'medium', timeStyle: 'short' }),
    [intl],
  )
}
