import { useEffect, useState } from 'react'
import { WritingStrokeDemo } from './WritingStrokeDemo'
import { WritingSurface } from './WritingSurface'
import { useWritingExercise } from './useWritingExercise'

interface WritingPageProps {
  onBackToActivities: () => void
  onSessionActiveChange: (isActive: boolean) => void
}

export function WritingPage({
  onBackToActivities,
  onSessionActiveChange,
}: WritingPageProps) {
  const exercise = useWritingExercise()
  const [showGuide, setShowGuide] = useState(true)

  useEffect(() => {
    onSessionActiveChange(exercise.mode === 'practice')
  }, [exercise.mode, onSessionActiveChange])

  function handleBack() {
    onSessionActiveChange(false)
    onBackToActivities()
  }

  return (
    <section className="writing-page">
      <div className="writing-page-header">
        <button
          className="study-text-button"
          type="button"
          onClick={handleBack}
        >
          ← Back to learning modes
        </button>

        <div className="writing-mode-tabs" aria-label="Writing activity mode">
          <button
            className={exercise.mode === 'study' ? 'is-active' : ''}
            type="button"
            onClick={() => exercise.setMode('study')}
          >
            Study
          </button>
          <button
            className={exercise.mode === 'practice' ? 'is-active' : ''}
            type="button"
            onClick={() => exercise.setMode('practice')}
          >
            Practice
          </button>
        </div>
      </div>

      {exercise.mode === 'study' ? (
        <div className="writing-study">
          <div className="writing-study-heading">
            <p className="eyebrow">Study · Hiragana</p>
            <h2>Learn あ</h2>
            <p className="writing-reading">Reading: <strong>a</strong></p>
          </div>
          <WritingStrokeDemo />
          <div className="writing-study-footer">
            <button
              className="button button-primary"
              type="button"
              onClick={() => exercise.setMode('practice')}
            >
              Practice writing あ
            </button>
          </div>
        </div>
      ) : (
        <WritingSurface
          strokes={exercise.strokes}
          onChange={exercise.setStrokes}
          showGuide={showGuide}
          onToggleGuide={() => setShowGuide((visible) => !visible)}
          onClear={exercise.clearAttempt}
        />
      )}
    </section>
  )
}
