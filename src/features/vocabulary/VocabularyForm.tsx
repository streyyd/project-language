import { useState, type FormEvent } from 'react'
import { enrichVocabulary, VocabularyApiError } from '../../api/vocabularyApi'
import type {
  CreateVocabularyItemInput,
  JapaneseLanguageData,
  JapaneseVocabularyExample,
  VocabularyItem,
} from '../../domain/vocabulary'
import {
  VocabularyEntryEditor,
  type VocabularyEditorValue,
} from './VocabularyEntryEditor'
import {
  editorValueToVocabularyInput,
  enrichmentToEditorValue,
} from './vocabularyEnrichment'

interface VocabularyFormProps {
  item?: VocabularyItem
  onSubmit: (input: CreateVocabularyItemInput) => void
  onCancel: () => void
}

const emptyExamples: JapaneseVocabularyExample[] = [
  { sentence: '', reading: '', translation: '' },
  { sentence: '', reading: '', translation: '' },
]

const emptyForm: VocabularyEditorValue = {
  term: '',
  translations: '',
  reading: '',
  romaji: '',
  partOfSpeech: '',
  explanation: '',
  jlptLevel: '',
  examples: emptyExamples,
  example: '',
  note: '',
}

function getJapaneseData(item?: VocabularyItem): JapaneseLanguageData {
  const data = item?.languageData
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {}
  }
  return data as JapaneseLanguageData
}

function getInitialForm(item?: VocabularyItem): VocabularyEditorValue {
  if (!item) {
    return emptyForm
  }

  const data = getJapaneseData(item)
  const examples = Array.isArray(data.examples) ? data.examples : []

  return {
    term: item.term,
    translations: item.translations.join('\n'),
    reading: item.reading ?? '',
    romaji: typeof data.romaji === 'string' ? data.romaji : '',
    partOfSpeech:
      typeof data.partOfSpeech === 'string' ? data.partOfSpeech : '',
    explanation:
      typeof data.explanation === 'string' ? data.explanation : '',
    jlptLevel:
      typeof data.jlptLevel === 'string' ? data.jlptLevel : '',
    examples:
      examples.length === 2 ? examples : emptyExamples,
    example: item.example ?? '',
    note: item.note ?? '',
  }
}

export function VocabularyForm({
  item,
  onSubmit,
  onCancel,
}: VocabularyFormProps) {
  const [form, setForm] = useState<VocabularyEditorValue>(() => getInitialForm(item))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    const term = form.term.trim()
    if (!term) {
      setValidationError('Enter a Japanese word before generating.')
      return
    }

    setValidationError(null)
    setAiError(null)
    setIsGenerating(true)

    try {
      const enrichment = await enrichVocabulary({
        term,
        target_language: 'ru',
      })
      setForm(enrichmentToEditorValue(enrichment))
    } catch (error) {
      setAiError(
        error instanceof VocabularyApiError
          ? error.message
          : 'Unable to generate this word.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = editorValueToVocabularyInput(form)
    if (!input.term.trim() || !input.translations.length) {
      setValidationError('Add a word and at least one translation.')
      return
    }
    onSubmit(input)
  }

  return (
    <form className="vocabulary-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">{item ? 'Edit entry' : 'New entry'}</p>
          <h2>{item ? 'Update this word' : 'Add a Japanese word'}</h2>
        </div>
        <span className="language-badge">日本語 · JA</span>
      </div>

      <div className="ai-generate-panel">
        <div>
          <strong>Enrich with AI</strong>
          <span>Generate reading, meanings, examples, and more.</span>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      {aiError && (
        <div className="form-error-panel" role="alert">
          <span>{aiError}</span>
          <button type="button" onClick={handleGenerate} disabled={isGenerating}>
            Try again
          </button>
        </div>
      )}

      <VocabularyEntryEditor
        value={form}
        onChange={setForm}
        autoFocus
      />

      {validationError && (
        <p className="form-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button button-primary" type="submit">
          {item ? 'Save changes' : 'Save to Library'}
        </button>
      </div>
    </form>
  )
}
