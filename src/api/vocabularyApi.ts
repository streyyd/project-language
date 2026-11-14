import type {
  JapaneseVocabularyExample,
} from '../domain/vocabulary'

export interface VocabularyEnrichmentRequest {
  term: string
  target_language?: string
}

export interface VocabularyEnrichmentResponse {
  term: string
  reading: string | null
  romaji: string | null
  translations: string[]
  part_of_speech: string
  explanation: string
  examples: JapaneseVocabularyExample[]
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
}

export class VocabularyApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'VocabularyApiError'
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isEnrichmentResponse(
  value: unknown,
): value is VocabularyEnrichmentResponse {
  if (!isRecord(value)) {
    return false
  }

  const examples = value.examples
  return (
    typeof value.term === 'string' &&
    (value.reading === null || typeof value.reading === 'string') &&
    (value.romaji === null || typeof value.romaji === 'string') &&
    Array.isArray(value.translations) &&
    value.translations.length > 0 &&
    value.translations.every((translation) => typeof translation === 'string') &&
    typeof value.part_of_speech === 'string' &&
    typeof value.explanation === 'string' &&
    Array.isArray(examples) &&
    examples.length === 2 &&
    examples.every(
      (example) =>
        isRecord(example) &&
        typeof example.sentence === 'string' &&
        typeof example.reading === 'string' &&
        typeof example.translation === 'string',
    ) &&
    (value.jlpt_level === null ||
      ['N5', 'N4', 'N3', 'N2', 'N1'].includes(value.jlpt_level as string))
  )
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function enrichVocabulary(
  request: VocabularyEnrichmentRequest,
  options?: { signal?: AbortSignal },
): Promise<VocabularyEnrichmentResponse> {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}/api/vocabulary/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options?.signal,
    })
  } catch {
    throw new VocabularyApiError(
      'Unable to connect to the Project Language backend.',
      undefined,
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new VocabularyApiError(
      'The backend returned an invalid response.',
      response.status,
    )
  }

  if (!response.ok) {
    const detail =
      isRecord(body) && typeof body.detail === 'string'
        ? body.detail
        : 'The backend could not enrich this word.'
    throw new VocabularyApiError(detail, response.status)
  }

  if (!isEnrichmentResponse(body)) {
    throw new VocabularyApiError(
      'The backend returned data in an unexpected format.',
      response.status,
    )
  }

  return body
}
