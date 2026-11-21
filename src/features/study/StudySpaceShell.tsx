import type { ReactNode } from 'react'

interface StudySpaceShellProps {
  children: ReactNode
  onExit: () => void
}

export function StudySpaceShell({
  children,
  onExit,
}: StudySpaceShellProps) {
  return (
    <div className="study-space-shell">
      <header className="study-space-header">
        <div className="study-space-brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <div>
            <strong>Project Language</strong>
            <span>Study Space</span>
          </div>
        </div>

        <button className="study-space-exit" type="button" onClick={onExit}>
          <span aria-hidden="true">←</span>
          Back to workspace
        </button>
      </header>

      <main className="study-space-content" aria-label="Study Space">
        {children}
      </main>
    </div>
  )
}
