import { Description, FieldError, InputGroup, Label, NumberField } from '@heroui/react'
import { type ReactNode, useMemo } from 'react'
import { useIntl } from 'react-intl'

import type { Money } from '../api/types.ts'
import { type AmountInput, MAX_AMOUNT_MINOR, stripCurrency, toAmountInput, toEuros } from '../lib/money.ts'

interface MoneyFieldProps {
  label: ReactNode
  value: AmountInput
  onChange: (value: AmountInput) => void
  currency: Money['currency']
  description?: ReactNode
  error?: ReactNode
  onBlur?: () => void
  'aria-describedby'?: string
  'data-testid'?: string
}

/**
 * Amount input in the active locale that works in integer cents, with the currency symbol as a suffix. React Aria parses
 * the locale's separators and blocks negative input. A value with more decimals than cents is passed on as too precise
 * instead of being rounded.
 */
export function MoneyField({
  label,
  value,
  onChange,
  currency,
  description,
  error,
  onBlur,
  'aria-describedby': describedBy,
  'data-testid': testId,
}: MoneyFieldProps) {
  const intl = useIntl()
  // The symbol is in the suffix, so the number itself is formatted without it. A high maximum keeps React Aria from
  // rounding to cents on commit. React Aria also rebuilds its number parser whenever this object's identity changes.
  const formatOptions = useMemo(() => ({ minimumFractionDigits: 2, maximumFractionDigits: 10 }), [])
  const symbol =
    intl.formatNumberToParts(0, { style: 'currency', currency }).find((part) => part.type === 'currency')?.value ??
    currency

  return (
    <NumberField
      fullWidth
      // Scrolling the page over a focused field must not change the amount.
      isWheelDisabled
      minValue={0}
      maxValue={MAX_AMOUNT_MINOR / 100}
      formatOptions={formatOptions}
      value={toEuros(value)}
      onChange={(euros) => {
        onChange(toAmountInput(euros))
      }}
      onBlur={onBlur}
      isInvalid={error != null}
      aria-describedby={describedBy}
      data-testid={testId}
    >
      <Label>{label}</Label>
      <InputGroup fullWidth>
        {/* min-w-0: otherwise the input keeps its default width of 20 characters and pushes the suffix out of narrow fields. */}
        <InputGroup.Input
          className="min-w-0 tabular-nums"
          placeholder={intl.formatNumber(0, { minimumFractionDigits: 2 })}
          onPaste={(event) => {
            const text = event.clipboardData.getData('text')
            const amount = stripCurrency(text, symbol, currency)
            if (amount === text) return
            event.preventDefault()
            const input = event.currentTarget
            input.setRangeText(amount, input.selectionStart ?? 0, input.selectionEnd ?? input.value.length, 'end')
            // React only notices the native change through an input event; React Aria then validates it like typing.
            input.dispatchEvent(new Event('input', { bubbles: true }))
          }}
        />
        <InputGroup.Suffix>{symbol}</InputGroup.Suffix>
      </InputGroup>
      {error != null && <FieldError>{error}</FieldError>}
      {error == null && description != null && <Description>{description}</Description>}
    </NumberField>
  )
}
