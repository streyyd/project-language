import type { VocabularyItem } from '../../domain/vocabulary'

export const MAX_BULK_IMPORT_ITEMS = 50
export const BULK_IMPORT_CONCURRENCY = 3

export function normalizeVocabularyTerm(term: string): string {
  return term.trim().normalize('NFC').toLocaleLowerCase()
}

export interface ParsedBulkTerm {
  id: string
  term: string
  normalizedTerm: string
  duplicate: boolean
}

export function parseBulkTerms(rawInput: string): ParsedBulkTerm[] {
  const seen = new Set<string>()

  return rawInput
    .split(/\r?\n/)
    .map((term, index) => {
      const trimmedTerm = term.trim()
      const normalizedTerm = normalizeVocabularyTerm(trimmedTerm)
      const duplicate = Boolean(normalizedTerm && seen.has(normalizedTerm))

      if (normalizedTerm) {
        seen.add(normalizedTerm)
      }

      return {
        id: `bulk-${index}-${normalizedTerm || 'empty'}`,
        term: trimmedTerm,
        normalizedTerm,
        duplicate,
      }
    })
    .filter((entry) => entry.term.length > 0)
}

export function findExistingJapaneseTerms(
  items: VocabularyItem[],
): Set<string> {
  return new Set(
    items
      .filter((item) => item.languageCode === 'ja')
      .map((item) => normalizeVocabularyTerm(item.term)),
  )
}
