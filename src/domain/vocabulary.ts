export type LanguageSpecificValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | LanguageSpecificValue[]
  | LanguageSpecificData

export interface LanguageSpecificData {
  [key: string]: LanguageSpecificValue | undefined
}

export interface JapaneseVocabularyExample extends LanguageSpecificData {
  sentence: string
  reading: string
  translation: string
}

export interface JapaneseLanguageData extends LanguageSpecificData {
  romaji?: string
  partOfSpeech?: string
  explanation?: string
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
  examples?: JapaneseVocabularyExample[]
}

export type KnowledgeDimension =
  | 'recognition'
  | 'recall'
  | 'reading'
  | 'listening'
  | 'writing'

export interface KnowledgeState {
  correctCount: number
  incorrectCount: number
  lastReviewedAt?: string
}

export type VocabularyKnowledge = Partial<
  Record<KnowledgeDimension, KnowledgeState>
>

export interface VocabularyItem {
  id: string
  languageCode: string
  term: string
  translations: string[]
  reading?: string
  example?: string
  note?: string
  languageData?: LanguageSpecificData
  knowledge: VocabularyKnowledge
  createdAt: string
  updatedAt: string
}

export interface CreateVocabularyItemInput {
  languageCode: string
  term: string
  translations: string[]
  reading?: string
  example?: string
  note?: string
  languageData?: LanguageSpecificData
}

export type UpdateVocabularyItemInput = CreateVocabularyItemInput

const knowledgeDimensions: KnowledgeDimension[] = [
  'recognition',
  'recall',
  'reading',
  'listening',
  'writing',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLanguageSpecificValue(value: unknown): value is LanguageSpecificValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (Array.isArray(value) && value.every(isLanguageSpecificValue)) ||
    isLanguageSpecificData(value)
  )
}

function isLanguageSpecificData(
  value: unknown,
): value is LanguageSpecificData {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every(
    (entry) => entry === undefined || isLanguageSpecificValue(entry),
  )
}

function isKnowledgeState(value: unknown): value is KnowledgeState {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.correctCount === 'number' &&
    Number.isInteger(value.correctCount) &&
    value.correctCount >= 0 &&
    typeof value.incorrectCount === 'number' &&
    Number.isInteger(value.incorrectCount) &&
    value.incorrectCount >= 0 &&
    (value.lastReviewedAt === undefined ||
      typeof value.lastReviewedAt === 'string')
  )
}

function isVocabularyKnowledge(
  value: unknown,
): value is VocabularyKnowledge {
  if (!isRecord(value)) {
    return false
  }

  return Object.entries(value).every(
    ([dimension, state]) =>
      knowledgeDimensions.includes(dimension as KnowledgeDimension) &&
      isKnowledgeState(state),
  )
}

export function isVocabularyItem(value: unknown): value is VocabularyItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.languageCode === 'string' &&
    typeof value.term === 'string' &&
    Array.isArray(value.translations) &&
    value.translations.length > 0 &&
    value.translations.every((translation) => typeof translation === 'string') &&
    (value.reading === undefined || typeof value.reading === 'string') &&
    (value.example === undefined || typeof value.example === 'string') &&
    (value.note === undefined || typeof value.note === 'string') &&
    (value.languageData === undefined ||
      isLanguageSpecificData(value.languageData)) &&
    isVocabularyKnowledge(value.knowledge) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export function isCreateVocabularyItemInput(
  value: unknown,
): value is CreateVocabularyItemInput {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.languageCode === 'string' &&
    typeof value.term === 'string' &&
    Array.isArray(value.translations) &&
    value.translations.length > 0 &&
    value.translations.every((translation) => typeof translation === 'string') &&
    (value.reading === undefined || typeof value.reading === 'string') &&
    (value.example === undefined || typeof value.example === 'string') &&
    (value.note === undefined || typeof value.note === 'string') &&
    (value.languageData === undefined ||
      isLanguageSpecificData(value.languageData))
  )
}
