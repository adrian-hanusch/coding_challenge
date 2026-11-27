# Payment Management UI

Frontend of the coding challenge. Stack and reasons: [docs/libraries.md](../docs/libraries.md).

## Requirements

- Node.js 22.22 or newer (24 recommended, see `.nvmrc`)
- pnpm 10 or newer, e.g. through Corepack: `corepack enable pnpm`

Without a global pnpm, prefix every command with `npx`, e.g. `npx pnpm@10 install` and `npx pnpm@10 dev`.

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
| `pnpm demo`      | Production build with the mock API on http://localhost:4173  |

The `.npmrc` in this folder sets the public npm registry.

## Mock API

In development [MSW](https://mswjs.io) answers all requests to `/api` directly in the browser. No backend is needed.
Contract and error codes: [docs/data-model.md](../docs/data-model.md#api).

- Controlled by `VITE_API_MOCKING` in `.env.development` (default `true`). For a real backend, set
  `VITE_API_MOCKING=false` in `.env.development.local`. Vite then proxies `/api` to `API_URL` (default
  `http://localhost:8080`).
- The mock runs with `pnpm dev` and `pnpm demo`. The latter builds with `--mode demo` (`.env.demo`) into `dist-demo/`
  and serves it. `pnpm build` and `pnpm preview` do not contain the mock.
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
  main.tsx         Entry point; starts the mock API first when it is enabled
  index.css        Tailwind v4, HeroUI, font, adjustments to HeroUI components (no tailwind.config.js)
  themes/          Theme: colors, radii, shadows (overrides HeroUI variables)
  app/             Providers, routes, paths, error and fallback pages, TanStack Query defaults, header (shell/)
  pages/           One file per route; the only place that navigates
  features/payment-assignment/
    PaymentAssignment, useAssignmentFlow   The steps for each state of the process, and their state
    payment/       Step 1: payment summary and search
    invoice/       Step 2: invoice search and selection, amount mismatch (A4)
    fee-splitter/  Step 3: fees and payout (calculated, can be overridden, A1)
    confirmation/  Confirmation dialog, the request and its error handling (A2)
  domain/          Pure functions: money in cents, split calculation and validation
  lib/             Hooks and helpers: formatting, paged search, focus, pasted amounts
  components/      Shared UI: Page, steps, search field, money field, notices
  i18n/            react-intl + React Aria with one locale source (Zustand), messages/*.json
  api/             Types of the API contract, fetch client, query options
  mocks/           MSW: handlers, test data, in-memory DB, scenarios; browser.ts and node.ts start it
```

New messages go into `en.json` and `de.json`. A key missing in `de.json` fails the typecheck.
