import { type RefObject, useEffect, useRef } from 'react'

/**
 * Focuses `ref` whenever `trigger` changes to a truthy value, e.g. after the focused element unmounted.
 * With `onMount`, a trigger that is truthy from the start focuses too.
 */
export function useFocusWhen(
  ref: RefObject<HTMLElement | null>,
  trigger: unknown,
  { onMount = false }: { onMount?: boolean } = {},
) {
  // Comparing with the previous value instead of counting renders keeps StrictMode's second effect run from focusing.
  const previous = useRef(onMount ? undefined : trigger)

  useEffect(() => {
    if (trigger && trigger !== previous.current) ref.current?.focus()
    previous.current = trigger
  }, [ref, trigger])
}
