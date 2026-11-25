import { Chip, ListBox } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { Invoice } from '../../../../api/types.ts'
import { SearchOption } from '../../../../components/search/SearchOption.tsx'
import { isSelectable } from '../../../../domain/invoice.ts'
import { useFormatPlainDate } from '../../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../../lib/useFormatMoney.ts'

export function InvoiceOption({ invoice }: { invoice: Invoice }) {
  const formatMoney = useFormatMoney()
  const formatPlainDate = useFormatPlainDate()

  return (
    <ListBox.Item id={invoice.id} textValue={invoice.invoiceNumber} data-testid={`invoice-option-${invoice.id}`}>
      <SearchOption
        title={invoice.merchant.name}
        subtitle={<FormattedMessage id="invoice.number" values={{ number: invoice.invoiceNumber }} />}
        amount={formatMoney(invoice.amount)}
        meta={
          isSelectable(invoice) ? (
            <FormattedMessage id="invoice.dueDate" values={{ date: formatPlainDate(invoice.dueDate) }} />
          ) : (
            <Chip size="sm" variant="soft" color="success">
              <FormattedMessage id="invoice.paid" />
            </Chip>
          )
        }
      />
    </ListBox.Item>
  )
}
