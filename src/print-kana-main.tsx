import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PrintKanaPrototype } from './features/print-kana/PrintKanaPrototype'
import './features/print-kana/print-kana.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrintKanaPrototype />
  </StrictMode>,
)
