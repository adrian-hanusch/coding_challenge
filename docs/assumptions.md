# Assumptions

Where [the task](./Payment%20Management%20Interface.md) is open or contradictory, these assumptions apply. The IDs are
referenced in the other documents.

| ID | Assumption | Reason |
|---|---|---|
| D1 | Text, amounts and amount input follow the active locale (react-intl): `62,45` in `de`, `62.45` in `en`. | Validating amounts is only credible with more than one input format. |
| A1 | The merchant payout is prefilled with the calculated remainder and can be overridden; the four amounts must then add up to the payment. | The task asks to calculate the remainder but also lists an input field for it and "incorrect fee calculations". |
| A2 | One page with three numbered steps. The summary is the confirmation modal, opened by *Review and confirm*, which shows missing input instead of being disabled. | The task asks for a summary with a confirmation button and a confirmation step; a separate summary would repeat the modal. |
| A3 | One payment pays exactly one invoice, and only `OPEN` invoices can be chosen. | Partial payments are not mentioned. |
| A4 | A difference between payment and invoice amount is a warning that must be acknowledged in the modal. | Follows from A3 without silently paying an invoice with the wrong amount. |
| A5 | The sender is a `Customer`. The invoice search matches number and merchant and ranks the customer's invoices first. | The task only says the sender's name was found. |
| A6 | Fees are absolute EUR amounts, not percentages. | No unit is given. |
| A7 | No audit data (who confirmed, when). | A double check is asked for, not an audit trail. |
| A8 | Only EUR, stored as integer cents. | No currency is given. |
| A9 | An invoice number is a string without a format check; it is invalid if no invoice has it. | No format is given. |
| A10 | The REST API is a proposal, implemented as a mock ([data-model.md](./data-model.md#api)). | Only frontend code is expected. |
| A11 | Payment amount, sender and reference are read-only. | Feature 1 says "input" but only lists "display". |
| A12 | Choosing the payment is step 1: a search over unmatched payments, loaded by ID from the URL. After confirming, the next payment is chosen. | The task describes one payment, not how it is selected. |
| A13 | The fee types are the three listed plus the merchant payout. | "Various fees" are mentioned, but only three are listed. |

## Open questions

1. Are fees absolute or percentages (A6)? Percentages need a rounding rule, with the merchant taking the remainder.
2. Partial or overpayments, or one payment for several invoices (A3)?
3. Is self-confirmation enough, or is a four-eyes check intended (A7)?
4. Other currencies (A8)? JPY or BHD would also need a minor-unit exponent.
5. Can a confirmed assignment be reversed, and to which status?
