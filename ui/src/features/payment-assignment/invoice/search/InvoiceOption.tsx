import { ListBox } from '@heroui/react'

import type { Invoice } from '../../../../api/types.ts'
import { Typography } from '../../../../components/Typography.tsx'
import { isSelectable } from '../../../../domain/invoice.ts'
import { useFormatMoney } from '../../../../lib/useFormatMoney.ts'
import { InvoiceDueDate } from '../InvoiceDueDate.tsx'
import { InvoiceStatusChip } from '../InvoiceStatusChip.tsx'

export function InvoiceOption({ invoice }: { invoice: Invoice }) {
  const formatMoney = useFormatMoney()

  return (
    <ListBox.Item id={invoice.id} textValue={invoice.invoiceNumber} data-testid={`invoice-option-${invoice.id}`}>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <span className="font-medium tabular-nums">{invoice.invoiceNumber}</span>
          <Typography type="body-xs" color="muted" weight="normal" truncate elementType="span">
            {invoice.merchant.name}
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-medium tabular-nums">{formatMoney(invoice.amount)}</span>
          {isSelectable(invoice) ? (
            <Typography type="body-xs" color="muted" weight="normal" elementType="span">
              <InvoiceDueDate dueDate={invoice.dueDate} />
            </Typography>
          ) : (
            <InvoiceStatusChip status={invoice.status} />
          )}
        </div>
      </div>
      <ListBox.ItemIndicator />
    </ListBox.Item>
  )
}
