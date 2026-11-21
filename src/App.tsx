import { useState } from 'react'
import { AppShell } from './app/AppShell'
import {
  navigationItems,
  type AppRoute,
} from './app/navigation'
import { VocabularyPage } from './features/vocabulary/VocabularyPage'
import { StudyPage } from './features/study/StudyPage'
import { StudySpaceShell } from './features/study/StudySpaceShell'
import './App.css'

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('dashboard')
  const [isStudySessionActive, setIsStudySessionActive] = useState(false)
  const activeItem = navigationItems.find((item) => item.route === activeRoute)

  function handleNavigate(nextRoute: AppRoute) {
    if (
      activeRoute === 'study' &&
      isStudySessionActive &&
      nextRoute !== 'study' &&
      !window.confirm('Leave this study session? Your current progress will be lost.')
    ) {
      return
    }

    setIsStudySessionActive(false)
    setActiveRoute(nextRoute)
  }

  if (activeRoute === 'study') {
    return (
      <StudySpaceShell onExit={() => handleNavigate('dashboard')}>
        <StudyPage
          onNavigate={handleNavigate}
          onSessionActiveChange={setIsStudySessionActive}
        />
      </StudySpaceShell>
    )
  }

  return (
    <AppShell activeRoute={activeRoute} onNavigate={handleNavigate}>
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{activeItem?.label}</h1>
          <p className="page-description">{activeItem?.description}</p>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          Personal learning space
        </div>
      </header>

      {activeRoute === 'library' || activeRoute === 'add-words' ? (
        <VocabularyPage
          key={activeRoute}
          initialMode={activeRoute === 'add-words' ? 'add' : 'library'}
          onModeChange={(mode) => {
            if (mode === 'library') {
              setActiveRoute('library')
            }
          }}
        />
      ) : (
        <section className="empty-section" aria-labelledby="section-title">
          <div className="empty-section-icon" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="eyebrow">Coming together</p>
          <h2 id="section-title">Your learning space starts here.</h2>
          <p>
            This section will become the place where you shape your own
            vocabulary and learning practice.
          </p>
        </section>
      )}
    </AppShell>
  )
}

export default App
