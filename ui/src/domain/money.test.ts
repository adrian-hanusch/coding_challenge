import { describe, expect, it } from 'vitest'

import { MAX_AMOUNT_MINOR, toAmountInput, toEuros } from './money.ts'

describe('toAmountInput', () => {
  it('converts euros to cents', () => {
    expect(toAmountInput(62.45)).toBe(6245)
    expect(toAmountInput(0)).toBe(0)
  })

  it('tolerates the float error of multiplying by 100', () => {
    expect(toAmountInput(0.29)).toBe(29)
    expect(toAmountInput(1152.91)).toBe(115291)
  })

  it('stays exact for amounts up to the maximum', () => {
    expect(toAmountInput(616582543.57)).toBe(61658254357)
    expect(toAmountInput(134221640.2)).toBe(13422164020)
    expect(toAmountInput(MAX_AMOUNT_MINOR / 100 - 0.01)).toBe(MAX_AMOUNT_MINOR - 1)
  })

  it('keeps more than two decimals as too precise instead of rounding', () => {
    expect(toAmountInput(62.456)).toEqual({ tooPrecise: 62.456 })
    expect(toAmountInput(0.0000001)).toEqual({ tooPrecise: 0.0000001 })
  })

  it('returns null for an empty field', () => {
    expect(toAmountInput(Number.NaN)).toBeNull()
  })
})

describe('toEuros', () => {
  it('reverses toAmountInput', () => {
    expect(toEuros(6245)).toBe(62.45)
    expect(toEuros({ tooPrecise: 62.456 })).toBe(62.456)
    expect(toEuros(null)).toBeNaN()
  })
})
