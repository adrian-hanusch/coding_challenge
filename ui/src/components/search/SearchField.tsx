import { ComboBox, Description, FieldError, Input, Label } from '@heroui/react'
import type { ComponentProps, ReactNode } from 'react'

import { MAX_SEARCH_LENGTH } from '../../api/types.ts'
import type { PagedSearch } from '../../lib/usePagedSearch.ts'
import { SearchResults } from './SearchResults.tsx'
import { SearchTrigger } from './SearchTrigger.tsx'

type ComboBoxProps<T extends object> = ComboBox<T>['Props']
type InputProps = ComponentProps<typeof Input>

interface SearchFieldProps<T extends object> extends Pick<
  ComboBoxProps<T>,
  'items' | 'inputValue' | 'onInputChange' | 'onChange' | 'allowsCustomValue'
> {
  label: ReactNode
  placeholder: string
  /** Spinner label and empty-list text while searching. */
  loadingLabel: string
  description: ReactNode
  /** Error of the typed input, shown instead of the description; takes precedence over a failed search. */
  inputError?: ReactNode
  /** Below the field and as empty-list text when the search failed. */
  searchErrorMessage: ReactNode
  /** Next to the search error, e.g. a retry button. */
  searchErrorAction?: ReactNode
  emptyMessage: ReactNode
  search: PagedSearch
  input?: Pick<InputProps, 'autoFocus' | 'onKeyDown'>
  /** The list content: options, or sections of options. */
  children: ReactNode
  'data-testid': string
}

/** Autocomplete over a server-side, paged search. The text is controlled, so the ComboBox does not filter by itself. */
export function SearchField<T extends object>({
  label,
  placeholder,
  loadingLabel,
  description,
  inputError,
  searchErrorMessage,
  searchErrorAction,
  emptyMessage,
  search,
  input,
  children,
  'data-testid': testId,
  ...comboBox
}: SearchFieldProps<T>) {
  const error = inputError ?? (search.isError ? searchErrorMessage : null)
  const hasError = error != null
  let listEmptyMessage = emptyMessage
  if (search.isSearching) listEmptyMessage = loadingLabel
  else if (search.isError) listEmptyMessage = searchErrorMessage

  return (
    <ComboBox<T>
      {...comboBox}
      fullWidth
      menuTrigger="focus"
      allowsEmptyCollection
      isInvalid={hasError}
      data-testid={testId}
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input {...input} maxLength={MAX_SEARCH_LENGTH} placeholder={placeholder} data-testid={`${testId}-input`} />
        <SearchTrigger isSearching={search.isSearching} loadingLabel={loadingLabel} />
      </ComboBox.InputGroup>
      {hasError ? (
        <FieldError className="flex flex-wrap items-center gap-x-2" data-testid={`${testId}-error`}>
          {error}
          {inputError == null ? searchErrorAction : null}
        </FieldError>
      ) : (
        <Description>{description}</Description>
      )}
      <SearchResults isLoadingMore={search.isLoadingMore} onLoadMore={search.loadMore} emptyMessage={listEmptyMessage}>
        {children}
      </SearchResults>
    </ComboBox>
  )
}
