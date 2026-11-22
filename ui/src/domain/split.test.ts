import { describe, expect, it } from 'vitest'

import { EMPTY_SPLIT_DRAFT, evaluateSplit, type SplitDraft, withFee, withMerchantPayout } from './split.ts'

const PAYMENT = 124900
const TOO_PRECISE = { tooPrecise: 0.001 }

function draft(fees: Partial<SplitDraft['fees']>, merchantOverride: SplitDraft['merchantOverride'] = null): SplitDraft {
  return { fees: { ...EMPTY_SPLIT_DRAFT.fees, ...fees }, merchantOverride }
}

const COMPLETE_FEES = { PLATFORM_FEE: 6245, PROVIDER_FEE: 1874, LOGISTICS_FEE: 1490 }

describe('evaluateSplit', () => {
  it('calculates the payout as payment minus all fees', () => {
    const result = evaluateSplit(PAYMENT, draft(COMPLETE_FEES))

    expect(result.calculatedPayout).toBe(115291)
    expect(result.displayedPayout).toBe(115291)
    expect(result.isOverridden).toBe(false)
    expect(result.fieldErrors).toEqual({})
    expect(result.error).toBeNull()
    expect(result.validSplit).toEqual({ ...COMPLETE_FEES, MERCHANT_PAYOUT: 115291 })
  })

  it('has no valid split while a field is missing or too precise', () => {
    expect(evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, LOGISTICS_FEE: null })).validSplit).toBeNull()
    expect(evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, PROVIDER_FEE: TOO_PRECISE })).validSplit).toBeNull()
  })

  it('has no valid split while the sum does not match', () => {
    expect(evaluateSplit(PAYMENT, draft(COMPLETE_FEES, 114391)).validSplit).toBeNull()
  })

  it('reports empty fees as missing and counts them as 0', () => {
    const result = evaluateSplit(PAYMENT, draft({ PLATFORM_FEE: 6245 }))

    expect(result.calculatedPayout).toBe(PAYMENT - 6245)
    expect(result.fieldErrors).toEqual({ PROVIDER_FEE: 'missing', LOGISTICS_FEE: 'missing' })
  })

  it('accepts 0 as a fee', () => {
    const result = evaluateSplit(PAYMENT, draft({ PLATFORM_FEE: 0, PROVIDER_FEE: 0, LOGISTICS_FEE: 0 }))

    expect(result.fieldErrors).toEqual({})
    expect(result.displayedPayout).toBe(PAYMENT)
  })

  it('reports amounts with more than two decimals per field', () => {
    const result = evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, PLATFORM_FEE: TOO_PRECISE }, TOO_PRECISE))

    expect(result.fieldErrors).toEqual({ PLATFORM_FEE: 'tooPrecise', MERCHANT_PAYOUT: 'tooPrecise' })
  })

  it('reports fees that exceed the payment and hides the negative payout', () => {
    const result = evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, PROVIDER_FEE: 120000 }))

    expect(result.error).toEqual({ code: 'feesExceedPayment', excess: 2835 })
    expect(result.displayedPayout).toBeNull()
  })

  it('reports fees that exceed the payment even while other fees are missing', () => {
    const result = evaluateSplit(PAYMENT, draft({ PLATFORM_FEE: 130000 }))

    expect(result.error).toEqual({ code: 'feesExceedPayment', excess: 5100 })
  })

  it('prefers the fee error over a mismatching override', () => {
    const result = evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, PROVIDER_FEE: 120000 }, 100000))

    expect(result.error?.code).toBe('feesExceedPayment')
    expect(result.displayedPayout).toBe(100000)
  })

  it('reports an override that does not balance the split', () => {
    const result = evaluateSplit(PAYMENT, draft(COMPLETE_FEES, 114391))

    expect(result.isOverridden).toBe(true)
    expect(result.error).toEqual({ code: 'sumMismatch', total: 124000, difference: 900 })
  })

  it('reports an override that is too high as a negative difference', () => {
    const result = evaluateSplit(PAYMENT, draft(COMPLETE_FEES, 116291))

    expect(result.error).toEqual({ code: 'sumMismatch', total: 125900, difference: -1000 })
  })

  it('does not check the sum while a field is invalid', () => {
    expect(evaluateSplit(PAYMENT, draft({}, 115291)).error).toBeNull()
    expect(evaluateSplit(PAYMENT, draft({ ...COMPLETE_FEES, LOGISTICS_FEE: TOO_PRECISE }, 115291)).error).toBeNull()
  })
})

describe('withMerchantPayout', () => {
  it('stores a value that differs from the calculated payout', () => {
    expect(withMerchantPayout(draft(COMPLETE_FEES), 100000, PAYMENT).merchantOverride).toBe(100000)
  })

  it('drops an override equal to the calculated payout', () => {
    expect(withMerchantPayout(draft(COMPLETE_FEES, 100000), 115291, PAYMENT).merchantOverride).toBeNull()
  })

  it('drops the override when the field is cleared', () => {
    expect(withMerchantPayout(draft(COMPLETE_FEES, 100000), null, PAYMENT).merchantOverride).toBeNull()
  })

  it('keeps a too precise value so it can be reported', () => {
    expect(withMerchantPayout(draft(COMPLETE_FEES), TOO_PRECISE, PAYMENT).merchantOverride).toEqual(TOO_PRECISE)
  })
})

describe('withFee', () => {
  it('changes only the given fee', () => {
    const before = draft(COMPLETE_FEES, 100000)
    const after = withFee(before, 'PROVIDER_FEE', null)

    expect(after.fees).toEqual({ ...COMPLETE_FEES, PROVIDER_FEE: null })
    expect(after.merchantOverride).toBe(100000)
    expect(before.fees.PROVIDER_FEE).toBe(1874)
  })
})
