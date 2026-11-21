import type { VocabularyItem } from '../../domain/vocabulary'

interface StudySelectionListProps {
  items: VocabularyItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
}

export function StudySelectionList({
  items,
  selectedIds,
  onToggle,
}: StudySelectionListProps) {
  return (
    <div className="study-selection-list">
      {items.map((item) => (
        <label className="study-selection-item" key={item.id}>
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => onToggle(item.id)}
          />
          <span className="study-selection-copy">
            <strong>{item.term}</strong>
            {item.reading && <small>{item.reading}</small>}
          </span>
        </label>
      ))}
    </div>
  )
}
