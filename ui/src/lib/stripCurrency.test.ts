import { describe, expect, it } from 'vitest'

import { stripCurrency } from './stripCurrency.ts'

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
