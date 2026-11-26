// @vitest-environment jsdom
import { I18nProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntlProvider } from 'react-intl'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import en from '../../i18n/messages/en.json'
import { PAYMENTS } from '../../mocks/fixtures.ts'
import { server } from '../../mocks/node.ts'
import { PaymentAssignment } from './PaymentAssignment.tsx'

const fixture = PAYMENTS.find(({ id }) => id === 'pay-exact')
if (!fixture) throw new Error('Fixture pay-exact is missing')
const payment = fixture

beforeAll(() => {
  // jsdom has none; React Aria uses it to load the next page of the list.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
  server.listen()
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})

function renderAssignment() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={en}>
        <I18nProvider locale="en">
          <PaymentAssignment payment={payment} onChangePayment={() => undefined} onAssigned={() => undefined} />
        </I18nProvider>
      </IntlProvider>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

const invoiceInput = () => screen.getByTestId('invoice-search-input')
const confirmButton = () => screen.getByTestId('confirm-open')
const feeInput = (type: string) => within(screen.getByTestId(`fee-${type}`)).getByRole('textbox')

async function selectInvoice418(user: ReturnType<typeof userEvent.setup>) {
  await user.type(invoiceInput(), '418{Enter}')
  await screen.findByTestId('change-invoice')
}

describe('confirm with input missing', () => {
  it('shows the missing invoice at its field and focuses it, without opening the list', async () => {
    const user = renderAssignment()
    await user.click(confirmButton())

    expect(screen.getByTestId('invoice-search-error').textContent).toBe(en['invoiceSearch.error.missing'])
    expect(document.activeElement).toBe(invoiceInput())
    expect(invoiceInput().getAttribute('aria-expanded')).toBe('false')
  })

  it('resolves a typed number that was not confirmed with Enter', async () => {
    const user = renderAssignment()
    await user.type(invoiceInput(), '418')
    await user.click(confirmButton())

    await screen.findByTestId('change-invoice')
    expect(screen.queryByTestId('invoice-search-error')).toBeNull()
  })

  it('reports a typed unknown number as not found instead of missing', async () => {
    const user = renderAssignment()
    await user.type(invoiceInput(), '9999')
    await user.click(confirmButton())

    const error = await screen.findByTestId('invoice-search-error')
    expect(error.textContent).toContain('9999')
    expect(document.activeElement).toBe(invoiceInput())
    expect(invoiceInput().getAttribute('aria-expanded')).toBe('false')
  })

  it('shows every missing fee and focuses the first one', async () => {
    const user = renderAssignment()
    await selectInvoice418(user)
    await user.click(confirmButton())

    const fees = ['PLATFORM_FEE', 'PROVIDER_FEE', 'LOGISTICS_FEE'].map(feeInput)
    expect(fees.map((input) => input.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true'])
    expect(document.activeElement).toBe(fees[0])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('focuses the split error when the fees exceed the payment', async () => {
    const user = renderAssignment()
    await selectInvoice418(user)
    await user.type(feeInput('PLATFORM_FEE'), '2000')
    await user.type(feeInput('PROVIDER_FEE'), '0')
    await user.type(feeInput('LOGISTICS_FEE'), '0')
    await user.click(confirmButton())

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('split-error'))
    })
  })
})
