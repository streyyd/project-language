import type { VocabularyItem } from '../../domain/vocabulary'

export type StudyPhase = 'setup' | 'session' | 'summary'
export type StudyRating = 'again' | 'hard' | 'easy'

export interface StudySessionCard {
  item: VocabularyItem
  rating?: StudyRating
}

export interface StudySessionSummary {
  totalCards: number
  completedCards: number
  againCount: number
  hardCount: number
  easyCount: number
}

export interface StudySessionState {
  phase: StudyPhase
  cards: StudySessionCard[]
  currentIndex: number
  isAnswerRevealed: boolean
  summary?: StudySessionSummary
}

export type RandomFunction = () => number

function snapshotItem(item: VocabularyItem): VocabularyItem {
  return {
    ...item,
    translations: [...item.translations],
    languageData: item.languageData
      ? structuredClone(item.languageData)
      : undefined,
    knowledge: structuredClone(item.knowledge),
  }
}

export function shuffleCards<T>(
  values: T[],
  random: RandomFunction = Math.random,
): T[] {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

export function resetStudySession(): StudySessionState {
  return {
    phase: 'setup',
    cards: [],
    currentIndex: 0,
    isAnswerRevealed: false,
  }
}

export function createStudySession(
  items: VocabularyItem[],
  random: RandomFunction = Math.random,
): StudySessionState {
  const cards = shuffleCards(
    items.map((item) => ({ item: snapshotItem(item) })),
    random,
  )

  return {
    phase: 'session',
    cards,
    currentIndex: 0,
    isAnswerRevealed: false,
  }
}

export function revealAnswer(
  state: StudySessionState,
): StudySessionState {
  if (state.phase !== 'session') {
    return state
  }

  return { ...state, isAnswerRevealed: true }
}

export function calculateSessionSummary(
  cards: StudySessionCard[],
): StudySessionSummary {
  return {
    totalCards: cards.length,
    completedCards: cards.filter((card) => card.rating !== undefined).length,
    againCount: cards.filter((card) => card.rating === 'again').length,
    hardCount: cards.filter((card) => card.rating === 'hard').length,
    easyCount: cards.filter((card) => card.rating === 'easy').length,
  }
}

export function moveToNextCard(
  state: StudySessionState,
): StudySessionState {
  if (
    state.phase !== 'session' ||
    state.currentIndex >= state.cards.length - 1
  ) {
    return state
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    isAnswerRevealed: false,
  }
}

export function assessCurrentCard(
  state: StudySessionState,
  rating: StudyRating,
): StudySessionState {
  if (
    state.phase !== 'session' ||
    !state.isAnswerRevealed ||
    !state.cards[state.currentIndex]
  ) {
    return state
  }

  const cards = state.cards.map((card, index) =>
    index === state.currentIndex ? { ...card, rating } : card,
  )

  if (state.currentIndex === cards.length - 1) {
    return {
      ...state,
      phase: 'summary',
      cards,
      isAnswerRevealed: false,
      summary: calculateSessionSummary(cards),
    }
  }

  return moveToNextCard({
    ...state,
    cards,
  })
}

export function cancelStudySession(): StudySessionState {
  return resetStudySession()
}
