import { ComboBox, Spinner } from '@heroui/react'

export function SearchTrigger({ isSearching, loadingLabel }: { isSearching: boolean; loadingLabel: string }) {
  return (
    <ComboBox.Trigger>{isSearching ? <Spinner size="sm" aria-label={loadingLabel} /> : undefined}</ComboBox.Trigger>
  )
}
