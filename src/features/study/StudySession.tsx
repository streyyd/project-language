import { useEffect, useRef, useState } from 'react'
import type { StudyRating } from './studySessionModel'
import type { VocabularyItem } from '../../domain/vocabulary'
import { StudyFlashcard } from './StudyFlashcard'
import { useStudySession } from './useStudySession'

interface StudySessionProps {
  study: ReturnType<typeof useStudySession>
  onSessionActiveChange: (isActive: boolean) => void
}

const ratingLabels: Record<StudyRating, { title: string; description: string }> = {
  again: { title: 'Again', description: "Didn't remember" },
  hard: { title: 'Hard', description: 'Remembered with difficulty' },
  easy: { title: 'Easy', description: 'Remembered easily' },
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

export function StudySession({
  study,
  onSessionActiveChange,
}: StudySessionProps) {
  const [showReadingHint, setShowReadingHint] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const currentItem: VocabularyItem | undefined = study.currentCard?.item

  useEffect(() => {
    onSessionActiveChange(study.phase === 'session')
  }, [onSessionActiveChange, study.phase])

  useEffect(() => {
    if (study.phase === 'session' && study.completedCards > 0) {
      headingRef.current?.focus()
    }
  }, [study.currentCard?.item.id, study.completedCards, study.phase])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return
      }

      if (
        (event.key === 'Enter' || event.key === ' ') &&
        !study.isAnswerRevealed
      ) {
        event.preventDefault()
        study.revealAnswer()
      }

      if (study.isAnswerRevealed && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault()
        study.assess(
          event.key === '1' ? 'again' : event.key === '2' ? 'hard' : 'easy',
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [study])

  if (!currentItem) {
    return null
  }

  function assess(rating: StudyRating) {
    setShowReadingHint(false)
    study.assess(rating)
  }

  return (
    <section className="study-session">
      <div className="study-session-header">
        <div>
          <p className="eyebrow">Study session</p>
          <h2>Recall the meaning</h2>
        </div>
        <span className="study-position">
          {study.currentPosition} / {study.totalCards}
        </span>
      </div>

      <div
        className="study-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={study.totalCards}
        aria-valuenow={study.completedCards}
        aria-label="Study session progress"
      >
        <span style={{ width: `${study.progressPercentage}%` }} />
      </div>

      <StudyFlashcard
        key={currentItem.id}
        item={currentItem}
        isAnswerRevealed={study.isAnswerRevealed}
        showReadingHint={showReadingHint}
        onToggleReadingHint={() => setShowReadingHint((visible) => !visible)}
        onReveal={study.revealAnswer}
        headingRef={headingRef}
        isNewCard={study.completedCards > 0}
      />

      {!study.isAnswerRevealed ? (
        <p className="study-keyboard-hint">Press Enter or Space to reveal</p>
      ) : (
        <div className="study-assessment" aria-label="Rate your recall">
          {(Object.keys(ratingLabels) as StudyRating[]).map((rating) => (
            <button
              className={`study-rating-button study-rating-${rating}`}
              key={rating}
              type="button"
              onClick={() => assess(rating)}
            >
              <strong>{ratingLabels[rating].title}</strong>
              <span>{ratingLabels[rating].description}</span>
              <kbd>{rating === 'again' ? '1' : rating === 'hard' ? '2' : '3'}</kbd>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
