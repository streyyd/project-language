import {
  isCreateVocabularyItemInput,
  isVocabularyItem,
  type CreateVocabularyItemInput,
  type UpdateVocabularyItemInput,
  type VocabularyItem,
} from '../domain/vocabulary'
import {
  readStorageValue,
  StorageError,
  writeStorageValue,
} from './storage'

const VOCABULARY_STORAGE_KEY = 'project-language:vocabulary:v1'
const STORAGE_VERSION = 1

interface VocabularyStorage {
  version: number
  items: VocabularyItem[]
}

export class VocabularyRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'VocabularyRepositoryError'
  }
}

function isVocabularyStorage(value: unknown): value is VocabularyStorage {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const storage = value as Record<string, unknown>

  return (
    storage.version === STORAGE_VERSION &&
    Array.isArray(storage.items) &&
    storage.items.every(isVocabularyItem)
  )
}

function readStorage(): VocabularyStorage {
  try {
    const storage = readStorageValue(VOCABULARY_STORAGE_KEY, (value) => value)

    if (storage === null) {
      return { version: STORAGE_VERSION, items: [] }
    }

    if (!isVocabularyStorage(storage)) {
      throw new VocabularyRepositoryError(
        'The saved vocabulary has an unsupported format.',
      )
    }

    return storage
  } catch (error) {
    if (error instanceof VocabularyRepositoryError) {
      throw error
    }

    throw new VocabularyRepositoryError('Unable to load your vocabulary.', {
      cause: error,
    })
  }
}

function writeStorage(storage: VocabularyStorage): void {
  try {
    writeStorageValue(VOCABULARY_STORAGE_KEY, storage)
  } catch (error) {
    if (error instanceof StorageError) {
      throw new VocabularyRepositoryError('Unable to save your vocabulary.', {
        cause: error,
      })
    }

    throw error
  }
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanInput(
  input: CreateVocabularyItemInput | UpdateVocabularyItemInput,
): CreateVocabularyItemInput {
  if (!isCreateVocabularyItemInput(input)) {
    throw new VocabularyRepositoryError('The vocabulary entry is invalid.')
  }

  return {
    ...input,
    languageCode: input.languageCode.trim(),
    term: input.term.trim(),
    translations: input.translations
      .map((translation) => translation.trim())
      .filter(Boolean),
    reading: input.reading?.trim() || undefined,
    example: input.example?.trim() || undefined,
    note: input.note?.trim() || undefined,
  }
}

export function getVocabularyItems(): VocabularyItem[] {
  return readStorage().items
}

export function createVocabularyItem(
  input: CreateVocabularyItemInput,
): VocabularyItem {
  return createVocabularyItems([input])[0]
}

export function createVocabularyItems(
  inputs: CreateVocabularyItemInput[],
): VocabularyItem[] {
  const cleanEntries = inputs.map(cleanInput)

  if (
    cleanEntries.some(
      (entry) =>
        !entry.languageCode || !entry.term || !entry.translations.length,
    )
  ) {
    throw new VocabularyRepositoryError(
      'Every vocabulary entry needs a language, word, and translation.',
    )
  }

  const now = new Date().toISOString()
  const storage = readStorage()
  const items = cleanEntries.map((cleanEntry) => ({
    ...cleanEntry,
    id: createId(),
    knowledge: {},
    createdAt: now,
    updatedAt: now,
  }))

  writeStorage({ ...storage, items: [...items, ...storage.items] })
  return items
}

export function updateVocabularyItem(
  id: string,
  input: UpdateVocabularyItemInput,
): VocabularyItem {
  const cleanEntry = cleanInput(input)

  if (!cleanEntry.languageCode || !cleanEntry.term || !cleanEntry.translations.length) {
    throw new VocabularyRepositoryError(
      'A language, word, and translation are required.',
    )
  }

  const storage = readStorage()
  const item = storage.items.find((entry) => entry.id === id)

  if (!item) {
    throw new VocabularyRepositoryError('The vocabulary entry was not found.')
  }

  const updatedItem: VocabularyItem = {
    ...item,
    ...cleanEntry,
    updatedAt: new Date().toISOString(),
  }

  writeStorage({
    ...storage,
    items: storage.items.map((entry) =>
      entry.id === id ? updatedItem : entry,
    ),
  })

  return updatedItem
}

export function deleteVocabularyItem(id: string): void {
  const storage = readStorage()

  if (!storage.items.some((item) => item.id === id)) {
    throw new VocabularyRepositoryError('The vocabulary entry was not found.')
  }

  writeStorage({
    ...storage,
    items: storage.items.filter((item) => item.id !== id),
  })
}
