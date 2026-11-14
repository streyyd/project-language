import { useCallback, useMemo, useState } from 'react'
import {
  createVocabularyItem,
  createVocabularyItems,
  deleteVocabularyItem,
  getVocabularyItems,
  updateVocabularyItem,
} from '../../data/vocabularyRepository'
import type {
  CreateVocabularyItemInput,
  UpdateVocabularyItemInput,
  VocabularyItem,
} from '../../domain/vocabulary'
import { filterVocabularyItems } from './vocabularyUtils'

export function useVocabularyLibrary(searchQuery: string) {
  const [libraryState, setLibraryState] = useState(() => {
    try {
      return {
        items: getVocabularyItems(),
        error: null as string | null,
      }
    } catch (loadError) {
      return {
        items: [] as VocabularyItem[],
        error:
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load your vocabulary.',
      }
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const loadItems = useCallback(() => {
    setIsLoading(true)

    try {
      setLibraryState({ items: getVocabularyItems(), error: null })
    } catch (loadError) {
      setLibraryState({
        items: [],
        error:
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load your vocabulary.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addItem = useCallback((input: CreateVocabularyItemInput) => {
    const item = createVocabularyItem(input)
    setLibraryState((currentState) => ({
      items: [item, ...currentState.items],
      error: null,
    }))
  }, [])

  const addItems = useCallback((inputs: CreateVocabularyItemInput[]) => {
    const items = createVocabularyItems(inputs)
    setLibraryState((currentState) => ({
      items: [...items, ...currentState.items],
      error: null,
    }))
    return items
  }, [])

  const updateItem = useCallback(
    (id: string, input: UpdateVocabularyItemInput) => {
      const updatedItem = updateVocabularyItem(id, input)
      setLibraryState((currentState) => ({
        items: currentState.items.map((item) =>
          item.id === id ? updatedItem : item,
        ),
        error: null,
      }))
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    deleteVocabularyItem(id)
    setLibraryState((currentState) => ({
      items: currentState.items.filter((item) => item.id !== id),
      error: null,
    }))
  }, [])

  const filteredItems = useMemo(
    () => filterVocabularyItems(libraryState.items, searchQuery),
    [libraryState.items, searchQuery],
  )

  return {
    items: libraryState.items,
    filteredItems,
    isLoading,
    error: libraryState.error,
    addItem,
    addItems,
    updateItem,
    removeItem,
    reload: loadItems,
  }
}
