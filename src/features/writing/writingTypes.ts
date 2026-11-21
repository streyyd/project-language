export interface WritingPoint {
  x: number
  y: number
  pressure?: number
  timestamp: number
}

export interface WritingStroke {
  points: WritingPoint[]
}

export interface StrokeOutlineSegment {
  id: string
  pathData: string
  clipPathData: string
}

export interface StrokeMedianSegment {
  id: string
  pathData: string
  strokeId: string
  logicalStroke: number
  clipPathData: string
}

export interface AnimCjkKanaTemplate {
  character: 'あ'
  reading: 'a'
  viewBox: [number, number, number, number]
  glyphOutlinePaths: string[]
  strokes: {
    order: number
    outlineSegments: StrokeOutlineSegment[]
    medianSegments: StrokeMedianSegment[]
  }[]
  source: {
    name: 'AnimCJK'
    repositoryUrl: string
    svgUrl: string
    commit: string
    license: 'GNU LGPL v3'
  }
}

export type WritingMode = 'study' | 'practice'
