import type { StudySessionSummary } from './studySessionModel'

interface StudySummaryProps {
  summary: StudySessionSummary
  onStudyAgain: () => void
  onBackToSetup: () => void
  onGoToLibrary: () => void
}

export function StudySummary({
  summary,
  onStudyAgain,
  onBackToSetup,
  onGoToLibrary,
}: StudySummaryProps) {
  const ratings = [
    { key: 'again', label: 'Again', value: summary.againCount },
    { key: 'hard', label: 'Hard', value: summary.hardCount },
    { key: 'easy', label: 'Easy', value: summary.easyCount },
  ]

  return (
    <section className="study-summary">
      <div className="study-summary-heading">
        <span className="study-summary-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">Session complete</p>
        <h2>Nice work showing up.</h2>
        <p>You completed this recall session. Your ratings stay in this session for now.</p>
      </div>

      <div className="study-summary-total">
        <strong>{summary.completedCards}</strong>
        <span>of {summary.totalCards} cards completed</span>
      </div>

      <div className="study-summary-ratings">
        {ratings.map((rating) => (
          <div className={`study-summary-rating study-rating-${rating.key}`} key={rating.key}>
            <strong>{rating.value}</strong>
            <span>{rating.label}</span>
          </div>
        ))}
      </div>

      <div className="study-summary-actions">
        <button className="button button-primary" type="button" onClick={onStudyAgain}>
          Study again
        </button>
        <button className="button button-secondary" type="button" onClick={onBackToSetup}>
          Back to setup
        </button>
        <button className="study-text-button" type="button" onClick={onGoToLibrary}>
          Go to Library
        </button>
      </div>
    </section>
  )
}
