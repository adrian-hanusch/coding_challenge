import { FormattedMessage } from 'react-intl'

import { useFormatPlainDate } from '../../../lib/useFormatDate.ts'

export function InvoiceDueDate({ dueDate }: { dueDate: string }) {
  const formatPlainDate = useFormatPlainDate()
  return <FormattedMessage id="invoice.dueDate" values={{ date: formatPlainDate(dueDate) }} />
}
