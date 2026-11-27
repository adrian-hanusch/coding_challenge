import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { unmatchedPaymentSearchOptions } from '../../../../api/payments.ts'
import type { Payment } from '../../../../api/types.ts'
import { SearchField } from '../../../../components/search/SearchField.tsx'
import { usePagedSearch } from '../../../../lib/usePagedSearch.ts'
import { PaymentOption } from './PaymentOption.tsx'

interface PaymentSearchFieldProps {
  autoFocus: boolean
  onSelect: (paymentId: string) => void
}

export function PaymentSearchField({ autoFocus, onSelect }: PaymentSearchFieldProps) {
  const intl = useIntl()
  const [text, setText] = useState('')
  const { items: payments, ...search } = usePagedSearch(text.trim(), unmatchedPaymentSearchOptions)

  return (
    <SearchField<Payment>
      label={<FormattedMessage id="paymentSearch.label" />}
      placeholder={intl.formatMessage({ id: 'paymentSearch.placeholder' })}
      loadingLabel={intl.formatMessage({ id: 'paymentSearch.loading' })}
      description={<FormattedMessage id="paymentSearch.description" />}
      searchErrorMessage={<FormattedMessage id="paymentSearch.error" />}
      emptyMessage={<FormattedMessage id="paymentSearch.empty" />}
      items={payments}
      inputValue={text}
      onInputChange={setText}
      onChange={(key) => {
        if (key !== null) onSelect(String(key))
      }}
      search={search}
      input={{ autoFocus }}
      data-testid="payment-search"
    >
      {payments.map((payment) => (
        <PaymentOption key={payment.id} payment={payment} />
      ))}
    </SearchField>
  )
}
