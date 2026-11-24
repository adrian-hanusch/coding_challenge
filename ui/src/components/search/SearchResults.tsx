import { ComboBox, ListBox, ListBoxLoadMoreItem, Spinner } from '@heroui/react'
import type { ReactNode } from 'react'

import { Typography } from '../Typography.tsx'

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
      <ListBox
        renderEmptyState={() => (
          <Typography type="body-sm" color="muted" align="center" className="px-3 py-6">
            {emptyMessage}
          </Typography>
        )}
      >
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
