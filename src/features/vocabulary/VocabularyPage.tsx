import { useState } from 'react'
import type { CreateVocabularyItemInput, VocabularyItem } from '../../domain/vocabulary'
import { VocabularyForm } from './VocabularyForm'
import { VocabularyList } from './VocabularyList'
import { BulkImportPage } from './BulkImportPage'
import { useVocabularyLibrary } from './useVocabularyLibrary'

interface VocabularyPageProps {
  initialMode?: 'library' | 'add'
  onModeChange?: (mode: 'library' | 'add') => void
}

export function VocabularyPage({
  initialMode = 'library',
  onModeChange,
}: VocabularyPageProps) {
  const [mode, setMode] = useState<'library' | 'add'>(initialMode)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingItem, setEditingItem] = useState<VocabularyItem | undefined>()
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [pageError, setPageError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const library = useVocabularyLibrary(searchQuery)

  function changeMode(nextMode: 'library' | 'add') {
    setMode(nextMode)
    if (nextMode === 'library') {
      setEditingItem(undefined)
    } else {
      setPageError(null)
      setSuccessMessage(null)
    }
    onModeChange?.(nextMode)
  }

  function handleSubmit(input: CreateVocabularyItemInput) {
    try {
      if (editingItem) {
        library.updateItem(editingItem.id, input)
      } else {
        const duplicate = library.items.some(
          (item) =>
            item.languageCode === input.languageCode &&
            item.term.trim().toLocaleLowerCase() ===
              input.term.trim().toLocaleLowerCase(),
        )
        if (duplicate) {
          setPageError('This word is already in your library.')
          return
        }
        library.addItem(input)
      }
      setPageError(null)
      setSuccessMessage(
        editingItem ? 'Your vocabulary entry was updated.' : 'Word saved to your library.',
      )
      changeMode('library')
    } catch (submitError) {
      setPageError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save this entry.',
      )
    }
  }

  function handleEdit(item: VocabularyItem) {
    setPageError(null)
    setSuccessMessage(null)
    setEditingItem(item)
    setMode('add')
  }

  function handleDelete(item: VocabularyItem) {
    if (!window.confirm(`Delete "${item.term}" from your library?`)) {
      return
    }

    try {
      library.removeItem(item.id)
      setPageError(null)
      setSuccessMessage(null)
    } catch (deleteError) {
      setPageError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete this entry.',
      )
    }
  }

  if (mode === 'add') {
    return (
      <section className="vocabulary-page">
        {!editingItem && (
          <div className="add-mode-switch" role="tablist" aria-label="Add word mode">
            <button
              className={addMode === 'single' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={addMode === 'single'}
              onClick={() => setAddMode('single')}
            >
              Single word
            </button>
            <button
              className={addMode === 'bulk' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={addMode === 'bulk'}
              onClick={() => setAddMode('bulk')}
            >
              Bulk import
            </button>
          </div>
        )}
        {addMode === 'bulk' && !editingItem ? (
          <BulkImportPage libraryItems={library.items} library={library} />
        ) : (
          <VocabularyForm
            key={editingItem?.id ?? 'new-entry'}
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => changeMode('library')}
          />
        )}
        {pageError && (
          <p className="page-error" role="alert">
            {pageError}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="vocabulary-page">
      <div className="library-toolbar">
        <div>
          <p className="eyebrow">Personal library</p>
          <h2>Your words</h2>
          <p>{library.items.length} {library.items.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => changeMode('add')}
        >
          <span aria-hidden="true">+</span> Add word
        </button>
      </div>

      {library.items.length > 0 && (
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search words, translations, or readings"
            aria-label="Search vocabulary"
          />
        </label>
      )}

      {pageError && (
        <p className="page-error" role="alert">
          {pageError}
        </p>
      )}

      {successMessage && <p className="page-success">{successMessage}</p>}

      {library.error && (
        <div className="library-error" role="alert">
          <strong>We could not load your library.</strong>
          <span>{library.error}</span>
          <button type="button" onClick={library.reload}>
            Try again
          </button>
        </div>
      )}

      {!library.error && library.isLoading && (
        <p className="library-status">Loading your library...</p>
      )}

      {!library.error && !library.isLoading && library.items.length === 0 && (
        <div className="library-empty">
          <div className="empty-section-icon" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="eyebrow">A space for your words</p>
          <h2>Your library is ready when you are.</h2>
          <p>Add your first Japanese word to start building a vocabulary that belongs to you.</p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => changeMode('add')}
          >
            Add your first word
          </button>
        </div>
      )}

      {!library.error &&
        !library.isLoading &&
        library.items.length > 0 &&
        library.filteredItems.length === 0 && (
          <div className="library-no-results">
            <h2>No words found</h2>
            <p>Try a different search term.</p>
          </div>
        )}

      {!library.error &&
        !library.isLoading &&
        library.filteredItems.length > 0 && (
          <VocabularyList
            items={library.filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
    </section>
  )
}
