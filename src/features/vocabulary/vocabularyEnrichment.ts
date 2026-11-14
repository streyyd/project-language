import type { VocabularyEnrichmentResponse } from '../../api/vocabularyApi'
import type {
  CreateVocabularyItemInput,
  JapaneseLanguageData,
} from '../../domain/vocabulary'
import type { VocabularyEditorValue } from './VocabularyEntryEditor'

export function enrichmentToVocabularyInput(
  enrichment: VocabularyEnrichmentResponse,
): CreateVocabularyItemInput {
  const languageData: JapaneseLanguageData = {
    ...(enrichment.romaji ? { romaji: enrichment.romaji } : {}),
    ...(enrichment.part_of_speech
      ? { partOfSpeech: enrichment.part_of_speech }
      : {}),
    ...(enrichment.explanation ? { explanation: enrichment.explanation } : {}),
    ...(enrichment.jlpt_level ? { jlptLevel: enrichment.jlpt_level } : {}),
    examples: enrichment.examples,
  }

  return {
    languageCode: 'ja',
    term: enrichment.term,
    translations: enrichment.translations,
    reading: enrichment.reading ?? '',
    example: enrichment.examples[0]?.sentence,
    languageData,
  }
}

export function enrichmentToEditorValue(
  enrichment: VocabularyEnrichmentResponse,
): VocabularyEditorValue {
  return {
    term: enrichment.term,
    translations: enrichment.translations.join('\n'),
    reading: enrichment.reading ?? '',
    romaji: enrichment.romaji ?? '',
    partOfSpeech: enrichment.part_of_speech,
    explanation: enrichment.explanation,
    jlptLevel: enrichment.jlpt_level ?? '',
    examples: enrichment.examples,
    example: enrichment.examples[0]?.sentence ?? '',
    note: '',
  }
}

export function editorValueToVocabularyInput(
  value: VocabularyEditorValue,
): CreateVocabularyItemInput {
  const translations = value.translations
    .split('\n')
    .map((translation) => translation.trim())
    .filter(Boolean)

  const examples = value.examples.filter(
    (example) =>
      example.sentence.trim() ||
      example.reading.trim() ||
      example.translation.trim(),
  )

  const languageData: JapaneseLanguageData = {
    ...(value.romaji.trim() ? { romaji: value.romaji.trim() } : {}),
    ...(value.partOfSpeech.trim()
      ? { partOfSpeech: value.partOfSpeech.trim() }
      : {}),
    ...(value.explanation.trim()
      ? { explanation: value.explanation.trim() }
      : {}),
    ...(value.jlptLevel
      ? { jlptLevel: value.jlptLevel as JapaneseLanguageData['jlptLevel'] }
      : {}),
    ...(examples.length ? { examples } : {}),
  }

  return {
    languageCode: 'ja',
    term: value.term,
    translations,
    reading: value.reading,
    example: examples[0]?.sentence || value.example,
    note: value.note,
    languageData,
  }
}
