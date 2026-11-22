import { Checkbox, Description, FieldError, Label } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { Money } from '../../../api/types.ts'
import { useFormatCents } from '../../../lib/useFormatMoney.ts'
import { InvoiceMismatchAlert } from './InvoiceMismatchAlert.tsx'

interface MismatchAcknowledgementProps {
  currency: Money['currency']
  /** Payment minus invoice amount, not 0. */
  difference: number
  isAcknowledged: boolean
  showError: boolean
  isDisabled: boolean
  onChange: (isAcknowledged: boolean) => void
}

export function MismatchAcknowledgement({
  currency,
  difference,
  isAcknowledged,
  showError,
  isDisabled,
  onChange,
}: MismatchAcknowledgementProps) {
  const formatCents = useFormatCents(currency)
  const amount = formatCents(Math.abs(difference))

  return (
    <div className="flex flex-col gap-3" data-testid="confirm-mismatch">
      <InvoiceMismatchAlert difference={difference} currency={currency} />
      <Checkbox
        isSelected={isAcknowledged}
        onChange={onChange}
        isInvalid={showError}
        isDisabled={isDisabled}
        data-testid="confirm-acknowledge"
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Label>
            <FormattedMessage id="confirm.acknowledge" values={{ difference: amount }} />
          </Label>
        </Checkbox.Content>
        {showError ? (
          <FieldError>
            <FormattedMessage id="confirm.acknowledge.required" values={{ difference: amount }} />
          </FieldError>
        ) : (
          <Description>
            <FormattedMessage id="confirm.acknowledge.description" />
          </Description>
        )}
      </Checkbox>
    </div>
  )
}
