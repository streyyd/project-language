import type { VocabularyItem } from '../../domain/vocabulary'

export function filterVocabularyItems(
  items: VocabularyItem[],
  query: string,
): VocabularyItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return items
  }

  return items.filter((item) =>
    [item.term, item.reading, item.example, item.note, ...item.translations]
      .filter(Boolean)
      .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
  )
}

export function formatTranslations(item: VocabularyItem): string {
  return item.translations.join(', ')
}
