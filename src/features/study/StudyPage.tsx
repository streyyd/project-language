import type { AppRoute } from '../../app/navigation'
import { useVocabularyLibrary } from '../vocabulary/useVocabularyLibrary'
import { StudySession } from './StudySession'
import { StudySetup } from './StudySetup'
import { StudySummary } from './StudySummary'
import { useStudySession } from './useStudySession'
import type { VocabularyItem } from '../../domain/vocabulary'
import { useEffect, useState } from 'react'
import { WritingPage } from '../writing/WritingPage'

interface StudyPageProps {
  onNavigate: (route: AppRoute) => void
  onSessionActiveChange: (isActive: boolean) => void
}

export function StudyPage({
  onNavigate,
  onSessionActiveChange,
}: StudyPageProps) {
  const library = useVocabularyLibrary('')
  const study = useStudySession()
  const [sessionItems, setSessionItems] = useState<VocabularyItem[]>([])
  const [studyMode, setStudyMode] = useState<'activities' | 'flashcards' | 'writing'>('activities')

  useEffect(() => {
    if (studyMode === 'flashcards') {
      onSessionActiveChange(study.phase === 'session')
    } else {
      onSessionActiveChange(false)
    }
  }, [onSessionActiveChange, study.phase, studyMode])

  function startSession(items: VocabularyItem[]) {
    setSessionItems(items)
    study.startSession(items)
  }

  function backToSetup() {
    study.resetSession()
    setStudyMode('flashcards')
    onSessionActiveChange(false)
  }

  function studyAgain() {
    study.startSession(sessionItems)
  }

  if (studyMode === 'writing') {
    return (
      <WritingPage
        onBackToActivities={() => setStudyMode('activities')}
        onSessionActiveChange={onSessionActiveChange}
      />
    )
  }

  if (studyMode === 'activities') {
    return (
      <section className="study-activities">
        <div className="study-intro">
          <p className="eyebrow">Learning modes</p>
          <h2>What do you want to practice?</h2>
          <p>Choose a focused way to work with Japanese today.</p>
        </div>

        <div className="study-activity-grid">
          <button
            className="study-activity-card"
            type="button"
            onClick={() => setStudyMode('flashcards')}
          >
            <span className="study-activity-mark" aria-hidden="true">Aa</span>
            <div>
              <strong>Flashcards</strong>
              <p>Recall translations and meanings from your vocabulary.</p>
            </div>
            <span className="study-activity-arrow" aria-hidden="true">→</span>
          </button>

          <button
            className="study-activity-card"
            type="button"
            onClick={() => setStudyMode('writing')}
          >
            <span className="study-activity-mark study-activity-mark-cjk" aria-hidden="true">あ</span>
            <div>
              <strong>Writing Practice</strong>
              <p>Study and practice Japanese Hiragana stroke order.</p>
            </div>
            <span className="study-activity-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    )
  }

  if (library.error) {
    return (
      <section className="study-empty">
        <p className="eyebrow">Study unavailable</p>
        <h2>We could not load your vocabulary.</h2>
        <p>{library.error}</p>
        <button className="button button-secondary" type="button" onClick={library.reload}>
          Try again
        </button>
      </section>
    )
  }

  if (study.phase === 'session') {
    return (
      <StudySession
        study={study}
        onSessionActiveChange={onSessionActiveChange}
      />
    )
  }

  if (study.phase === 'summary' && study.summary) {
    return (
      <StudySummary
        summary={study.summary}
        onStudyAgain={studyAgain}
        onBackToSetup={backToSetup}
        onGoToLibrary={() => onNavigate('library')}
      />
    )
  }

  return (
    <StudySetup
      items={library.items}
      onStart={startSession}
      onNavigateToAddWords={() => onNavigate('add-words')}
    />
  )
}
