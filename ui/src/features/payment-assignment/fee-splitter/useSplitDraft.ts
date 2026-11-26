import { useState } from 'react'

import type { Money } from '../../../api/types.ts'
import type { AmountInput } from '../../../domain/money.ts'
import {
  evaluateSplit,
  FEE_TYPES,
  type FeeType,
  INITIAL_SPLIT_DRAFT,
  type SplitDraft,
  withFee,
  withMerchantPayout,
} from '../../../domain/split.ts'

/** Entered split, its evaluation and which fee errors are shown. Updaters keep changes of one event from overwriting each other. */
export function useSplitDraft(paymentAmount: Money) {
  const [draft, setDraft] = useState<SplitDraft>(INITIAL_SPLIT_DRAFT)
  const [touchedFees, setTouchedFees] = useState<ReadonlySet<FeeType>>(new Set())

  return {
    draft,
    evaluation: evaluateSplit(paymentAmount.amountMinor, draft),
    /** Fees whose "missing" error is shown, i.e. the user has left the field. */
    touchedFees,
    setFee: (type: FeeType, value: AmountInput) => {
      setDraft((current) => withFee(current, type, value))
    },
    setMerchantPayout: (value: AmountInput) => {
      setDraft((current) => withMerchantPayout(current, value, paymentAmount.amountMinor))
    },
    touchFee: (type: FeeType) => {
      setTouchedFees((current) => (current.has(type) ? current : new Set(current).add(type)))
    },
    touchAllFees: () => {
      setTouchedFees(new Set(FEE_TYPES))
    },
  }
}

export type SplitDraftState = ReturnType<typeof useSplitDraft>
