import { describe, expect, it } from 'vitest'

import { stripCurrency, toAmountInput, toEuros } from './money.ts'

describe('stripCurrency', () => {
  it('removes symbol, code and spaces around the number', () => {
    expect(stripCurrency('1.249,00 €', '€', 'EUR')).toBe('1.249,00')
    expect(stripCurrency('€62.45', '€', 'EUR')).toBe('62.45')
    expect(stripCurrency('EUR 62.45', '€', 'EUR')).toBe('62.45')
  })

  it('leaves plain numbers unchanged', () => {
    expect(stripCurrency('62,45', '€', 'EUR')).toBe('62,45')
  })
})

describe('toAmountInput', () => {
  it('converts euros to cents', () => {
    expect(toAmountInput(62.45)).toBe(6245)
    expect(toAmountInput(0)).toBe(0)
  })

  it('tolerates the float error of multiplying by 100', () => {
    expect(toAmountInput(0.29)).toBe(29)
    expect(toAmountInput(1152.91)).toBe(115291)
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
