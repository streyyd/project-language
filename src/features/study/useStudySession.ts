import { useCallback, useMemo, useState } from 'react'
import type { VocabularyItem } from '../../domain/vocabulary'
import {
  assessCurrentCard,
  cancelStudySession,
  createStudySession,
  resetStudySession,
  revealAnswer,
  type StudyRating,
  type StudySessionState,
} from './studySessionModel'

export function useStudySession() {
  const [state, setState] = useState<StudySessionState>(resetStudySession)

  const startSession = useCallback((items: VocabularyItem[]) => {
    setState(createStudySession(items))
  }, [])

  const reveal = useCallback(() => {
    setState((currentState) => revealAnswer(currentState))
  }, [])

  const assess = useCallback((rating: StudyRating) => {
    setState((currentState) => assessCurrentCard(currentState, rating))
  }, [])

  const resetSession = useCallback(() => {
    setState(resetStudySession())
  }, [])

  const cancelSession = useCallback(() => {
    setState(cancelStudySession())
  }, [])

  const currentCard = state.cards[state.currentIndex]
  const completedCards = useMemo(
    () => state.cards.filter((card) => card.rating !== undefined).length,
    [state.cards],
  )
  const againCount = useMemo(
    () => state.cards.filter((card) => card.rating === 'again').length,
    [state.cards],
  )
  const hardCount = useMemo(
    () => state.cards.filter((card) => card.rating === 'hard').length,
    [state.cards],
  )
  const easyCount = useMemo(
    () => state.cards.filter((card) => card.rating === 'easy').length,
    [state.cards],
  )
  const totalCards = state.cards.length
  const progressPercentage =
    totalCards === 0 ? 0 : (completedCards / totalCards) * 100

  return {
    ...state,
    currentCard,
    totalCards,
    completedCards,
    currentPosition:
      state.phase === 'session' ? state.currentIndex + 1 : completedCards,
    againCount,
    hardCount,
    easyCount,
    progressPercentage,
    startSession,
    revealAnswer: reveal,
    assess,
    resetSession,
    cancelSession,
  }
}
