import { useMemo, useState } from 'react'
import type { VocabularyItem } from '../../domain/vocabulary'
import { StudySelectionList } from './StudySelectionList'

interface StudySetupProps {
  items: VocabularyItem[]
  onStart: (items: VocabularyItem[]) => void
  onNavigateToAddWords: () => void
}

export function StudySetup({
  items,
  onStart,
  onNavigateToAddWords,
}: StudySetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(items.map((item) => item.id)),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectionMode, setSelectionMode] = useState<'all' | 'specific'>('all')

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    if (!query) {
      return items
    }

    return items.filter((item) =>
      [item.term, item.reading, ...item.translations]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(query)),
    )
  }, [items, searchQuery])

  function toggleItem(id: string) {
    setSelectionMode('specific')
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(id)) {
        nextIds.delete(id)
      } else {
        nextIds.add(id)
      }
      return nextIds
    })
  }

  function selectAll() {
    setSelectionMode('all')
    setSelectedIds(new Set(items.map((item) => item.id)))
  }

  function clearSelection() {
    setSelectionMode('specific')
    setSelectedIds(new Set())
  }

  function startSession() {
    onStart(items.filter((item) => selectedIds.has(item.id)))
  }

  if (!items.length) {
    return (
      <section className="study-empty">
        <div className="empty-section-icon" aria-hidden="true">
          <span />
          <span />
        </div>
        <p className="eyebrow">Ready when you are</p>
        <h2>Your study library is empty.</h2>
        <p>Add a few Japanese words first, then come back to practice recalling them.</p>
        <button className="button button-primary" type="button" onClick={onNavigateToAddWords}>
          Add words
        </button>
      </section>
    )
  }

  return (
    <section className="study-setup">
      <div className="study-intro">
        <p className="eyebrow">Recall practice</p>
        <h2>What would you like to study?</h2>
        <p>Choose all your words or focus on a smaller set for this session.</p>
      </div>

      <div className="study-setup-summary">
        <div>
          <strong>{items.length}</strong>
          <span>available</span>
        </div>
        <div>
          <strong>{selectedIds.size}</strong>
          <span>selected</span>
        </div>
      </div>

      <div className="study-mode-options" aria-label="Study selection mode">
        <button
          className={selectionMode === 'all' ? 'is-active' : ''}
          type="button"
          onClick={selectAll}
        >
          Study all
        </button>
        <button
          className={selectionMode === 'specific' ? 'is-active' : ''}
          type="button"
          onClick={() => setSelectionMode('specific')}
        >
          Choose specific words
        </button>
      </div>

      <div className="study-selection-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search words"
            aria-label="Search study words"
          />
        </label>
        <div className="study-selection-actions">
          <button type="button" onClick={selectAll}>Select all</button>
          <button type="button" onClick={clearSelection}>Clear</button>
        </div>
      </div>

      {filteredItems.length ? (
        <StudySelectionList
          items={filteredItems}
          selectedIds={selectedIds}
          onToggle={toggleItem}
        />
      ) : (
        <p className="study-no-results">No words match your search.</p>
      )}

      <div className="study-setup-footer">
        <span>
          {selectedIds.size
            ? `${selectedIds.size} ${selectedIds.size === 1 ? 'word' : 'words'} ready to study`
            : 'Select at least one word to begin'}
        </span>
        <button
          className="button button-primary"
          type="button"
          disabled={!selectedIds.size}
          onClick={startSession}
        >
          Start session
        </button>
      </div>
    </section>
  )
}
