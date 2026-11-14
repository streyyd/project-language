import type { JapaneseVocabularyExample } from '../../domain/vocabulary'

export interface VocabularyEditorValue {
  term: string
  translations: string
  reading: string
  romaji: string
  partOfSpeech: string
  explanation: string
  jlptLevel: string
  examples: JapaneseVocabularyExample[]
  example: string
  note: string
}

interface VocabularyEntryEditorProps {
  value: VocabularyEditorValue
  onChange: (value: VocabularyEditorValue) => void
  autoFocus?: boolean
}

function updateExample(
  examples: JapaneseVocabularyExample[],
  index: number,
  field: keyof JapaneseVocabularyExample,
  value: string,
): JapaneseVocabularyExample[] {
  return examples.map((example, exampleIndex) =>
    exampleIndex === index ? { ...example, [field]: value } : example,
  )
}

export function VocabularyEntryEditor({
  value,
  onChange,
  autoFocus = false,
}: VocabularyEntryEditorProps) {
  function updateField(
    field: keyof VocabularyEditorValue,
    nextValue: string,
  ) {
    onChange({ ...value, [field]: nextValue })
  }

  function updateExampleField(
    index: number,
    field: keyof JapaneseVocabularyExample,
    nextValue: string,
  ) {
    onChange({
      ...value,
      examples: updateExample(value.examples, index, field, nextValue),
    })
  }

  return (
    <div className="form-fields">
      <label>
        <span>Japanese term</span>
        <input
          autoFocus={autoFocus}
          value={value.term}
          onChange={(event) => updateField('term', event.target.value)}
          placeholder="食べる"
        />
      </label>

      <label>
        <span>Translation(s)</span>
        <textarea
          value={value.translations}
          onChange={(event) => updateField('translations', event.target.value)}
          placeholder={'to eat\nfood'}
          rows={2}
        />
        <small>Use a new line for each translation.</small>
      </label>

      <div className="form-grid-two">
        <label>
          <span>Reading <em>optional</em></span>
          <input
            value={value.reading}
            onChange={(event) => updateField('reading', event.target.value)}
            placeholder="たべる"
          />
        </label>
        <label>
          <span>Romaji <em>optional</em></span>
          <input
            value={value.romaji}
            onChange={(event) => updateField('romaji', event.target.value)}
            placeholder="taberu"
          />
        </label>
      </div>

      <div className="form-grid-two">
        <label>
          <span>Part of speech <em>optional</em></span>
          <input
            value={value.partOfSpeech}
            onChange={(event) =>
              updateField('partOfSpeech', event.target.value)
            }
            placeholder="verb"
          />
        </label>
        <label>
          <span>JLPT level <em>optional</em></span>
          <select
            value={value.jlptLevel}
            onChange={(event) => updateField('jlptLevel', event.target.value)}
          >
            <option value="">Unknown</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
        </label>
      </div>

      <label>
        <span>Explanation <em>optional</em></span>
        <textarea
          value={value.explanation}
          onChange={(event) => updateField('explanation', event.target.value)}
          placeholder="Meaning and typical usage"
          rows={3}
        />
      </label>

      <div className="examples-editor">
        <div className="field-section-heading">
          <span>Examples <em>optional</em></span>
          <small>Two example sentences can be edited before saving.</small>
        </div>
        {value.examples.map((example, index) => (
          <div className="example-editor" key={index}>
            <strong>Example {index + 1}</strong>
            <input
              aria-label={`Example ${index + 1} Japanese sentence`}
              value={example.sentence}
              onChange={(event) =>
                updateExampleField(index, 'sentence', event.target.value)
              }
              placeholder="Japanese sentence"
            />
            <input
              aria-label={`Example ${index + 1} reading`}
              value={example.reading}
              onChange={(event) =>
                updateExampleField(index, 'reading', event.target.value)
              }
              placeholder="Reading"
            />
            <input
              aria-label={`Example ${index + 1} translation`}
              value={example.translation}
              onChange={(event) =>
                updateExampleField(index, 'translation', event.target.value)
              }
              placeholder="Translation"
            />
          </div>
        ))}
      </div>

      <label>
        <span>Note <em>optional</em></span>
        <textarea
          value={value.note}
          onChange={(event) => updateField('note', event.target.value)}
          placeholder="A personal note about this word"
          rows={2}
        />
      </label>
    </div>
  )
}
