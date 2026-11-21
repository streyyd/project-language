import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { kanaAAnimCjkTemplate } from './kanaAAnimCjkTemplate'
import type { WritingStroke } from './writingTypes'

interface WritingSurfaceProps {
  strokes: WritingStroke[]
  onChange: (strokes: WritingStroke[]) => void
  showGuide: boolean
  onToggleGuide: () => void
  onClear: () => void
}

export function WritingSurface({
  strokes,
  onChange,
  showGuide,
  onToggleGuide,
  onClear,
}: WritingSurfaceProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const activeStrokeRef = useRef<WritingStroke | null>(null)
  const strokesRef = useRef<WritingStroke[]>(strokes)
  const [drawingStroke, setDrawingStroke] = useState<WritingStroke | null>(null)

  useEffect(() => {
    strokesRef.current = strokes
  }, [strokes])

  function getNormalizedPoint(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    const svg = svgRef.current
    if (!svg) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    if (!rect.width || !rect.height) {
      return null
    }

    return {
      x: Math.max(0, Math.min(1024, ((event.clientX - rect.left) / rect.width) * 1024)),
      y: Math.max(0, Math.min(1024, ((event.clientY - rect.top) / rect.height) * 1024)),
      pressure: event.pressure,
      timestamp: event.timeStamp,
    }
  }

  function handlePointerDown(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    event.preventDefault()
    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)

    const point = getNormalizedPoint(event)
    if (point) {
      const newStroke = { points: [point] }
      activeStrokeRef.current = newStroke
      setDrawingStroke(newStroke)
    }
  }

  function handlePointerMove(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }

    const nativeEvent = event.nativeEvent
    const coalescedEvents =
      'getCoalescedEvents' in nativeEvent &&
      typeof nativeEvent.getCoalescedEvents === 'function'
        ? nativeEvent.getCoalescedEvents()
        : [nativeEvent]

    coalescedEvents.forEach((pointerEvent) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect?.width || !rect.height) {
        return
      }

      const point = {
        x: Math.max(0, Math.min(1024, ((pointerEvent.clientX - rect.left) / rect.width) * 1024)),
        y: Math.max(0, Math.min(1024, ((pointerEvent.clientY - rect.top) / rect.height) * 1024)),
        pressure: pointerEvent.pressure,
        timestamp: pointerEvent.timeStamp,
      }

      activeStrokeRef.current =
        activeStrokeRef.current
          ? { points: [...activeStrokeRef.current.points, point] }
          : { points: [point] }
    })
    if (activeStrokeRef.current) {
      setDrawingStroke({ points: [...activeStrokeRef.current.points] })
    }
  }

  function finishStroke(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }

    const finalPoint = getNormalizedPoint(event)
    const currentStroke = activeStrokeRef.current

    if (currentStroke?.points.length) {
      const lastPoint = currentStroke.points[currentStroke.points.length - 1]
      const completedStroke =
        finalPoint &&
        (finalPoint.x !== lastPoint?.x || finalPoint.y !== lastPoint?.y)
          ? { points: [...currentStroke.points, finalPoint] }
          : currentStroke
      strokesRef.current = [...strokesRef.current, completedStroke]
      onChange(strokesRef.current)
    }

    activeStrokeRef.current = null
    setDrawingStroke(null)
    activePointerIdRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handlePointerCancel(
    event: ReactPointerEvent<SVGSVGElement>,
  ) {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }
    setDrawingStroke(null)
    activeStrokeRef.current = null
    activePointerIdRef.current = null
  }

  return (
    <div className="writing-practice">
      <div className="writing-practice-toolbar">
        <div>
          <span className="writing-practice-status">Practice</span>
          <strong>Write あ</strong>
        </div>
        <div className="writing-practice-actions">
          <button
            className="button button-secondary"
            type="button"
            aria-pressed={showGuide}
            onClick={onToggleGuide}
          >
            {showGuide ? 'Hide guide' : 'Show guide'}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={onClear}
            disabled={!strokes.length && !drawingStroke}
          >
            Clear
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="writing-surface"
        viewBox="0 0 1024 1024"
        role="application"
        aria-label="Writing surface for Hiragana あ"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={handlePointerCancel}
      >
        <g className="writing-grid" aria-hidden="true">
          <line x1="512" y1="32" x2="512" y2="992" />
          <line x1="32" y1="512" x2="992" y2="512" />
          <path d="M32 32 L992 992 M992 32 L32 992" />
        </g>

        {showGuide && (
          <g className="writing-guide" aria-hidden="true">
            {kanaAAnimCjkTemplate.glyphOutlinePaths.map((pathData) => (
              <path d={pathData} key={pathData} />
            ))}
          </g>
        )}

        {strokes.map((stroke, index) => (
          <polyline
            className="writing-user-stroke"
            key={index}
            points={stroke.points
              .map((point) => `${point.x},${point.y}`)
              .join(' ')}
          />
        ))}

        {drawingStroke && (
          <polyline
            className="writing-user-stroke is-drawing"
            points={drawingStroke.points
              .map((point) => `${point.x},${point.y}`)
              .join(' ')}
          />
        )}
      </svg>

      <p className="writing-practice-hint">
        Draw each stroke separately. This prototype records your movement and does not yet score it.
      </p>
    </div>
  )
}
