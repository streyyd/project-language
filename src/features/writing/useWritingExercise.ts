import { useCallback, useState } from 'react'
import type { WritingMode, WritingStroke } from './writingTypes'

export function useWritingExercise() {
  const [mode, setMode] = useState<WritingMode>('study')
  const [strokes, setStrokes] = useState<WritingStroke[]>([])

  const clearAttempt = useCallback(() => {
    setStrokes([])
  }, [])

  const retryAttempt = useCallback(() => {
    setStrokes([])
  }, [])

  return {
    mode,
    setMode,
    strokes,
    setStrokes,
    clearAttempt,
    retryAttempt,
  }
}
