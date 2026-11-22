import {
  ComboBox,
  Description,
  FieldError,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxLoadMoreItem,
  Spinner,
} from '@heroui/react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import type { Invoice } from '../../../../api/types.ts'
import { Typography } from '../../../../components/Typography.tsx'
import type { InvoiceInputError } from './invoiceInput.ts'
import { InvoiceInputErrorMessage } from './InvoiceInputErrorMessage.tsx'
import { InvoiceOption } from './InvoiceOption.tsx'
import { useInvoiceNumberLookup } from './useInvoiceNumberLookup.ts'
import { useInvoiceSearch } from './useInvoiceSearch.ts'

const POPOVER_MAX_HEIGHT_PX = 320

interface InvoiceSearchFieldProps {
  customerId: string | null
  senderName: string
  invoice: Invoice | null
  onInvoiceChange: (invoice: Invoice | null) => void
}

/** Invoice autocomplete with server-side search. A typed number is resolved on blur or Enter. */
export function InvoiceSearchField({ customerId, senderName, invoice, onInvoiceChange }: InvoiceSearchFieldProps) {
  const intl = useIntl()
  const [draft, setDraft] = useState('')
  const [inputError, setInputError] = useState<InvoiceInputError | null>(null)

  const inputValue = invoice?.invoiceNumber ?? draft
  const query = inputValue.trim()
  const search = useInvoiceSearch({ query, customerId, enabled: invoice === null })
  const { track, lookup } = useInvoiceNumberLookup(customerId)

  function setText(text: string) {
    track(text)
    setDraft(text)
    setInputError(null)
  }

  function select(next: Invoice) {
    setText(next.invoiceNumber)
    onInvoiceChange(next)
  }

  function changeText(text: string) {
    setText(text)
    if (invoice && text !== invoice.invoiceNumber) onInvoiceChange(null)
  }

  async function resolveTypedInput() {
    if (invoice || query === '') return
    const resolution = await lookup(query)
    if (!resolution) return
    if ('invoice' in resolution) select(resolution.invoice)
    else setInputError(resolution.error)
  }

  const error = inputError ?? (search.isError ? ({ code: 'searchFailed' } as const) : null)

  return (
    <ComboBox<Invoice>
      fullWidth
      variant="secondary"
      allowsCustomValue
      allowsEmptyCollection
      isInvalid={error !== null}
      items={search.invoices}
      disabledKeys={search.disabledKeys}
      inputValue={inputValue}
      onInputChange={changeText}
      value={invoice?.id ?? null}
      onChange={(key) => {
        const next = search.invoices.find((item) => item.id === key)
        if (next) select(next)
      }}
      data-testid="invoice-search"
    >
      <Label>
        <FormattedMessage id="invoiceSearch.label" />
      </Label>
      <ComboBox.InputGroup>
        <Input
          placeholder={intl.formatMessage({ id: 'invoiceSearch.placeholder' })}
          onBlur={() => void resolveTypedInput()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void resolveTypedInput()
          }}
          data-testid="invoice-search-input"
        />
        <ComboBox.Trigger>
          {search.isSearching ? (
            <Spinner size="sm" aria-label={intl.formatMessage({ id: 'invoiceSearch.loading' })} />
          ) : undefined}
        </ComboBox.Trigger>
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
      <ComboBox.Popover maxHeight={POPOVER_MAX_HEIGHT_PX}>
        <ListBox
          renderEmptyState={() => (
            <Typography type="body-sm" color="muted" align="center" className="px-3 py-6">
              <FormattedMessage id={search.isSearching ? 'invoiceSearch.loading' : 'invoiceSearch.empty'} />
            </Typography>
          )}
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
          <ListBoxLoadMoreItem isLoading={search.isLoadingMore} onLoadMore={search.loadMore}>
            <div className="flex justify-center py-2">
              <Spinner size="sm" />
            </div>
          </ListBoxLoadMoreItem>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}
