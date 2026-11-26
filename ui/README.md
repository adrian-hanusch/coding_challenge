# Payment Management UI

Frontend of the coding challenge. Stack and reasons: [docs/libraries.md](../docs/libraries.md).

## Requirements

- Node.js 24
- pnpm 12, e.g. through Corepack: `corepack enable pnpm && corepack install -g pnpm@12`

The required pnpm version is in `devEngines.packageManager` in `package.json`. Corepack does not read this field, so
pnpm 12 has to be installed globally. With an older version `pnpm install` aborts with an error message. Without a
global install, prefix every command with `npx`, e.g. `npx pnpm@12 install` and `npx pnpm@12 dev`.

## Commands

| Command          | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `pnpm install`   | Install dependencies                                         |
| `pnpm dev`       | Dev server on http://localhost:5173                          |
| `pnpm build`     | Typecheck and production build into `dist/`                  |
| `pnpm typecheck` | TypeScript only                                              |
| `pnpm lint`      | ESLint (`pnpm lint:fix` fixes what it can)                   |
| `pnpm test`      | Tests with Vitest (`pnpm test:watch` in watch mode)          |
| `pnpm format`    | Prettier formats all files (`pnpm format:check` only checks) |
| `pnpm preview`   | Serve the production build locally                           |

The `.npmrc` in this folder sets the public npm registry.

## Mock API

In development [MSW](https://mswjs.io) answers all requests to `/api` directly in the browser. No backend is needed.
Contract and error codes: [docs/data-model.md](../docs/data-model.md#api).

- Controlled by `VITE_API_MOCKING` in `.env.development` (default `true`). For a real backend, set
  `VITE_API_MOCKING=false` in `.env.development.local`. Vite then proxies `/api` to `API_URL` (default
  `http://localhost:8080`).
- The mock only runs with `pnpm dev`. `pnpm build` and `pnpm preview` do not contain it.
- The mock only answers in the browser, not to `curl`. To try it in the browser console:
  `await (await fetch('/api/payments/pay-exact')).json()`.
- The data lives in memory: a confirmed payment stays assigned until the page is reloaded.

### Test cases

All unmatched test payments can be searched and chosen in step 1 at `/payments`. Any other payment is opened directly
at `/payments/<id>/assign`, e.g. `/payments/pay-assigned/assign` for the already assigned case.

| Payment              | Case                                                 |
| -------------------- | ---------------------------------------------------- |
| `pay-exact`          | Invoice `418` matches exactly (€1,249.00)            |
| `pay-mismatch`       | Matching invoice `502` is €50.00 higher (A4)         |
| `pay-assigned`       | Already assigned                                     |
| `pay-unknown-sender` | Sender without a customer (`customerId: null`), edge |
| `pay-many-invoices`  | Sender with 28 invoices, for pagination              |

`420` is paid and therefore not found, like `9999`, which does not exist.

`pay-unknown-sender` is outside the task's scenario (there the sender is known) and checks that the page also works
without a customer.

### Scenarios

As URL parameters, they apply until the tab is closed:

| Parameter                              | Effect                                                  |
| -------------------------------------- | ------------------------------------------------------- |
| `?mock-delay=2000`                     | Fixed response time in ms (otherwise random 100–400 ms) |
| `?mock-fail=assignment:409,search:500` | Endpoints fail, values see below                        |
| `?mock-fail=` / `?mock-delay=`         | Resets the respective switch                            |
| `?mock-reset`                          | Clears all switches                                     |

Values for `mock-fail`:

- `payment:500`, `paymentSearch:500`, `search:500`, `assignment:500`: server error (`INTERNAL_ERROR`)
- `assignment:409`: the payment was assigned in the meantime (`PAYMENT_ALREADY_ASSIGNED`)
- `assignment:409-invoice`: the invoice is no longer open (`INVOICE_NOT_OPEN`)

In the browser console, `__mockDb.reset()` restores the test data without a reload.

## Structure

```
src/
  main.tsx              Entry point
  index.css             Tailwind v4, HeroUI, font, adjustments to HeroUI components (no tailwind.config.js)
  themes/petrol.css     Theme: colors, radii, shadows (overrides HeroUI variables)
  app/AppProviders.tsx  QueryClient, locale, toasts
  app/router.tsx        Routes (react-router, data mode)
  app/paths.ts          Paths and the typed navigation state of the payment selection
  app/RouteError.tsx    Error page of the routes
  app/StatusPage.tsx    Layout of fallback pages (not found, errors) with a way back to the payments
  app/queryClient.ts    Default options for TanStack Query (retry only on server and network errors)
  app/shell/            Header with logo, title and language choice (LocaleMenu) above the page
  pages/                One file per route; the only place that navigates
    SelectPaymentPage   /payments, step 1: choose a payment
    AssignPaymentPage   /payments/:paymentId/assign, loads the payment (error, skeleton)
  features/payment-assignment/  Assignment, one subfolder per step
    PaymentSelection    Process without a chosen payment: only step 1 is open
    PaymentAssignment   Renders the steps for each state of the process
    useAssignmentFlow   Chosen invoice, split draft, open dialog and submission
    PaymentAssignmentSkeleton  Steps while the payment loads
    steps/              AssignmentSteps: order, titles and lock hints of the steps
    payment/            Step 1: PaymentSummary, payment data (display only, A11)
      search/           Search over unmatched payments
    invoice/            Step 2: choose and change the invoice, InvoiceSummary, amount mismatch (A4)
      AssignedNotice    Replaces the selection when the payment is already assigned
      MismatchAcknowledgement  Note on the difference and checkbox to confirm it in the dialog
      search/           Invoice selection with server-side search and pagination
        useInvoiceNumberLookup  Resolves a typed number with Enter or the confirm button
        invoiceInput.ts         Error cases of a typed number (missing, not found)
    fee-splitter/       Fee splitter: fees and payout (calculated, can be overridden, A1)
      useSplitDraft     Split draft, evaluation, touched fields
      SplitErrorAlert   Split errors (fees too high, sum does not match)
    confirmation/       Summary section as confirmation dialog (A2)
      ConfirmAssignment        Button below the steps: opens the dialog, or shows what is missing
      ConfirmAssignmentDialog  Modal: summary of everything that is stored; confirm the difference (A4)
      SplitBreakdown           Payment, fees, payout in the dialog
      useAssignPayment         Sends the assignment, success toast, keeps payments and invoices current in the cache
      assignmentFailure        Server error codes as failures the user can act on
      AssignmentErrorAlert     Server error on submit, one text per failure
  domain/assignment.ts  Splits for the API
  domain/invoice.ts     Difference between payment and invoice amount
  domain/money.ts       Entered amounts in cents, upper limit, conversion from and to euros
  domain/split.ts       Split in cents: draft, calculation, validation (pure functions)
  lib/stripCurrency.ts  Removes currency symbol and code from pasted amounts
  lib/useFormatMoney.ts Formats amounts in the active locale
  lib/useFormatDate.ts  Formats due dates (plain date, UTC) and timestamps in the active locale
  lib/usePagedSearch.ts Debounced search with pagination for payments and invoices
  lib/useFocusWhen.ts   Moves focus when a trigger changes, e.g. after the focused element unmounted
  i18n/                 react-intl + React Aria with one shared locale source
    localeStore.ts      Zustand: chosen language (stored)
    messages/*.json     Messages, flat dotted keys, ICU placeholders
  components/           Shared: Page, steps/, search/ (SearchField: autocomplete over a server-side,
                        paged search), SelectionSummary (chosen payment or invoice, also in the dialog), Notice,
                        MoneyField (cents), Typography (HeroUI Typography with a separate HTML element)
  api/                  Types of the API contract, fetch client, query options
  mocks/                MSW: handlers, test data, in-memory DB, scenarios
    browser.ts          Start in the browser (dev only)
    node.ts             setupServer for Vitest
```

New messages go into `en.json` and `de.json`. A key missing in `de.json` fails the typecheck.
