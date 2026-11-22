import { Button, Description, FieldError, Input, Label, TextField } from '@heroui/react'
import { type SyntheticEvent, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { assignPaymentPath } from '../../app/paths.ts'

export function OpenPaymentForm() {
  const navigate = useNavigate()
  const [paymentId, setPaymentId] = useState('')
  const [isMissing, setIsMissing] = useState(false)

  function submit(event: SyntheticEvent) {
    event.preventDefault()
    const id = paymentId.trim()
    if (id === '') setIsMissing(true)
    else void navigate(assignPaymentPath(id))
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <TextField
        fullWidth
        variant="secondary"
        value={paymentId}
        onChange={(value) => {
          setPaymentId(value)
          setIsMissing(false)
        }}
        isInvalid={isMissing}
        data-testid="open-payment-field"
      >
        <Label>
          <FormattedMessage id="payments.open.label" />
        </Label>
        <Input data-testid="open-payment-input" />
        {isMissing ? (
          <FieldError>
            <FormattedMessage id="payments.open.missing" />
          </FieldError>
        ) : (
          <Description>
            <FormattedMessage id="payments.open.description" />
          </Description>
        )}
      </TextField>
      <Button type="submit" className="shrink-0 sm:mt-6" data-testid="open-payment-submit">
        <FormattedMessage id="payments.open.submit" />
      </Button>
    </form>
  )
}
