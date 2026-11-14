import { useMemo, useState } from 'react'
import type { CreateVocabularyItemInput, VocabularyItem } from '../../domain/vocabulary'
import {
  editorValueToVocabularyInput,
} from './vocabularyEnrichment'
import { VocabularyEntryEditor } from './VocabularyEntryEditor'
import { useBulkVocabularyImport, type BulkImportItem } from './useBulkVocabularyImport'
import { normalizeVocabularyTerm } from './bulkImportUtils'
import type { useVocabularyLibrary } from './useVocabularyLibrary'

interface BulkImportPageProps {
  libraryItems: VocabularyItem[]
  library: ReturnType<typeof useVocabularyLibrary>
}

function statusLabel(item: BulkImportItem): string {
  switch (item.status) {
    case 'duplicate-input':
      return 'Duplicate in input'
    case 'already-in-library':
      return 'Already in library'
    case 'queued':
      return 'Waiting'
    case 'processing':
      return 'Generating'
    case 'success':
      return 'Ready to save'
    case 'failed':
      return 'Failed'
    case 'cancelled':
      return 'Cancelled'
    case 'saved':
      return 'Saved'
  }
}

export function BulkImportPage({
  libraryItems,
  library,
}: BulkImportPageProps) {
  const [rawInput, setRawInput] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const bulk = useBulkVocabularyImport(libraryItems)

  const counts = useMemo(() => {
    return bulk.items.reduce(
      (result, item) => {
        result[item.status] = (result[item.status] ?? 0) + 1
        return result
      },
      {} as Record<string, number>,
    )
  }, [bulk.items])

  const actionableItems = bulk.items.filter(
    (item) =>
      item.status !== 'duplicate-input' &&
      item.status !== 'already-in-library',
  )
  const completedItems = actionableItems.filter((item) =>
    ['success', 'failed', 'cancelled', 'saved'].includes(item.status),
  ).length
  const selectedItems = bulk.items.filter(
    (item) => item.selected && item.status === 'success' && item.value,
  )

  function handleStart() {
    setSaveError(null)
    setSaveMessage(null)
    bulk.startImport(rawInput)
  }

  function handleSave() {
    const inputs: CreateVocabularyItemInput[] = []
    const seen = new Set(
      libraryItems
        .filter((item) => item.languageCode === 'ja')
        .map((item) => normalizeVocabularyTerm(item.term)),
    )

    for (const item of selectedItems) {
      if (!item.value) {
        continue
      }
      const input = editorValueToVocabularyInput(item.value)
      const normalizedTerm = normalizeVocabularyTerm(input.term)
      if (!input.term.trim() || !input.translations.length) {
        setSaveError(`"${item.originalTerm}" needs a word and translation.`)
        return
      }
      if (seen.has(normalizedTerm)) {
        setSaveError(`"${input.term}" is already in your library.`)
        return
      }
      seen.add(normalizedTerm)
      inputs.push(input)
    }

    if (!inputs.length) {
      setSaveError('Select at least one successful word to save.')
      return
    }

    try {
      library.addItems(inputs)
      bulk.markSaved(new Set(selectedItems.map((item) => item.id)))
      setSaveError(null)
      setSaveMessage(`${inputs.length} ${inputs.length === 1 ? 'word' : 'words'} saved to your library.`)
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Unable to save selected words.',
      )
    }
  }

  return (
    <div className="bulk-import">
      <div className="bulk-import-intro">
        <p className="eyebrow">Bulk import</p>
        <h2>Build your vocabulary in batches.</h2>
        <p>Paste up to 50 Japanese words, one per line. Each result stays editable before you save it.</p>
      </div>

      <label className="bulk-input-label">
        <span>Japanese words</span>
        <textarea
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          placeholder={'食べる\n美しい\n静か'}
          rows={8}
          disabled={bulk.isProcessing}
        />
      </label>

      <div className="bulk-input-actions">
        <span>{rawInput.split(/\r?\n/).filter((line) => line.trim()).length} entered</span>
        <button
          className="button button-primary"
          type="button"
          onClick={handleStart}
          disabled={bulk.isProcessing}
        >
          Generate list
        </button>
      </div>

      {bulk.inputError && <p className="form-error" role="alert">{bulk.inputError}</p>}

      {bulk.items.length > 0 && (
        <section className="bulk-results" aria-live="polite">
          <div className="bulk-summary">
            <div>
              <strong>{completedItems} / {actionableItems.length || bulk.items.length}</strong>
              <span>processed</span>
            </div>
            <div><strong>{counts.success ?? 0}</strong><span>ready</span></div>
            <div><strong>{counts.failed ?? 0}</strong><span>failed</span></div>
            <div><strong>{counts['duplicate-input'] ?? 0}</strong><span>duplicates</span></div>
            <div><strong>{counts['already-in-library'] ?? 0}</strong><span>existing</span></div>
          </div>

          <div className="bulk-progress-track">
            <span
              style={{
                width: `${actionableItems.length ? (completedItems / actionableItems.length) * 100 : 100}%`,
              }}
            />
          </div>

          <div className="bulk-results-actions">
            <button type="button" onClick={() => bulk.selectSuccessful(true)}>
              Select all successful
            </button>
            <button type="button" onClick={() => bulk.selectSuccessful(false)}>
              Deselect all
            </button>
            {bulk.isProcessing && (
              <button type="button" onClick={bulk.cancel}>Cancel processing</button>
            )}
            {!bulk.isProcessing && counts.failed > 0 && (
              <button type="button" onClick={bulk.retryFailed}>Retry failed</button>
            )}
            <button
              className="button button-primary"
              type="button"
              onClick={handleSave}
              disabled={!selectedItems.length || bulk.isProcessing}
            >
              Save selected ({selectedItems.length})
            </button>
          </div>

          {saveError && <p className="form-error" role="alert">{saveError}</p>}
          {saveMessage && <p className="page-success">{saveMessage}</p>}

          <div className="bulk-item-list">
            {bulk.items.map((item) => (
              <article className={`bulk-item bulk-item-${item.status}`} key={item.id}>
                <div className="bulk-item-header">
                  <div>
                    <strong>{item.originalTerm}</strong>
                    <span className="bulk-status">{statusLabel(item)}</span>
                  </div>
                  {item.status === 'success' && (
                    <label className="bulk-select">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(event) =>
                          bulk.setSelected(item.id, event.target.checked)
                        }
                      />
                      Save
                    </label>
                  )}
                </div>

                {item.error && (
                  <div className="bulk-item-error">
                    <span>{item.error.message}</span>
                    <button type="button" onClick={() => bulk.retryItem(item)} disabled={bulk.isProcessing}>
                      Retry
                    </button>
                  </div>
                )}

                {item.status === 'already-in-library' && (
                  <p className="bulk-item-note">This Japanese term is already saved.</p>
                )}
                {item.status === 'duplicate-input' && (
                  <p className="bulk-item-note">This term was repeated in the pasted list.</p>
                )}

                {item.value && (
                  <div className="bulk-editor">
                    {item.value.term !== item.originalTerm && (
                      <div className="bulk-term-warning" role="alert">
                        The term changed. Other generated data may no longer match it.
                        <button type="button" onClick={() => bulk.retryItem(item)} disabled={bulk.isProcessing}>
                          Generate again
                        </button>
                      </div>
                    )}
                    <VocabularyEntryEditor
                      value={item.value}
                      onChange={(value) => bulk.updateValue(item.id, value)}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
