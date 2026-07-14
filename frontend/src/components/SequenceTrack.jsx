// Renders a scrollable, monospace, position-numbered view of a DNA sequence.
// Each base is colored by nucleotide (via the .nt-a / .nt-t / .nt-c / .nt-g / .nt-n
// classes already defined in App.css). If `highlightPositions` is passed (1-based,
// as returned by /api/motif), matching bases get the `.nt-hit` highlight class.
//
// Used in two places in App.jsx:
//   <SequenceTrack sequence={cleanSeq} />
//   <SequenceTrack sequence={...} highlightPositions={result.positions} />

const LINE_WIDTH = 60   // bases per row
const GROUP_SIZE = 10   // visual grouping within a row (adds a small gap)
const MAX_LINES = 60    // safety cap so extremely long sequences don't stall the DOM

const BASE_CLASS = { A: 'nt-a', T: 'nt-t', C: 'nt-c', G: 'nt-g', N: 'nt-n' }

export default function SequenceTrack({ sequence = '', highlightPositions = [] }) {
  if (!sequence) {
    return <p className="track-empty">No sequence to display.</p>
  }

  const highlightSet = new Set(highlightPositions)

  const lines = []
  for (let i = 0; i < sequence.length; i += LINE_WIDTH) {
    lines.push(sequence.slice(i, i + LINE_WIDTH))
  }
  const truncated = lines.length > MAX_LINES
  const visibleLines = truncated ? lines.slice(0, MAX_LINES) : lines

  return (
    <div className="track">
      {visibleLines.map((line, lineIdx) => {
        const lineStart = lineIdx * LINE_WIDTH
        return (
          <div className="track-line" key={lineStart}>
            <span className="track-pos">{lineStart + 1}</span>
            <span className="track-bases">
              {line.split('').map((base, i) => {
                const pos = lineStart + i + 1 // 1-based, matches backend's motif positions
                const isGroupEnd = (i + 1) % GROUP_SIZE === 0 && i !== line.length - 1
                const isHit = highlightSet.has(pos)
                const cls = [
                  'nt',
                  BASE_CLASS[base] || 'nt-n',
                  isGroupEnd ? 'nt-group-end' : '',
                  isHit ? 'nt-hit' : '',
                ].filter(Boolean).join(' ')
                return (
                  <span key={pos} className={cls}>
                    {base}
                  </span>
                )
              })}
            </span>
          </div>
        )
      })}
      {truncated && (
        <p className="track-truncated">
          Showing first {MAX_LINES * LINE_WIDTH} of {sequence.length} bp.
        </p>
      )}
    </div>
  )
}
