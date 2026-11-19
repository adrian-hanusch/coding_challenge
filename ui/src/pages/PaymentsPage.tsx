import { FormattedMessage } from 'react-intl'
import { Page } from '../components/Page.tsx'
import { PageCard } from '../components/PageCard.tsx'
import { DemoPaymentList } from '../features/payments/DemoPaymentList.tsx'
import { OpenPaymentForm } from '../features/payments/OpenPaymentForm.tsx'

export function PaymentsPage() {
  return (
    <Page title={<FormattedMessage id="app.title" />} description={<FormattedMessage id="app.subtitle" />}>
      <PageCard title={<FormattedMessage id="payments.open.title" />}>
        <OpenPaymentForm />
      </PageCard>

      {__MOCK_API__ ? (
        <PageCard
          title={<FormattedMessage id="payments.demo.title" />}
          description={<FormattedMessage id="payments.demo.description" />}
        >
          <DemoPaymentList />
        </PageCard>
      ) : null}
    </Page>
  )
}
