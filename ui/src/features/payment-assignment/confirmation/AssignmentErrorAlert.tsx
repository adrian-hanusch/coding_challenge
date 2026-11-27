import { Button } from '@heroui/react'
import { useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import { Notice } from '../../../components/Notice.tsx'
import { useFocusWhen } from '../../../lib/useFocusWhen.ts'
import { failureOf } from './assignmentFailure.ts'

/** Must render inside the confirmation dialog: its button closes it through `slot="close"`. */
export function AssignmentErrorAlert({ error }: { error: Error }) {
  const failure = failureOf(error)
  const ref = useRef<HTMLDivElement>(null)

  // An error that cannot be retried disables the focused submit button; without focus in the dialog, Escape is ignored.
  useFocusWhen(ref, error, { onMount: true })

  return (
    <Notice
      ref={ref}
      status="danger"
      role="alert"
      title={<FormattedMessage id={`assignment.error.${failure}`} />}
      description={<FormattedMessage id={`assignment.error.${failure}.description`} />}
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
