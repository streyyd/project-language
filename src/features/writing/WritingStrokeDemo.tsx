import { useEffect, useRef, useState } from 'react'
import { kanaAAnimCjkTemplate } from './kanaAAnimCjkTemplate'

const strokeStartPoints: Record<number, [number, number]> = {
  1: [174, 258],
  2: [331, 137],
  3: [570, 440],
}

export function WritingStrokeDemo() {
  const [activeStrokeIndex, setActiveStrokeIndex] = useState<number | null>(null)
  const [segmentProgress, setSegmentProgress] = useState(0)
  const [revealedStrokeOrders, setRevealedStrokeOrders] = useState<Set<number>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const runRef = useRef(0)

  function stopAnimation() {
    runRef.current += 1
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsPlaying(false)
    setActiveStrokeIndex(null)
    setSegmentProgress(0)
    setRevealedStrokeOrders(new Set())
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function runAnimation(orders: number[]) {
    stopAnimation()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealedStrokeOrders(new Set(orders))
      setActiveStrokeIndex(null)
      setSegmentProgress(1)
      setIsPlaying(false)
      return
    }

    const runId = runRef.current + 1
    runRef.current = runId
    setIsPlaying(true)
    setRevealedStrokeOrders(new Set())

    let orderIndex = 0
    function animateNextStroke() {
      if (runRef.current !== runId) {
        return
      }

      if (orderIndex >= orders.length) {
        setActiveStrokeIndex(null)
        setSegmentProgress(0)
        setIsPlaying(false)
        setRevealedStrokeOrders(new Set(orders))
        return
      }

      const stroke = kanaAAnimCjkTemplate.strokes.find(
        (item) => item.order === orders[orderIndex],
      )
      if (!stroke) {
        orderIndex += 1
        animateNextStroke()
        return
      }

      setActiveStrokeIndex(stroke.order)
      setSegmentProgress(0)
      const strokeOrder = stroke.order

      const startedAt = performance.now()
      const duration = 850

      function frame(now: number) {
        if (runRef.current !== runId) {
          return
        }

        const progress = Math.min((now - startedAt) / duration, 1)
        setSegmentProgress(progress)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(frame)
          return
        }

        setRevealedStrokeOrders((current) =>
          new Set([...current, strokeOrder]),
        )
        orderIndex += 1
        timeoutRef.current = window.setTimeout(animateNextStroke, 260)
      }

      animationFrameRef.current = requestAnimationFrame(frame)
    }

    animateNextStroke()
  }

  function replayAll() {
    runAnimation([1, 2, 3])
  }

  function replayStroke(order: number) {
    runAnimation([order])
  }

  return (
    <section className="writing-demo" aria-label="Stroke order demonstration">
      <div className="writing-demo-visual">
        <svg
          className="writing-demo-svg"
          viewBox="0 0 1024 1024"
          role="img"
          aria-label="Correct stroke order for Hiragana あ"
        >
          <defs>
            {kanaAAnimCjkTemplate.strokes.flatMap((stroke) =>
              stroke.outlineSegments.map((segment) => (
                <clipPath key={segment.id} id={segment.id}>
                  <path d={segment.clipPathData} />
                </clipPath>
              )),
            )}
          </defs>

          <g className="writing-glyph-outline" aria-hidden="true">
            {kanaAAnimCjkTemplate.glyphOutlinePaths.map((pathData) => (
              <path d={pathData} key={pathData} />
            ))}
          </g>

          {kanaAAnimCjkTemplate.strokes.map((stroke) =>
            stroke.outlineSegments.map((segment) =>
              revealedStrokeOrders.has(stroke.order) ? (
                <path
                  className="writing-glyph-reveal"
                  d={segment.pathData}
                  key={segment.id}
                />
              ) : null,
            ),
          )}

          {kanaAAnimCjkTemplate.strokes.map((stroke) =>
            activeStrokeIndex === stroke.order
              ? stroke.medianSegments.map((segment) => (
                  <path
                    className="writing-median"
                    d={segment.pathData}
                    key={segment.id}
                    clipPath={`url(#${segment.strokeId})`}
                    pathLength={3333}
                    style={{
                      strokeDasharray: 3337,
                      strokeDashoffset: 3339 - 3337 * segmentProgress,
                    }}
                  />
                ))
              : null,
          )}

          {activeStrokeIndex !== null &&
            strokeStartPoints[activeStrokeIndex] && (
              <circle
                className="writing-demo-start"
                cx={strokeStartPoints[activeStrokeIndex][0]}
                cy={strokeStartPoints[activeStrokeIndex][1]}
                r="12"
              />
            )}
        </svg>

        <div className="writing-demo-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={isPlaying ? stopAnimation : replayAll}
          >
            {isPlaying ? 'Stop demonstration' : revealedStrokeOrders.size > 0 ? 'Replay' : 'Play'}
          </button>
        </div>

        <div className="writing-stroke-actions" aria-label="Replay an individual stroke">
          {[1, 2, 3].map((order) => (
            <button
              className="study-text-button"
              type="button"
              key={order}
              onClick={() => replayStroke(order)}
            >
              Repeat stroke {order}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
