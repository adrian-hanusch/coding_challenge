/**
 * Removes the currency symbol, the currency code and spaces from pasted text such as "1.249,00 €" or "EUR 62.45".
 * The field shows the currency as a suffix and only parses plain numbers, so it would reject such text as a whole.
 */
export function stripCurrency(text: string, symbol: string, currency: string): string {
  return [symbol, currency].reduce((rest, token) => rest.split(token).join(''), text).replace(/\s/g, '')
}
