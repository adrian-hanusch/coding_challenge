import { Button, ComboBox, Description, FieldError, Input, Label } from '@heroui/react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { unmatchedPaymentSearchOptions } from '../../../../api/payments.ts'
import { MAX_SEARCH_LENGTH, type Payment } from '../../../../api/types.ts'
import { SearchResults } from '../../../../components/search/SearchResults.tsx'
import { SearchTrigger } from '../../../../components/search/SearchTrigger.tsx'
import { usePagedSearch } from '../../../../lib/usePagedSearch.ts'
import { PaymentOption } from './PaymentOption.tsx'

interface PaymentSearchFieldProps {
  autoFocus: boolean
  onSelect: (paymentId: string) => void
}

export function PaymentSearchField({ autoFocus, onSelect }: PaymentSearchFieldProps) {
  const intl = useIntl()
  const [text, setText] = useState('')
  const query = text.trim()
  const { items: payments, ...search } = usePagedSearch(query, unmatchedPaymentSearchOptions)

  return (
    <ComboBox<Payment>
      fullWidth
      menuTrigger="focus"
      allowsEmptyCollection
      isInvalid={search.isError}
      items={payments}
      inputValue={text}
      onInputChange={setText}
      onChange={(key) => {
        if (key !== null) onSelect(String(key))
      }}
      data-testid="payment-search"
    >
      <Label>
        <FormattedMessage id="paymentSearch.label" />
      </Label>
      <ComboBox.InputGroup>
        <Input
          autoFocus={autoFocus}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder={intl.formatMessage({ id: 'paymentSearch.placeholder' })}
          data-testid="payment-search-input"
        />
        <SearchTrigger
          isSearching={search.isSearching}
          loadingLabel={intl.formatMessage({ id: 'paymentSearch.loading' })}
        />
      </ComboBox.InputGroup>
      {search.isError ? (
        <FieldError data-testid="payment-search-error" className="flex flex-wrap items-center gap-x-2">
          <FormattedMessage id="paymentSearch.error" />
          {/* Without the null slot it would become a second trigger button of the ComboBox. */}
          <Button slot={null} variant="secondary" size="sm" onPress={search.retry} data-testid="payment-search-retry">
            <FormattedMessage id="paymentSearch.retry" />
          </Button>
        </FieldError>
      ) : (
        <Description>
          <FormattedMessage id="paymentSearch.description" />
        </Description>
      )}
      <SearchResults
        isLoadingMore={search.isLoadingMore}
        onLoadMore={search.loadMore}
        emptyMessage={<EmptyMessage isSearching={search.isSearching} isError={search.isError} />}
      >
        {payments.map((payment) => (
          <PaymentOption key={payment.id} payment={payment} />
        ))}
      </SearchResults>
    </ComboBox>
  )
}

function EmptyMessage({ isSearching, isError }: { isSearching: boolean; isError: boolean }) {
  if (isSearching) return <FormattedMessage id="paymentSearch.loading" />
  if (isError) return <FormattedMessage id="paymentSearch.error" />
  return <FormattedMessage id="paymentSearch.empty" />
}
