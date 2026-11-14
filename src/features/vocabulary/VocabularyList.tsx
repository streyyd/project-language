import type { VocabularyItem } from '../../domain/vocabulary'
import { formatTranslations } from './vocabularyUtils'

interface VocabularyListProps {
  items: VocabularyItem[]
  onEdit: (item: VocabularyItem) => void
  onDelete: (item: VocabularyItem) => void
}

export function VocabularyList({
  items,
  onEdit,
  onDelete,
}: VocabularyListProps) {
  return (
    <div className="vocabulary-list">
      {items.map((item) => (
        <article className="vocabulary-card" key={item.id}>
          <div className="vocabulary-card-main">
            <div className="vocabulary-term">
              <strong>{item.term}</strong>
              {item.reading && <span>{item.reading}</span>}
            </div>
            <p className="vocabulary-translations">
              {formatTranslations(item)}
            </p>
            {item.example && (
              <p className="vocabulary-example">{item.example}</p>
            )}
            {item.note && <p className="vocabulary-note">{item.note}</p>}
          </div>
          <div className="vocabulary-card-actions">
            <button type="button" onClick={() => onEdit(item)}>
              Edit
            </button>
            <button type="button" onClick={() => onDelete(item)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
