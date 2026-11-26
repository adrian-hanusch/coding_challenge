import { Header, ListBox } from '@heroui/react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import type { Invoice } from '../../../../api/types.ts'
import { SearchField } from '../../../../components/search/SearchField.tsx'
import { type InvoiceInputError, SEARCH_FAILED } from './invoiceInput.ts'
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
  /** Shows that an invoice is missing whenever it increases. */
  errorRequest: number
  onSelect: (invoice: Invoice) => void
}

const MISSING: InvoiceInputError = { code: 'missing' }

/** Invoice autocomplete with server-side search. A typed number is resolved with Enter. */
export function InvoiceSearchField({ customerId, senderName, start, errorRequest, onSelect }: InvoiceSearchFieldProps) {
  const intl = useIntl()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(start.text)
  const [inputError, setInputError] = useState<InvoiceInputError | null>(null)
  const query = text.trim()

  // Starts at the current request, so reopening the search after "Change invoice" shows no error.
  const [shownRequest, setShownRequest] = useState(errorRequest)
  if (errorRequest !== shownRequest) {
    setShownRequest(errorRequest)
    // Set during render, so the page finds the invalid field when it moves focus to the first error.
    if (query === '') setInputError(MISSING)
  }

  const { invoices, fromSender, others, ...search } = useInvoiceSearch({ query, customerId })
  const { track, lookup } = useInvoiceNumberLookup(customerId, start.text)

  function changeText(next: string) {
    track(next)
    setText(next)
    setInputError(null)
  }

  async function resolveTypedInput({ focusOnError }: { focusOnError: boolean }) {
    if (query === '') return
    const resolution = await lookup(query)
    if (!resolution) return
    if ('invoice' in resolution) {
      onSelect(resolution.invoice)
      return
    }
    if (!focusOnError) {
      setInputError(resolution.error)
      return
    }
    // Rendered first, so the invalid field no longer opens its list on focus.
    flushSync(() => {
      setInputError(resolution.error)
    })
    inputRef.current?.focus()
  }

  // A typed number that was not confirmed with Enter is resolved instead of being reported as missing.
  const resolveOnRequest = useEffectEvent(() => {
    if (query !== '' && !inputError) void resolveTypedInput({ focusOnError: true })
  })
  const handledRequest = useRef(errorRequest)
  useEffect(() => {
    if (errorRequest === handledRequest.current) return
    handledRequest.current = errorRequest
    resolveOnRequest()
  }, [errorRequest])

  return (
    <SearchField<Invoice>
      label={<FormattedMessage id="invoiceSearch.label" />}
      placeholder={intl.formatMessage({ id: 'invoiceSearch.placeholder' })}
      loadingLabel={intl.formatMessage({ id: 'invoiceSearch.loading' })}
      description={
        <FormattedMessage
          id={customerId ? 'invoiceSearch.descriptionWithSender' : 'invoiceSearch.description'}
          values={{ sender: senderName }}
        />
      }
      inputError={inputError ? <InvoiceInputErrorMessage error={inputError} /> : null}
      searchErrorMessage={<InvoiceInputErrorMessage error={SEARCH_FAILED} />}
      emptyMessage={<FormattedMessage id="invoiceSearch.empty" />}
      allowsCustomValue
      items={invoices}
      inputValue={text}
      onInputChange={changeText}
      onChange={(key) => {
        const next = invoices.find((item) => item.id === key)
        if (next) onSelect(next)
      }}
      search={search}
      input={{
        ref: inputRef,
        autoFocus: start.autoFocus,
        onKeyDown: (event) => {
          if (event.key === 'Enter') void resolveTypedInput({ focusOnError: false })
        },
      }}
      data-testid="invoice-search"
    >
      {fromSender.length > 0 ? (
        <ListBox.Section id="sender">
          <Header>
            <FormattedMessage id="invoiceSearch.section.sender" values={{ sender: senderName }} />
          </Header>
          {fromSender.map((item) => (
            <InvoiceOption key={item.id} invoice={item} />
          ))}
        </ListBox.Section>
      ) : null}
      {others.length > 0 ? (
        <ListBox.Section id="others">
          {fromSender.length > 0 ? (
            <Header>
              <FormattedMessage id="invoiceSearch.section.others" />
            </Header>
          ) : null}
          {others.map((item) => (
            <InvoiceOption key={item.id} invoice={item} />
          ))}
        </ListBox.Section>
      ) : null}
    </SearchField>
  )
}
