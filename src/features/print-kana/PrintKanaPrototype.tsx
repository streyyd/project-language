import { useEffect, useMemo, useRef, useState } from 'react'
import { printKanaCharacters, type PrintKanaCharacter } from './printKanaData'

type ComparisonMode = 'noto' | 'trajectories' | 'animated' | 'overlay'

interface GlyphBox {
  left: number
  right: number
  top: number
  bottom: number
  scale: number
  centerX: number
  centerY: number
}

const FONT_SIZE = 760
const BASELINE = 820
const VIEW_SIZE = 1024

function measureGlyphBox(character: string): GlyphBox | null {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  context.font = `400 ${FONT_SIZE}px "Noto Sans JP Print Prototype"`
  context.textAlign = 'center'
  context.textBaseline = 'alphabetic'
  const metrics = context.measureText(character)

  const left = VIEW_SIZE / 2 - metrics.actualBoundingBoxLeft
  const right = VIEW_SIZE / 2 + metrics.actualBoundingBoxRight
  const top = BASELINE - metrics.actualBoundingBoxAscent
  const bottom = BASELINE + metrics.actualBoundingBoxDescent
  const width = Math.max(right - left, 1)
  const height = Math.max(bottom - top, 1)
  const scale = Math.min(width / 109, height / 109)

  return {
    left,
    right,
    top,
    bottom,
    scale,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  }
}

function toKanjiTransform(box: GlyphBox): string {
  return `translate(${box.centerX} ${box.centerY}) scale(${box.scale}) translate(-54.5 -54.5)`
}

function toStartPoint(strokeStart: [number, number], box: GlyphBox): [number, number] {
  return [
    box.centerX + (strokeStart[0] - 54.5) * box.scale,
    box.centerY + (strokeStart[1] - 54.5) * box.scale,
  ]
}

export function PrintKanaPrototype() {
  const [selectedId, setSelectedId] = useState<PrintKanaCharacter['id']>('a')
  const [mode, setMode] = useState<ComparisonMode>('overlay')
  const [fontReady, setFontReady] = useState(false)
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0)
  const [strokeProgress, setStrokeProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [individualStroke, setIndividualStroke] = useState<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const runRef = useRef(0)
  const strokeProgressRef = useRef(0)

  const selected = printKanaCharacters.find((item) => item.id === selectedId)!
  const glyphBox = useMemo(
    () => (fontReady ? measureGlyphBox(selected.character) : null),
    [fontReady, selected.character],
  )

  useEffect(() => {
    document.fonts.load(`400 ${FONT_SIZE}px "Noto Sans JP Print Prototype"`).then(() => {
      setFontReady(true)
    })
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const runId = ++runRef.current
    const duration = individualStroke !== null ? 900 : 850
    const startProgress = strokeProgressRef.current
    const startedAt = performance.now() - startProgress * duration

    function frame(now: number) {
      if (runRef.current !== runId) {
        return
      }

      const progress = Math.min((now - startedAt) / duration, 1)
      strokeProgressRef.current = progress
      setStrokeProgress(progress)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(frame)
        return
      }

      if (individualStroke !== null) {
        setIsPlaying(false)
        strokeProgressRef.current = 1
        setStrokeProgress(1)
        return
      }

      if (activeStrokeIndex < selected.strokes.length - 1) {
        setActiveStrokeIndex((current) => current + 1)
        strokeProgressRef.current = 0
        setStrokeProgress(0)
        return
      }

      setStrokeProgress(1)
      strokeProgressRef.current = 1
      setIsPlaying(false)
    }

    animationFrameRef.current = requestAnimationFrame(frame)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isPlaying, activeStrokeIndex, individualStroke, selected.strokes.length])

  function playOrPause() {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    if (strokeProgress >= 1) {
      setActiveStrokeIndex(0)
      setStrokeProgress(0)
      strokeProgressRef.current = 0
      setIndividualStroke(null)
    }

    setIsPlaying(true)
  }

  function replayAll() {
    runRef.current += 1
    setActiveStrokeIndex(0)
    setStrokeProgress(0)
    strokeProgressRef.current = 0
    setIndividualStroke(null)
    setIsPlaying(true)
  }

  function replayStroke(index: number) {
    runRef.current += 1
    setActiveStrokeIndex(index)
    setStrokeProgress(0)
    strokeProgressRef.current = 0
    setIndividualStroke(index)
    setIsPlaying(true)
  }

  function selectCharacter(id: PrintKanaCharacter['id']) {
    runRef.current += 1
    setSelectedId(id)
    setActiveStrokeIndex(0)
    setStrokeProgress(0)
    strokeProgressRef.current = 0
    setIndividualStroke(null)
    setIsPlaying(false)
  }

  const showStaticGlyph =
    mode === 'noto' || mode === 'animated' || mode === 'overlay'
  const showTrajectories =
    mode === 'trajectories' || mode === 'overlay'

  return (
    <main className="print-kana-prototype">
      <header className="print-kana-header">
        <div>
          <p className="print-kana-eyebrow">Isolated technical prototype</p>
          <h1>Noto + KanjiVG alignment</h1>
        </div>
        <span>Not integrated into Writing Practice</span>
      </header>

      <section className="print-kana-controls">
        <div className="print-kana-character-tabs" aria-label="Prototype character">
          {printKanaCharacters.map((item) => (
            <button
              className={selectedId === item.id ? 'is-active' : ''}
              type="button"
              key={item.id}
              onClick={() => selectCharacter(item.id)}
            >
              {item.character}
            </button>
          ))}
        </div>

        <div className="print-kana-mode-tabs" aria-label="Comparison mode">
          {([
            ['noto', 'Static Noto'],
            ['trajectories', 'Trajectories'],
            ['animated', 'Animated'],
            ['overlay', 'Overlay'],
          ] as [ComparisonMode, string][]).map(([value, label]) => (
            <button
              className={mode === value ? 'is-active' : ''}
              type="button"
              key={value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="print-kana-grid">
        <div className="print-kana-visual">
          <svg
            className="print-kana-svg"
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            role="img"
            aria-label={`${selected.character} print-style glyph and KanjiVG trajectory comparison`}
          >
            {glyphBox && (
              <rect
                className="print-kana-bbox"
                x={glyphBox.left}
                y={glyphBox.top}
                width={glyphBox.right - glyphBox.left}
                height={glyphBox.bottom - glyphBox.top}
              />
            )}

            {showStaticGlyph && (
              <text
                className="print-kana-noto-glyph"
                x={VIEW_SIZE / 2}
                y={BASELINE}
                textAnchor="middle"
                fontSize={FONT_SIZE}
                fontFamily='"Noto Sans JP Print Prototype", sans-serif'
                opacity={mode === 'noto' ? 1 : 0.16}
              >
                {selected.character}
              </text>
            )}

            {showTrajectories && glyphBox && (
              <g transform={toKanjiTransform(glyphBox)}>
                {selected.strokes.map((stroke, index) => (
                  <path
                    className={`print-kana-trajectory stroke-${index + 1}`}
                    d={stroke.path}
                    key={stroke.id}
                    pathLength={1}
                    fill="none"
                    strokeWidth="2.2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            )}

            {mode === 'animated' && glyphBox && (
              <g transform={toKanjiTransform(glyphBox)}>
                {selected.strokes.map((stroke, index) => {
                  const isActive =
                    individualStroke === null
                      ? index === activeStrokeIndex
                      : index === individualStroke
                  const progress =
                    individualStroke !== null
                      ? individualStroke === index
                        ? strokeProgress
                        : 0
                      : index < activeStrokeIndex
                        ? 1
                        : index === activeStrokeIndex
                          ? strokeProgress
                          : 0

                  return isActive ? (
                    <path
                      className="print-kana-animated-stroke"
                      d={stroke.path}
                      key={stroke.id}
                      pathLength={1}
                      fill="none"
                      strokeDasharray={1}
                      strokeDashoffset={1 - progress}
                      strokeWidth="3.2"
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : null
                })}
              </g>
            )}

            {glyphBox && showTrajectories && selected.strokes.map((stroke, index) => {
              const [x, y] = toStartPoint(stroke.start, glyphBox)
              return (
                <g key={`${stroke.id}-start`}>
                  <circle cx={x} cy={y} r="8" className="print-kana-start-point" />
                  <text x={x} y={y + 5} className="print-kana-start-label">
                    {index + 1}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="print-kana-playback">
            <button className="print-kana-primary" type="button" onClick={playOrPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button type="button" onClick={replayAll}>Replay</button>
            {selected.strokes.map((stroke, index) => (
              <button type="button" key={stroke.id} onClick={() => replayStroke(index)}>
                Stroke {index + 1}
              </button>
            ))}
          </div>
        </div>

        <aside className="print-kana-report">
          <p className="print-kana-eyebrow">Alignment record</p>
          <dl>
            <div>
              <dt>Character</dt>
              <dd>{selected.character}</dd>
            </div>
            <div>
              <dt>Logical strokes</dt>
              <dd>{selected.strokes.length}</dd>
            </div>
            <div>
              <dt>Font source</dt>
              <dd>Noto Sans JP Regular · Sans2.004</dd>
            </div>
            <div>
              <dt>Stroke source</dt>
              <dd>KanjiVG r20250816</dd>
            </div>
            <div>
              <dt>Alignment</dt>
              <dd>Aspect-preserving fit into measured glyph bbox</dd>
            </div>
            <div>
              <dt>Manual correction</dt>
              <dd>None</dd>
            </div>
          </dl>

          <p className="print-kana-warning">
            This prototype records automatic mapping only. It does not certify
            that every trajectory follows the printed Noto centerline.
          </p>
        </aside>
      </section>

      <footer className="print-kana-source">
        <p>
          Noto: Noto Sans CJK JP Regular, release Sans2.004,
          <code> notofonts/noto-cjk</code>.
        </p>
        <p>
          KanjiVG release r20250816, SVG stroke data.
        </p>
        <p>
          OFL 1.1 applies to the font; CC BY-SA 3.0 applies to KanjiVG-derived
          stroke paths. Attribution and license files are preserved beside the prototype asset.
        </p>
      </footer>
    </main>
  )
}
