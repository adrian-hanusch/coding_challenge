import { Link } from '@heroui/react'
import { Typography } from '../../components/Typography.tsx'
import { useQueries, useQuery } from '@tanstack/react-query'
import { paymentQueryOptions } from '../../api/payments.ts'
import type { Payment } from '../../api/types.ts'
import { assignPaymentPath } from '../../app/paths.ts'
import { useFormatMoney } from '../../lib/useFormatMoney.ts'
import { PaymentStatusChip } from '../../components/PaymentStatusChip.tsx'

// The ternary on the compile-time constant keeps the fixtures out of production builds.
const loadDemoPaymentIds = () =>
  __MOCK_API__
    ? import('../../mocks/fixtures.ts').then(({ PAYMENTS }) => PAYMENTS.map((payment) => payment.id))
    : Promise.resolve([])

const loadedPayments = (results: { data?: Payment }[]) =>
  results.flatMap((result) => (result.data ? [result.data] : []))

/** Links to the prepared cases of the mock API, with their current state from the API. */
export function DemoPaymentList() {
  const { data: ids = [] } = useQuery({
    queryKey: ['demo-payment-ids'],
    queryFn: loadDemoPaymentIds,
    staleTime: Infinity,
  })
  const payments = useQueries({
    queries: ids.map((id) => paymentQueryOptions(id)),
    combine: loadedPayments,
  })

  return (
    <ul className="-mx-3 flex flex-col gap-1" data-testid="demo-payments">
      {payments.map((payment) => (
        <li key={payment.id}>
          <DemoPaymentLink payment={payment} />
        </li>
      ))}
    </ul>
  )
}

function DemoPaymentLink({ payment }: { payment: Payment }) {
  const formatMoney = useFormatMoney()

  return (
    <Link
      href={assignPaymentPath(payment.id)}
      className="flex w-full flex-col items-start gap-2 rounded-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-3 py-3 text-foreground no-underline transition-colors hover:bg-default hover:no-underline"
      data-testid={`demo-payment-${payment.id}`}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{payment.senderName}</span>
        <Typography type="body-sm" color="muted" weight="normal" truncate className="font-mono" elementType="span">
          {payment.id}
        </Typography>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="font-medium tabular-nums">{formatMoney(payment.amount)}</span>
        <PaymentStatusChip status={payment.status} />
      </span>
    </Link>
  )
}
