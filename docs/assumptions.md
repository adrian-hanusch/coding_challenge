# Assumptions

This file separates four things: what [Payment Management Interface.md](./Payment%20Management%20Interface.md) requires, what follows from it necessarily, what the project has decided, and what is assumed. The IDs are referenced in [data-model.md](./data-model.md).

## Required by the spec

- Display payment amount, sender name and reference number.
- Input **or** select an invoice. Autocomplete is a bonus.
- Input fields for the platform fee, payment provider fee, logistics fee and the remaining merchant amount.
- Calculate the remaining merchant amount after the fees are deducted.
- A summary showing the total payment, the individual fees, the remaining amount and a confirmation button.
- A confirmation step before finalizing. A modal is a bonus.
- Error messages for invalid input, missing data, invalid invoice numbers and incorrect fee calculations.
- Validation of data types and values. Responsive design.

## Derived

These follow necessarily from the spec and are not assumptions.

- Fees and the merchant payout are non-negative.
- The four positions sum to the payment amount. Anything else is an incorrect fee calculation.
- An entered invoice number must refer to an existing invoice.
- Confirmation requires a selected invoice and a split that balances.
- A payment is assigned only once. After that it is no longer unmatched.
- The merchant payout goes to the merchant of the selected invoice.

## Project decisions

| ID | Decision |
|---|---|
| D1 | UI text and number and currency formatting go through react-intl (ICU messages, `formatNumber` with `style: 'currency'`). Amount input is parsed using the active locale's decimal and group separators, e.g. `62,45` (de) and `62.45` (en). Validation messages are ICU messages with locale-formatted amounts. Initial locales: `en` and `de` (assumed). |

## Assumptions

| ID | Assumption | Reason |
|---|---|---|
| A1 | The merchant payout field is prefilled with the calculated remainder and can be overridden. If overridden, the four positions must sum to the payment amount. | The spec conflicts: Feature 2 says "calculate the remaining amount", while UI Components lists an "input field" for it and expects "incorrect fee calculations" errors. This approach satisfies both. |
| A2 | Everything is on one page, shown as three numbered steps (choose payment, choose invoice, split) that unlock in order. The summary of the splits and totals is the confirmation modal, opened by a *Review and confirm* button below the steps. While blocking errors exist the button does not open it and lists them in a tooltip. | The spec asks for both a summary with a confirmation button and a confirmation step, ideally a modal. A separate always-visible summary card would only repeat the fee splitter and the modal. Numbered steps on one page guide through the order without hiding the payment while the invoice is chosen and the fees are entered, which a wizard with one step per screen would. |
| A3 | One payment pays exactly one invoice, and one invoice is paid by exactly one payment. There are no partial payments, and only `OPEN` invoices can be selected. | The spec does not mention partial payments. |
| A4 | If the payment amount differs from the invoice amount, a non-blocking warning appears. The user must acknowledge it in the modal. The backend decides whether the invoice status changes. | This follows from A3 without silently marking an underpaid invoice as paid. |
| A5 | The sender is modeled as a `Customer` with their own invoices. Invoice search matches the invoice number and merchant name, and lists the customer's invoices first. | The spec only says the sender's *name* was found in the database. |
| A6 | Fees are entered as absolute EUR amounts, not percentages. | The spec says "input fields" without specifying a unit. |
| A7 | The assignment stores no audit data (who confirmed it and when). | The spec asks for a double-check step, not an audit trail. |
| A8 | Only EUR is supported. Amounts are stored as integer cents. | The spec names no currency. Integer cents avoid floating-point errors (see the data model). |
| A9 | An invoice number is a plain number, kept as a string. There is no format check: a number is invalid if no invoice has it. | The spec names no format, only "invalid invoice numbers". |
| A10 | No backend is specified. The following endpoints are proposals, implemented as a mock API: `GET /payments?q=&status=UNMATCHED&offset=&limit=`, `GET /payments/{id}`, `GET /invoices?q=&customerId=&offset=&limit=`, `POST /payments/{id}/assignment`. Details in [data-model.md](./data-model.md#api). | The deliverable is frontend code only. |
| A11 | Payment amount, sender name and reference number are read-only. | Feature 1 is titled "Payment Details **Input**", but its items only say "display". |
| A12 | Choosing the payment is the first step of the process: a search over the unmatched payments, oldest first. The chosen payment is loaded by ID from the URL, so it can be reloaded and shared. After confirmation, a success toast appears and the process starts over with choosing the next payment. | The scenario describes a single payment and does not say how it is selected. Making the choice part of the process keeps the whole task on one page and gives a natural next step after a confirmation. |
| A13 | The fee types are fixed to the three listed, plus the merchant payout. | The overview mentions "various fees" but lists only three. |

## Open questions

1. **Merchant payout: input or calculated?** The spec allows both readings (A1).
2. **Fees: absolute or percentage?** If they are percentages, a rounding rule is needed, and the merchant should take the remainder. Prefilling the fees from the merchant contract would also be possible.
3. **Partial or overpayments?** Can an invoice be paid in installments, or can one payment cover several invoices (A3)?
4. **Invoice search scope?** Only the sender's invoices, or all open invoices with the sender's ranked first (A5)?
5. **Who confirms?** Is self-confirmation in the modal enough, or is a four-eyes check intended?
6. **Currencies?** Only EUR is assumed (A8). `Money.currency` allows extension, but currencies without 2 decimals (JPY, BHD) would also need a minor-unit exponent.
7. **Reversal?** Can a confirmed assignment be undone, and what status would result?
