import { useEffect, useRef } from 'react'
import type { VocabularyItem } from '../../domain/vocabulary'
import { StudyAnswer } from './StudyAnswer'

interface StudyFlashcardProps {
  item: VocabularyItem
  isAnswerRevealed: boolean
  showReadingHint: boolean
  onToggleReadingHint: () => void
  onReveal: () => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
  isNewCard: boolean
}

export function StudyFlashcard({
  item,
  isAnswerRevealed,
  showReadingHint,
  onToggleReadingHint,
  onReveal,
  headingRef,
  isNewCard,
}: StudyFlashcardProps) {
  const revealButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isAnswerRevealed) {
      revealButtonRef.current?.focus()
    }
  }, [isAnswerRevealed])

  return (
    <article
      className={`study-flashcard${isAnswerRevealed ? ' is-revealed' : ''}${isNewCard ? ' is-new-card' : ''}`}
    >
      {!isAnswerRevealed ? (
        <div className="study-card-face study-card-front">
          <span className="study-card-kicker">Recall</span>
          <h2 ref={headingRef} tabIndex={-1}>{item.term}</h2>
          <p>Try to remember the meaning before revealing the answer.</p>
          <div className="study-card-hints">
            {showReadingHint && item.reading && (
              <span className="study-reading-hint">{item.reading}</span>
            )}
            <button type="button" onClick={onToggleReadingHint}>
              {showReadingHint ? 'Hide reading hint' : 'Show reading hint'}
            </button>
          </div>
          <button
            ref={revealButtonRef}
            className="button button-primary study-reveal-button"
            type="button"
            onClick={onReveal}
          >
            Reveal answer
          </button>
        </div>
      ) : (
        <div className="study-card-face study-card-back">
          <StudyAnswer item={item} />
        </div>
      )}
    </article>
  )
}
