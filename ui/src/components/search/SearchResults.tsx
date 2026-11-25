import { ComboBox, EmptyState, ListBox, ListBoxLoadMoreItem, Spinner } from '@heroui/react'
import type { ReactNode } from 'react'

const POPOVER_MAX_HEIGHT_PX = 320

interface SearchResultsProps {
  isLoadingMore: boolean
  onLoadMore: () => void
  emptyMessage: ReactNode
  children: ReactNode
}

export function SearchResults({ isLoadingMore, onLoadMore, emptyMessage, children }: SearchResultsProps) {
  return (
    <ComboBox.Popover maxHeight={POPOVER_MAX_HEIGHT_PX}>
      <ListBox renderEmptyState={() => <EmptyState className="px-3 py-6 text-center">{emptyMessage}</EmptyState>}>
        {children}
        <ListBoxLoadMoreItem isLoading={isLoadingMore} onLoadMore={onLoadMore}>
          <div className="flex justify-center py-2">
            <Spinner size="sm" />
          </div>
        </ListBoxLoadMoreItem>
      </ListBox>
    </ComboBox.Popover>
  )
}
