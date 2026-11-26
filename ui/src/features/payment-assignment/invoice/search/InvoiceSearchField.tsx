import { Header, ListBox } from '@heroui/react'
import { useState } from 'react'
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
  onSelect: (invoice: Invoice) => void
}

/** Invoice autocomplete with server-side search. A typed number is resolved with Enter. */
export function InvoiceSearchField({ customerId, senderName, start, onSelect }: InvoiceSearchFieldProps) {
  const intl = useIntl()
  const [text, setText] = useState(start.text)
  const [inputError, setInputError] = useState<InvoiceInputError | null>(null)
  const query = text.trim()

  const { invoices, fromSender, others, ...search } = useInvoiceSearch({ query, customerId })
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
    if ('invoice' in resolution) onSelect(resolution.invoice)
    else setInputError(resolution.error)
  }

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
        autoFocus: start.autoFocus,
        onKeyDown: (event) => {
          if (event.key === 'Enter') void resolveTypedInput()
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
