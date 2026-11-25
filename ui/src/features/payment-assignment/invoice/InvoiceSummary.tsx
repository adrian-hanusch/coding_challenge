import { FormattedMessage } from 'react-intl'

import type { Invoice } from '../../../api/types.ts'
import { SelectionSummary } from '../../../components/SelectionSummary.tsx'
import { useFormatPlainDate } from '../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  const formatMoney = useFormatMoney()
  const formatPlainDate = useFormatPlainDate()

  return (
    <SelectionSummary
      title={{ label: <FormattedMessage id="invoice.merchant" />, value: invoice.merchant.name }}
      amount={{ label: <FormattedMessage id="invoice.amount" />, value: formatMoney(invoice.amount) }}
      reference={{ label: <FormattedMessage id="invoice.numberLabel" />, value: invoice.invoiceNumber }}
      date={{ label: <FormattedMessage id="invoice.dueDateLabel" />, value: formatPlainDate(invoice.dueDate) }}
      data-testid="selected-invoice"
    />
  )
}
