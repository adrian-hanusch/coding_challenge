import { Button, Separator } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { Money } from '../../../api/types.ts'
import { MoneyField } from '../../../components/MoneyField.tsx'
import { FEE_TYPES, type SplitEvaluation, type SplitFieldError } from '../../../domain/split.ts'
import type { AmountInput } from '../../../lib/money.ts'
import { useFormatCents } from '../../../lib/useFormatMoney.ts'
import { SplitErrorAlert } from './SplitErrorAlert.tsx'
import type { SplitDraftState } from './useSplitDraft.ts'

interface FeeSplitterProps {
  paymentAmount: Money
  split: SplitDraftState
}

/** Fee inputs and the merchant payout, which defaults to the payment minus all fees and can be overridden. */
export function FeeSplitter({ paymentAmount, split }: FeeSplitterProps) {
  const { draft, evaluation, touchedFees } = split
  const formatCents = useFormatCents(paymentAmount.currency)

  return (
    <div className="@container flex flex-col gap-6" data-testid="fee-splitter">
      {/* Container query: the card is much narrower than the viewport while the sidebar is open. */}
      <div className="grid grid-cols-1 gap-5 @xl:grid-cols-3">
        {FEE_TYPES.map((type) => {
          const fieldError = evaluation.fieldErrors[type]
          const visibleError = fieldError === 'missing' && !touchedFees.has(type) ? undefined : fieldError
          return (
            <MoneyField
              key={type}
              label={<FormattedMessage id="split.type" values={{ type }} />}
              value={draft.fees[type]}
              onChange={(value) => {
                split.setFee(type, value)
              }}
              onBlur={() => {
                split.touchFee(type)
              }}
              currency={paymentAmount.currency}
              error={visibleError ? <FieldErrorMessage error={visibleError} /> : undefined}
              description={<FormattedMessage id="feeSplit.feeHint" values={{ zero: formatCents(0) }} />}
              data-testid={`fee-${type}`}
            />
          )
        })}
      </div>

      <Separator />

      <MerchantPayoutField paymentAmount={paymentAmount} evaluation={evaluation} onChange={split.setMerchantPayout} />

      {evaluation.error ? <SplitErrorAlert error={evaluation.error} paymentAmount={paymentAmount} /> : null}
    </div>
  )
}

function FieldErrorMessage({ error }: { error: SplitFieldError }) {
  switch (error) {
    case 'missing':
      return <FormattedMessage id="feeSplit.error.missing" />
    case 'tooPrecise':
      return <FormattedMessage id="feeSplit.error.tooPrecise" />
  }
}

interface MerchantPayoutFieldProps {
  paymentAmount: Money
  evaluation: SplitEvaluation
  onChange: (value: AmountInput) => void
}

function MerchantPayoutField({ paymentAmount, evaluation, onChange }: MerchantPayoutFieldProps) {
  const fieldError = evaluation.fieldErrors.MERCHANT_PAYOUT

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
      <div className="sm:flex-1">
        <MoneyField
          label={<FormattedMessage id="split.type" values={{ type: 'MERCHANT_PAYOUT' }} />}
          value={evaluation.displayedPayout}
          onChange={onChange}
          currency={paymentAmount.currency}
          error={fieldError ? <FieldErrorMessage error={fieldError} /> : undefined}
          description={<FormattedMessage id="feeSplit.payout.description" />}
          data-testid="merchant-payout"
        />
      </div>
      {evaluation.isOverridden ? (
        <Button
          variant="tertiary"
          size="sm"
          className="self-start sm:mt-6"
          onPress={() => {
            onChange(null)
          }}
          data-testid="merchant-payout-reset"
        >
          <FormattedMessage id="feeSplit.payout.useCalculated" />
        </Button>
      ) : null}
    </div>
  )
}
