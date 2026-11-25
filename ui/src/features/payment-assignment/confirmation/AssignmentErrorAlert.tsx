import { Button } from '@heroui/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import { Notice } from '../../../components/Notice.tsx'
import { failureOf } from './assignmentFailure.ts'

/** Must render inside the confirmation dialog: its button closes it through `slot="close"`. */
export function AssignmentErrorAlert({ error }: { error: Error }) {
  const failure = failureOf(error)
  const ref = useRef<HTMLDivElement>(null)

  // An error that cannot be retried disables the focused submit button; without focus in the dialog, Escape is ignored.
  useEffect(() => {
    ref.current?.focus()
  }, [error])

  let title: ReactNode
  let description: ReactNode
  switch (failure) {
    case 'alreadyAssigned':
      title = <FormattedMessage id="assignment.error.alreadyAssigned" />
      description = <FormattedMessage id="assignment.error.alreadyAssigned.description" />
      break
    case 'invoiceNotOpen':
      title = <FormattedMessage id="assignment.error.invoiceNotOpen" />
      description = <FormattedMessage id="assignment.error.invoiceNotOpen.description" />
      break
    case 'invoiceNotFound':
      title = <FormattedMessage id="assignment.error.invoiceNotFound" />
      description = <FormattedMessage id="assignment.error.invoiceNotFound.description" />
      break
    case 'invalidSplit':
      title = <FormattedMessage id="assignment.error.invalidSplit" />
      description = <FormattedMessage id="assignment.error.invalidSplit.description" />
      break
    case 'invalidRequest':
      title = <FormattedMessage id="assignment.error.invalidRequest" />
      description = <FormattedMessage id="assignment.error.invalidRequest.description" />
      break
    case 'unconfirmed':
      title = <FormattedMessage id="assignment.error.unconfirmed" />
      description = <FormattedMessage id="assignment.error.unconfirmed.description" />
      break
  }

  return (
    <Notice
      ref={ref}
      status="danger"
      role="alert"
      title={title}
      description={description}
      data-testid="assignment-error"
    >
      {failure === 'alreadyAssigned' ? (
        // The payment is already refetched as ASSIGNED; closing the dialog lets that state replace the form.
        <Button size="sm" variant="secondary" className="mt-2 self-start" slot="close">
          <FormattedMessage id="assignment.error.showCurrentState" />
        </Button>
      ) : null}
    </Notice>
  )
}
