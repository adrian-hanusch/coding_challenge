import type { Invoice, InvoiceStatus, Money, Payment, PaymentAssignment } from '../api/types.ts'

// Fixed ids so every case can be opened by URL and tests stay reproducible. Cases: ui/README.md, "Testfälle".

const eur = (amountMinor: number): Money => ({ amountMinor, currency: 'EUR' })

const MERCHANTS = {
  nordwind: { id: 'm-nordwind', name: 'Nordwind Elektronik' },
  nordlicht: { id: 'm-nordlicht', name: 'Nordlicht Möbel' },
  bergblick: { id: 'm-bergblick', name: 'Bergblick Outdoor' },
  stadtgarten: { id: 'm-stadtgarten', name: 'Stadtgarten Feinkost' },
  kuestenrad: { id: 'm-kuestenrad', name: 'Küstenrad Fahrräder' },
} as const

const CUSTOMERS = {
  max: 'c-max-mustermann',
  erika: 'c-erika-musterfrau',
  anna: 'c-anna-schmidt',
  jonas: 'c-jonas-becker',
  lena: 'c-lena-wagner',
} as const

function invoice(
  invoiceNumber: string,
  merchant: Invoice['merchant'],
  customerId: string,
  amountMinor: number,
  dueDate: string,
  status: InvoiceStatus = 'OPEN',
): Invoice {
  return { id: `inv-${invoiceNumber}`, invoiceNumber, merchant, customerId, amount: eur(amountMinor), status, dueDate }
}

const MERCHANT_CYCLE = Object.values(MERCHANTS)

// 28 invoices for one customer: enough for three pages at the default limit of 10. Every third due date repeats,
// so the invoiceNumber tie-breaker of the sort order matters.
const manyInvoices: Invoice[] = Array.from({ length: 28 }, (_, index) => {
  const merchant = MERCHANT_CYCLE[index % MERCHANT_CYCLE.length] ?? MERCHANTS.nordwind
  const day = String(1 + Math.floor(index / 3) * 3).padStart(2, '0')
  const status: InvoiceStatus = index % 7 === 6 ? 'PAID' : 'OPEN'
  return invoice(
    `RE-2026-${String(1001 + index)}`,
    merchant,
    CUSTOMERS.jonas,
    2990 + index * 1250,
    `2026-11-${day}`,
    status,
  )
})

export const INVOICES: readonly Invoice[] = [
  // pay-exact: RE-2026-0418 matches the payment amount. Same due date as 0419 to exercise the tie-breaker.
  invoice('RE-2026-0418', MERCHANTS.nordwind, CUSTOMERS.max, 124900, '2026-10-31'),
  invoice('RE-2026-0419', MERCHANTS.nordlicht, CUSTOMERS.max, 59900, '2026-10-31'),
  invoice('RE-2026-0420', MERCHANTS.bergblick, CUSTOMERS.max, 18950, '2026-09-30', 'PAID'),
  invoice('RE-2026-0377', MERCHANTS.nordwind, CUSTOMERS.max, 7990, '2026-08-15', 'CANCELLED'),

  // pay-mismatch: RE-2026-0502 is €50.00 above the payment (A4).
  invoice('RE-2026-0502', MERCHANTS.stadtgarten, CUSTOMERS.erika, 39950, '2026-11-05'),
  invoice('RE-2026-0503', MERCHANTS.kuestenrad, CUSTOMERS.erika, 89000, '2026-11-20'),

  // pay-assigned: already paid by that payment.
  invoice('RE-2026-0311', MERCHANTS.bergblick, CUSTOMERS.anna, 8990, '2026-10-01', 'PAID'),
  invoice('RE-2026-0312', MERCHANTS.nordlicht, CUSTOMERS.anna, 24900, '2026-11-15'),

  // Other customers with similar merchant names, so the customer ranking is visible when searching "nord".
  invoice('RE-2026-0601', MERCHANTS.nordwind, CUSTOMERS.lena, 124900, '2026-10-20'),
  invoice('RE-2026-0602', MERCHANTS.nordlicht, CUSTOMERS.lena, 15000, '2026-10-25'),
  invoice('RE-2026-0603', MERCHANTS.stadtgarten, CUSTOMERS.lena, 15000, '2026-12-01', 'CANCELLED'),

  ...manyInvoices,
]

export const PAYMENTS: readonly Payment[] = [
  {
    id: 'pay-exact',
    amount: eur(124900),
    senderName: 'Max Mustermann',
    referenceNumber: 'TRX-20261014-7731',
    customerId: CUSTOMERS.max,
    receivedAt: '2026-10-14T09:12:00Z',
    status: 'UNMATCHED',
  },
  {
    id: 'pay-mismatch',
    amount: eur(34950),
    senderName: 'Erika Musterfrau',
    referenceNumber: 'Bestellung 55813',
    customerId: CUSTOMERS.erika,
    receivedAt: '2026-10-15T14:47:00Z',
    status: 'UNMATCHED',
  },
  {
    id: 'pay-assigned',
    amount: eur(8990),
    senderName: 'Anna Schmidt',
    referenceNumber: 'TRX-20260929-0042',
    customerId: CUSTOMERS.anna,
    receivedAt: '2026-09-29T08:03:00Z',
    status: 'ASSIGNED',
  },
  {
    id: 'pay-unknown-sender',
    amount: eur(15000),
    senderName: 'K. Weber',
    referenceNumber: 'Danke!',
    customerId: null,
    receivedAt: '2026-10-16T11:30:00Z',
    status: 'UNMATCHED',
  },
  {
    id: 'pay-many-invoices',
    amount: eur(4240),
    senderName: 'Jonas Becker',
    referenceNumber: 'TRX-20261017-9310',
    customerId: CUSTOMERS.jonas,
    receivedAt: '2026-10-17T16:21:00Z',
    status: 'UNMATCHED',
  },
]

export const ASSIGNMENTS: readonly PaymentAssignment[] = [
  {
    id: 'asg-0001',
    paymentId: 'pay-assigned',
    invoiceId: 'inv-RE-2026-0311',
    splits: [
      { type: 'PLATFORM_FEE', amount: eur(450) },
      { type: 'PROVIDER_FEE', amount: eur(135) },
      { type: 'LOGISTICS_FEE', amount: eur(490) },
      { type: 'MERCHANT_PAYOUT', amount: eur(7915) },
    ],
    confirmedBy: 'Mock User',
    confirmedAt: '2026-09-29T10:15:00Z',
  },
]
