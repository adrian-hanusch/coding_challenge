// @vitest-environment jsdom
import { I18nProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { IntlProvider } from 'react-intl'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Payment } from '../../api/types.ts'
import en from '../../i18n/messages/en.json'
import { db } from '../../mocks/db.ts'
import { PAYMENTS } from '../../mocks/fixtures.ts'
import { server } from '../../mocks/node.ts'
import { problem } from '../../mocks/problem.ts'
import { PaymentAssignment } from './PaymentAssignment.tsx'

function paymentFixture(id: string): Payment {
  const payment = PAYMENTS.find((candidate) => candidate.id === id)
  if (!payment) throw new Error(`Fixture ${id} is missing`)
  return payment
}

const ASSIGNMENT_URL = '/api/payments/:paymentId/assignment'

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
  db.reset()
})
afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})

type User = ReturnType<typeof userEvent.setup>

function renderAssignment({ paymentId = 'pay-exact', onAssigned = () => undefined } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={en}>
        <I18nProvider locale="en">
          <PaymentAssignment
            payment={paymentFixture(paymentId)}
            onChangePayment={() => undefined}
            onAssigned={onAssigned}
          />
        </I18nProvider>
      </IntlProvider>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

const invoiceInput = () => screen.getByTestId('invoice-search-input')
const confirmButton = () => screen.getByTestId('confirm-open')
const submitButton = () => screen.getByTestId('confirm-submit')
const feeInput = (type: string) => within(screen.getByTestId(`fee-${type}`)).getByRole('textbox')
const payoutInput = () => within(screen.getByTestId('merchant-payout')).getByRole('textbox')

async function selectInvoice(user: User, invoiceNumber: string) {
  await user.type(invoiceInput(), `${invoiceNumber}{Enter}`)
  await screen.findByTestId('change-invoice')
}

const selectInvoice418 = (user: User) => selectInvoice(user, '418')

async function enterFees(user: User, platform: string, provider: string, logistics: string) {
  await user.type(feeInput('PLATFORM_FEE'), platform)
  await user.type(feeInput('PROVIDER_FEE'), provider)
  await user.type(feeInput('LOGISTICS_FEE'), logistics)
  await user.tab()
}

/** Records the body of every assignment request and lets the mock handler answer it. */
function recordAssignmentRequests() {
  const bodies: unknown[] = []
  server.use(
    http.post(ASSIGNMENT_URL, async ({ request }) => {
      bodies.push(await request.clone().json())
    }),
  )
  return bodies
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

describe('confirm an assignment', () => {
  it('sends the split in cents and reports the assignment', async () => {
    const onAssigned = vi.fn()
    const user = renderAssignment({ onAssigned })
    const bodies = recordAssignmentRequests()
    await selectInvoice418(user)
    await enterFees(user, '10', '5', '2')

    expect(payoutInput()).toHaveProperty('value', '1,232.00')
    await user.click(confirmButton())

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByTestId('breakdown-PAYMENT').textContent).toContain('€1,249.00')
    expect(within(dialog).getByTestId('breakdown-PLATFORM_FEE').textContent).toContain('-€10.00')
    expect(within(dialog).getByTestId('breakdown-MERCHANT_PAYOUT').textContent).toContain('€1,232.00')
    expect(within(dialog).getByTestId('selected-invoice').textContent).toContain('418')

    await user.click(submitButton())

    await waitFor(() => {
      expect(onAssigned).toHaveBeenCalledOnce()
    })
    const invoice = db.listInvoices().find(({ invoiceNumber }) => invoiceNumber === '418')
    expect(bodies).toEqual([
      {
        invoiceId: invoice?.id,
        splits: [
          { type: 'PLATFORM_FEE', amount: { amountMinor: 1000, currency: 'EUR' } },
          { type: 'PROVIDER_FEE', amount: { amountMinor: 500, currency: 'EUR' } },
          { type: 'LOGISTICS_FEE', amount: { amountMinor: 200, currency: 'EUR' } },
          { type: 'MERCHANT_PAYOUT', amount: { amountMinor: 123200, currency: 'EUR' } },
        ],
      },
    ])
  })

  it('blocks a payout that does not add up until the calculated value is restored', async () => {
    const user = renderAssignment()
    await selectInvoice418(user)
    await enterFees(user, '10', '5', '2')

    await user.clear(payoutInput())
    await user.type(payoutInput(), '1000')
    await user.tab()

    expect(screen.getByTestId('split-error').textContent).toContain('€232.00')
    await user.click(confirmButton())
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByTestId('split-error'))

    await user.click(screen.getByTestId('merchant-payout-reset'))

    expect(screen.queryByTestId('split-error')).toBeNull()
    expect(payoutInput()).toHaveProperty('value', '1,232.00')
  })

  it('requires the amount mismatch to be acknowledged before assigning', async () => {
    const onAssigned = vi.fn()
    const user = renderAssignment({ paymentId: 'pay-mismatch', onAssigned })
    const bodies = recordAssignmentRequests()
    await selectInvoice(user, '502')
    await enterFees(user, '0', '0', '0')
    await user.click(confirmButton())

    const mismatch = await screen.findByTestId('confirm-mismatch')
    expect(mismatch.textContent).toContain('€50.00')

    await user.click(submitButton())
    expect(mismatch.textContent).toContain(en['confirm.acknowledge.required'].replace('{difference}', '€50.00'))
    expect(bodies).toEqual([])

    await user.click(within(mismatch).getByRole('checkbox'))
    await user.click(submitButton())

    await waitFor(() => {
      expect(onAssigned).toHaveBeenCalledOnce()
    })
    expect(bodies).toHaveLength(1)
  })

  it('reports a payment assigned in the meantime and offers no retry', async () => {
    const onAssigned = vi.fn()
    const user = renderAssignment({ onAssigned })
    server.use(http.post(ASSIGNMENT_URL, () => problem(409, 'PAYMENT_ALREADY_ASSIGNED', 'Payment is already assigned')))
    await selectInvoice418(user)
    await enterFees(user, '0', '0', '0')
    await user.click(confirmButton())
    await user.click(await screen.findByTestId('confirm-submit'))

    const error = await screen.findByTestId('assignment-error')
    expect(error.textContent).toContain(en['assignment.error.alreadyAssigned'])
    expect(submitButton()).toHaveProperty('disabled', true)
    expect(onAssigned).not.toHaveBeenCalled()
  })

  it('lets the user retry after a server error', async () => {
    const onAssigned = vi.fn()
    const user = renderAssignment({ onAssigned })
    server.use(http.post(ASSIGNMENT_URL, () => problem(500, 'INTERNAL_ERROR', 'Internal error'), { once: true }))
    await selectInvoice418(user)
    await enterFees(user, '0', '0', '0')
    await user.click(confirmButton())
    await user.click(await screen.findByTestId('confirm-submit'))

    const error = await screen.findByTestId('assignment-error')
    expect(error.textContent).toContain(en['assignment.error.unconfirmed'])
    expect(submitButton()).toHaveProperty('disabled', false)

    await user.click(submitButton())

    await waitFor(() => {
      expect(onAssigned).toHaveBeenCalledOnce()
    })
  })
})
