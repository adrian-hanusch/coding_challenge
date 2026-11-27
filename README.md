# Payment Management Interface

Frontend for manually assigning an unmatched payment to an invoice and splitting it into fees and the merchant payout.
The task is in [docs/Payment Management Interface.md](docs/Payment%20Management%20Interface.md).

## Quick start

Requires Node.js 22.22+ and pnpm 10+ (details in [ui/README.md](ui/README.md#requirements)).

```sh
cd ui
pnpm install
pnpm dev
```

Open http://localhost:5173. No backend is needed: a mock API ([MSW](https://mswjs.io)) answers in the browser. A reload
restores the test data.

To try the production build instead, run `pnpm demo` and open http://localhost:4173. It builds with the mock API
included and serves the result.

A walk through the main flow:

1. Search for `Max` and choose the payment from Max Mustermann (€1,249.00).
2. Type invoice number `418` and press Enter.
3. Enter the three fees, e.g. `0` each. The merchant payout is calculated from them.
4. Click **Review and confirm**, check the summary and confirm.

Further test cases (amount mismatch, already assigned payment, unknown invoice) and server error scenarios are listed in
[ui/README.md](ui/README.md#test-cases).

## What is implemented

| Requirement                                  | Where                                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Payment details: amount, sender, reference   | Step 1, read-only summary of the chosen payment                                                                       |
| Search and select an invoice                 | Step 2, autocomplete with server-side search; a typed number is resolved with Enter or the confirm button             |
| Platform, payment provider and logistics fee | Step 3, amount fields in the active locale                                                                            |
| Remaining merchant amount                    | Calculated live, can be overridden; the four amounts must then add up to the payment                                  |
| Summary and confirmation                     | Modal with payment, invoice, all splits and totals                                                                    |
| Clear error messages                         | Per field when it is left or the confirm button is pressed (focus moves to the first one), server errors in the modal |
| Responsive design                            | One column on phones, fee fields side by side once the card is wide enough                                            |
| Bonus: autocomplete, modal, documentation    | All three                                                                                                             |

## Scope

The core is the four features of the task and the three bonus points. Some additions go beyond it, each for a reason:

| Addition                                       | Why                                                                                                                                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Choosing the payment as step 1                 | The task describes one payment but not how it is chosen. A search over the unmatched payments makes the app usable without a fixed payment and gives a natural next step after a confirmation. |
| English and German                             | The language decides how amounts are typed (`62,45` or `62.45`), so the validation is only credible with more than one locale.                                                                 |
| Mock scenarios (`?mock-fail=`, `?mock-delay=`) | Without a backend, they are the only way for a reviewer to see the error handling: an invoice that is no longer open, a payment assigned in the meantime, a slow or failing server.            |
| Paged search                                   | One customer has 28 invoices in the test data. A real customer can have many more, so the search loads page by page.                                                                           |
| Acknowledging an amount mismatch               | Paying an invoice with a different amount is legitimate but easy to do by mistake, so it is confirmed explicitly.                                                                              |

Left out on purpose: a navigation (there is only one page), user accounts, an audit trail, partial payments.

With a 4-hour time box, the additions would go in this order: paged search, mock scenarios beyond one error case, the
second language, the payment search (replaced by a link per test payment).

## Documentation

| Document                                   | Content                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [docs/assumptions.md](docs/assumptions.md) | What the task requires, what was assumed where it is open or contradictory, open questions |
| [docs/data-model.md](docs/data-model.md)   | Types, money handling in cents, the proposed REST API and its error codes                  |
| [docs/libraries.md](docs/libraries.md)     | Stack, reasons for each library, architecture trade-offs, what was left out                |
| [ui/README.md](ui/README.md)               | Setup, all commands, mock API, test data and scenarios, source structure                   |

## Key decisions

- **Money as integer cents.** Input with more than two decimals is rejected instead of rounded, so no amount other than
  the typed one is stored.
- **One page in three steps** instead of a wizard: the payment stays visible while the invoice and the fees are chosen.
  The summary is the confirmation modal.
- **The merchant payout is calculated but editable**, because the task asks for both a calculated remainder and an input
  field that can be wrong.
- **No form library.** One invoice field and four amounts are handled with `useState` and pure, tested functions.
- **Stack:** React 19, TypeScript (strict), Vite, HeroUI v3, Tailwind CSS v4, TanStack Query, react-router, Zustand,
  react-intl, MSW.

## Known limitations

- Tests cover the pure logic (split calculation, money conversion, error mapping, mock API) and, in a component test,
  the main flow: confirming with input missing, a successful assignment with the request it sends, an overridden payout,
  an amount mismatch and server errors. Choosing the payment and end-to-end tests in a real browser are the next step.
- There is no CI pipeline yet.
- The REST API is a proposal implemented only as a mock.
