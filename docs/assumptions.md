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
| A2 | Everything is on one page. The summary is always visible and updates live. Its *Confirm* button is disabled while blocking errors exist and opens the modal. | UI Components describes three sections and places the confirmation button in the summary. The spec does not describe a step-by-step wizard. |
| A3 | One payment pays exactly one invoice, and one invoice is paid by exactly one payment. There are no partial payments, and only `OPEN` invoices can be selected. | The spec does not mention partial payments. |
| A4 | If the payment amount differs from the invoice amount, a non-blocking warning appears. The user must acknowledge it in the modal. The backend decides whether the invoice status changes. | This follows from A3 without silently marking an underpaid invoice as paid. |
| A5 | The sender is modeled as a `Customer` with their own invoices. Invoice search matches the invoice number and merchant name, and lists the customer's invoices first. | The spec only says the sender's *name* was found in the database. |
| A6 | Fees are entered as absolute EUR amounts, not percentages. | The spec says "input fields" without specifying a unit. |
| A7 | The assignment stores who confirmed it and when (`confirmedBy`, `confirmedAt`). Without a backend, `confirmedBy` is a fixed mock user. | The spec has a double-check step but does not specify an audit trail. |
| A8 | Only EUR is supported. Amounts are stored as integer cents. | The spec names no currency. Integer cents avoid floating-point errors (see the data model). |
| A9 | Invoice numbers use the format `RE-YYYY-NNNN`. | The spec names no format. Drop the format check if this is wrong. |
| A10 | No backend is specified. The following endpoints are proposals, implemented as a mock API: `GET /payments/{id}`, `GET /invoices?q=&customerId=&offset=&limit=`, `POST /payments/{id}/assignment`. Details in [data-model.md](./data-model.md#api). | The deliverable is frontend code only. |
| A11 | Payment amount, sender name and reference number are read-only. | Feature 1 is titled "Payment Details **Input**", but its items only say "display". |
| A12 | The page handles one payment, loaded by ID (e.g. from the URL). There is no list of unmatched payments. After confirmation, the page shows a success state. | The scenario describes a single payment and does not say how it is selected or what happens next. |
| A13 | The fee types are fixed to the three listed, plus the merchant payout. | The overview mentions "various fees" but lists only three. |

## Open questions

1. **Merchant payout: input or calculated?** The spec allows both readings (A1).
2. **Invoice number format?** It is not specified (A9).
3. **Fees: absolute or percentage?** If they are percentages, a rounding rule is needed, and the merchant should take the remainder. Prefilling the fees from the merchant contract would also be possible.
4. **Partial or overpayments?** Can an invoice be paid in installments, or can one payment cover several invoices (A3)?
5. **Invoice search scope?** Only the sender's invoices, or all open invoices with the sender's ranked first (A5)?
6. **Who confirms?** Is self-confirmation in the modal enough, or is a four-eyes check intended?
7. **Currencies?** Only EUR is assumed (A8). `Money.currency` allows extension, but currencies without 2 decimals (JPY, BHD) would also need a minor-unit exponent.
8. **Reversal?** Can a confirmed assignment be undone, and what status would result?
