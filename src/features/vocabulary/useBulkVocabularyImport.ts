import { useCallback, useRef, useState } from 'react'
import {
  enrichVocabulary,
  VocabularyApiError,
  type VocabularyEnrichmentResponse,
} from '../../api/vocabularyApi'
import type { VocabularyItem } from '../../domain/vocabulary'
import {
  BULK_IMPORT_CONCURRENCY,
  findExistingJapaneseTerms,
  MAX_BULK_IMPORT_ITEMS,
  normalizeVocabularyTerm,
  parseBulkTerms,
} from './bulkImportUtils'
import {
  enrichmentToEditorValue,
} from './vocabularyEnrichment'
import type { VocabularyEditorValue } from './VocabularyEntryEditor'

export type BulkImportItemStatus =
  | 'duplicate-input'
  | 'already-in-library'
  | 'queued'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'saved'

export interface BulkImportItem {
  id: string
  originalTerm: string
  status: BulkImportItemStatus
  selected: boolean
  value?: VocabularyEditorValue
  enrichment?: VocabularyEnrichmentResponse
  error?: {
    message: string
    status?: number
  }
}

interface BulkImportState {
  items: BulkImportItem[]
  inputError: string | null
  isProcessing: boolean
}

const initialState: BulkImportState = {
  items: [],
  inputError: null,
  isProcessing: false,
}

function updateItem(
  items: BulkImportItem[],
  id: string,
  update: Partial<BulkImportItem>,
): BulkImportItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...update } : item))
}

export function useBulkVocabularyImport(libraryItems: VocabularyItem[]) {
  const [state, setState] = useState(initialState)
  const controllerRef = useRef<AbortController | null>(null)

  const runQueue = useCallback(async (queue: BulkImportItem[]) => {
    const controller = new AbortController()
    controllerRef.current = controller
    setState((current) => ({ ...current, isProcessing: true }))

    let cursor = 0
    async function worker() {
      while (!controller.signal.aborted) {
        const currentIndex = cursor
        cursor += 1
        const item = queue[currentIndex]
        if (!item) {
          return
        }

        setState((current) => ({
          ...current,
          items: updateItem(current.items, item.id, { status: 'processing' }),
        }))

        try {
          const enrichment = await enrichVocabulary(
            { term: item.originalTerm, target_language: 'ru' },
            { signal: controller.signal },
          )
          setState((current) => ({
            ...current,
            items: updateItem(current.items, item.id, {
              status: 'success',
              selected: true,
              enrichment,
              value: enrichmentToEditorValue(enrichment),
              error: undefined,
            }),
          }))
        } catch (error) {
          if (controller.signal.aborted) {
            setState((current) => ({
              ...current,
              items: updateItem(current.items, item.id, {
                status: 'cancelled',
              }),
            }))
            return
          }

          const apiError =
            error instanceof VocabularyApiError
              ? error
              : new VocabularyApiError('Unable to generate this word.')
          setState((current) => ({
            ...current,
            items: updateItem(current.items, item.id, {
              status: 'failed',
              selected: false,
              error: {
                message: apiError.message,
                status: apiError.status,
              },
            }),
          }))
        }
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(BULK_IMPORT_CONCURRENCY, queue.length) },
        () => worker(),
      ),
    )
    controllerRef.current = null
    setState((current) => ({ ...current, isProcessing: false }))
  }, [])

  const startImport = useCallback(
    (rawInput: string) => {
      const parsed = parseBulkTerms(rawInput)
      const uniqueTerms = new Set(
        parsed.filter((item) => !item.duplicate).map((item) => item.normalizedTerm),
      )

      if (!parsed.length) {
        setState({ ...initialState, inputError: 'Enter at least one word.' })
        return
      }
      if (uniqueTerms.size > MAX_BULK_IMPORT_ITEMS) {
        setState({
          ...initialState,
          inputError: `Bulk import supports up to ${MAX_BULK_IMPORT_ITEMS} unique words.`,
        })
        return
      }

      controllerRef.current?.abort()
      const existingTerms = findExistingJapaneseTerms(libraryItems)
      const items: BulkImportItem[] = parsed.map((entry) => {
        if (entry.duplicate) {
          return {
            id: entry.id,
            originalTerm: entry.term,
            status: 'duplicate-input',
            selected: false,
          }
        }
        if (existingTerms.has(normalizeVocabularyTerm(entry.term))) {
          return {
            id: entry.id,
            originalTerm: entry.term,
            status: 'already-in-library',
            selected: false,
          }
        }
        return {
          id: entry.id,
          originalTerm: entry.term,
          status: 'queued',
          selected: false,
        }
      })

      setState({ items, inputError: null, isProcessing: false })
      void runQueue(items.filter((item) => item.status === 'queued'))
    },
    [libraryItems, runQueue],
  )

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    setState((current) => ({
      ...current,
      isProcessing: false,
      items: current.items.map((item) =>
        item.status === 'queued' || item.status === 'processing'
          ? { ...item, status: 'cancelled' }
          : item,
      ),
    }))
  }, [])

  const retryItems = useCallback(
    (itemsToRetry: BulkImportItem[]) => {
      if (state.isProcessing || !itemsToRetry.length) {
        return
      }
      const ids = new Set(itemsToRetry.map((item) => item.id))
      setState((current) => ({
        ...current,
        items: current.items.map((item) =>
          ids.has(item.id)
            ? { ...item, status: 'queued', error: undefined }
            : item,
        ),
      }))
      void runQueue(
        itemsToRetry.map((item) => ({ ...item, status: 'queued' })),
      )
    },
    [runQueue, state.isProcessing],
  )

  const updateValue = useCallback(
    (id: string, value: VocabularyEditorValue) => {
      setState((current) =>
        ({
          ...current,
          items: current.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  value,
                  status: item.status === 'saved' ? 'success' : item.status,
                }
              : item,
          ),
        }),
      )
    },
    [],
  )

  const setSelected = useCallback((id: string, selected: boolean) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, selected } : item,
      ),
    }))
  }, [])

  const selectSuccessful = useCallback((selected: boolean) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.status === 'success'
          ? { ...item, selected }
          : item,
      ),
    }))
  }, [])

  const markSaved = useCallback((ids: Set<string>) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        ids.has(item.id) ? { ...item, status: 'saved', selected: false } : item,
      ),
    }))
  }, [])

  return {
    ...state,
    startImport,
    cancel,
    retryItem: (item: BulkImportItem) => retryItems([item]),
    retryFailed: () =>
      retryItems(state.items.filter((item) => item.status === 'failed')),
    updateValue,
    setSelected,
    selectSuccessful,
    markSaved,
  }
}
