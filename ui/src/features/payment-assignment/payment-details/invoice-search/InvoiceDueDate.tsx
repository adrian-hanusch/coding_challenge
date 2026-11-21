import { FormattedMessage, useIntl } from 'react-intl'

/** `dueDate` is a plain date, so it is formatted in UTC to keep the day. */
export function InvoiceDueDate({ dueDate }: { dueDate: string }) {
  const intl = useIntl()
  return (
    <FormattedMessage
      id="invoice.dueDate"
      values={{ date: intl.formatDate(dueDate, { dateStyle: 'medium', timeZone: 'UTC' }) }}
    />
  )
}
