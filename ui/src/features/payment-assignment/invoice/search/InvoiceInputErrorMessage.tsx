import { FormattedMessage } from 'react-intl'

import type { InvoiceInputError } from './invoiceInput.ts'

export function InvoiceInputErrorMessage({ error }: { error: InvoiceInputError }) {
  switch (error.code) {
    case 'missing':
      return <FormattedMessage id="invoiceSearch.error.missing" />
    case 'notFound':
      return <FormattedMessage id="invoiceSearch.error.notFound" values={{ query: error.query }} />
    case 'notOpen':
      return <FormattedMessage id="invoiceSearch.error.notOpen" values={{ number: error.invoice.invoiceNumber }} />
    case 'searchFailed':
      return <FormattedMessage id="invoiceSearch.error.searchFailed" />
  }
}
