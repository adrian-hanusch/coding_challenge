import { ComboBox, Description, FieldError, Header, Input, Label, ListBox } from '@heroui/react'
import { useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { type Invoice, MAX_SEARCH_LENGTH } from '../../../../api/types.ts'
import { SearchResults } from '../../../../components/search/SearchResults.tsx'
import { SearchTrigger } from '../../../../components/search/SearchTrigger.tsx'
import type { InvoiceInputError } from './invoiceInput.ts'
import { InvoiceInputErrorMessage } from './InvoiceInputErrorMessage.tsx'
import { InvoiceOption } from './InvoiceOption.tsx'
import { useInvoiceNumberLookup } from './useInvoiceNumberLookup.ts'
import { useInvoiceSearch } from './useInvoiceSearch.ts'

export interface InvoiceSearchStart {
  text: string
  autoFocus: boolean
}

interface InvoiceSearchFieldProps {
  customerId: string | null
  senderName: string
  start: InvoiceSearchStart
  /** `wasFocused` is false when the user had already moved on, i.e. for a lookup on blur. */
  onSelect: (invoice: Invoice, wasFocused: boolean) => void
}

/** Invoice autocomplete with server-side search. A typed number is resolved on blur or Enter. */
export function InvoiceSearchField({ customerId, senderName, start, onSelect }: InvoiceSearchFieldProps) {
  const intl = useIntl()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(start.text)
  const [inputError, setInputError] = useState<InvoiceInputError | null>(null)

  const query = text.trim()
  const search = useInvoiceSearch({ query, customerId })
  const { track, lookup } = useInvoiceNumberLookup(customerId, start.text)

  function changeText(next: string) {
    track(next)
    setText(next)
    setInputError(null)
  }

  async function resolveTypedInput() {
    if (query === '') return
    const resolution = await lookup(query)
    if (!resolution) return
    if ('invoice' in resolution) onSelect(resolution.invoice, document.activeElement === inputRef.current)
    else setInputError(resolution.error)
  }

  const error = inputError ?? (search.isError ? ({ code: 'searchFailed' } as const) : null)

  return (
    <ComboBox<Invoice>
      fullWidth
      menuTrigger="focus"
      allowsCustomValue
      allowsEmptyCollection
      isInvalid={error !== null}
      items={search.invoices}
      disabledKeys={search.disabledKeys}
      inputValue={text}
      onInputChange={changeText}
      onChange={(key) => {
        const next = search.invoices.find((item) => item.id === key)
        if (next) onSelect(next, true)
      }}
      data-testid="invoice-search"
    >
      <Label>
        <FormattedMessage id="invoiceSearch.label" />
      </Label>
      <ComboBox.InputGroup>
        <Input
          ref={inputRef}
          autoFocus={start.autoFocus}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder={intl.formatMessage({ id: 'invoiceSearch.placeholder' })}
          onBlur={() => void resolveTypedInput()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void resolveTypedInput()
          }}
          data-testid="invoice-search-input"
        />
        <SearchTrigger
          isSearching={search.isSearching}
          loadingLabel={intl.formatMessage({ id: 'invoiceSearch.loading' })}
        />
      </ComboBox.InputGroup>
      {error ? (
        <FieldError data-testid="invoice-search-error">
          <InvoiceInputErrorMessage error={error} />
        </FieldError>
      ) : (
        <Description>
          <FormattedMessage
            id={customerId ? 'invoiceSearch.descriptionWithSender' : 'invoiceSearch.description'}
            values={{ sender: senderName }}
          />
        </Description>
      )}
      <SearchResults
        isLoadingMore={search.isLoadingMore}
        onLoadMore={search.loadMore}
        emptyMessage={<EmptyMessage isSearching={search.isSearching} isError={search.isError} />}
      >
        {search.fromSender.length > 0 ? (
          <ListBox.Section id="sender">
            <Header>
              <FormattedMessage id="invoiceSearch.section.sender" values={{ sender: senderName }} />
            </Header>
            {search.fromSender.map((item) => (
              <InvoiceOption key={item.id} invoice={item} />
            ))}
          </ListBox.Section>
        ) : null}
        {search.others.length > 0 ? (
          <ListBox.Section id="others">
            {search.fromSender.length > 0 ? (
              <Header>
                <FormattedMessage id="invoiceSearch.section.others" />
              </Header>
            ) : null}
            {search.others.map((item) => (
              <InvoiceOption key={item.id} invoice={item} />
            ))}
          </ListBox.Section>
        ) : null}
      </SearchResults>
    </ComboBox>
  )
}

function EmptyMessage({ isSearching, isError }: { isSearching: boolean; isError: boolean }) {
  if (isSearching) return <FormattedMessage id="invoiceSearch.loading" />
  if (isError) return <InvoiceInputErrorMessage error={{ code: 'searchFailed' }} />
  return <FormattedMessage id="invoiceSearch.empty" />
}
