import type {
  JapaneseLanguageData,
  JapaneseVocabularyExample,
  VocabularyItem,
} from '../../domain/vocabulary'

interface StudyAnswerProps {
  item: VocabularyItem
}

function getJapaneseData(item: VocabularyItem): JapaneseLanguageData {
  const data = item.languageData
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {}
  }
  return data as JapaneseLanguageData
}

function getExamples(data: JapaneseLanguageData): JapaneseVocabularyExample[] {
  return Array.isArray(data.examples)
    ? data.examples.filter(
        (example): example is JapaneseVocabularyExample =>
          typeof example === 'object' &&
          example !== null &&
          typeof example.sentence === 'string' &&
          typeof example.reading === 'string' &&
          typeof example.translation === 'string',
      )
    : []
}

export function StudyAnswer({ item }: StudyAnswerProps) {
  const data = getJapaneseData(item)
  const examples = getExamples(data)

  return (
    <div className="study-answer">
      <div className="study-answer-heading">
        <span className="study-answer-label">Answer</span>
        <strong>{item.term}</strong>
      </div>

      {item.reading && (
        <div className="study-answer-reading">
          <span>Reading</span>
          <strong>{item.reading}</strong>
        </div>
      )}

      <div className="study-answer-section">
        <span>Translation</span>
        <p>{item.translations.join(', ')}</p>
      </div>

      {typeof data.partOfSpeech === 'string' && data.partOfSpeech && (
        <div className="study-answer-section">
          <span>Part of speech</span>
          <p>{data.partOfSpeech}</p>
        </div>
      )}

      {typeof data.explanation === 'string' && data.explanation && (
        <div className="study-answer-section">
          <span>Usage</span>
          <p>{data.explanation}</p>
        </div>
      )}

      {examples.length > 0 && (
        <div className="study-examples">
          <span>Examples</span>
          {examples.map((example, index) => (
            <div className="study-example" key={`${example.sentence}-${index}`}>
              <strong>{example.sentence}</strong>
              <small>{example.reading}</small>
              <p>{example.translation}</p>
            </div>
          ))}
        </div>
      )}

      {!examples.length && item.example && (
        <div className="study-answer-section">
          <span>Example</span>
          <p>{item.example}</p>
        </div>
      )}
    </div>
  )
}
