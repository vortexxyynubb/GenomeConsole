const BASE_CLASS = { A: 'nt-a', T: 'nt-t', C: 'nt-c', G: 'nt-g', N: 'nt-n' }

const LINE_LENGTH = 60
const GROUP_SIZE = 10
const MAX_RENDERED = 1200 // cap DOM size for very long pasted sequences

// Renders a sequence the way a flat-file sequence viewer would: a right-aligned
// 1-based position gutter, then bases grouped in 10s per line, each base
// colored by nucleotide. Positions in `highlightPositions` (1-based) get a
// highlight background — used for motif hits and mutation sites.
export default function SequenceTrack({ sequence, highlightPositions = [] }) {
  if (!sequence) {
    return <div className="track track-empty">Sequence track renders once you enter a valid sequence.</div>
  }

  const truncated = sequence.length > MAX_RENDERED
  const shown = truncated ? sequence.slice(0, MAX_RENDERED) : sequence
  const highlightSet = new Set(highlightPositions)

  const lines = []
  for (let i = 0; i < shown.length; i += LINE_LENGTH) {
    lines.push({ start: i, chunk: shown.slice(i, i + LINE_LENGTH) })
  }

  return (
    <div className="track">
      {lines.map((line) => (
        <div className="track-line" key={line.start}>
          <span className="track-pos">{line.start + 1}</span>
          <span className="track-bases">
            {line.chunk.split('').map((base, i) => {
              const pos = line.start + i + 1
              const groupEnd = (i + 1) % GROUP_SIZE === 0 && i !== line.chunk.length - 1
              return (
                <span
                  key={pos}
                  title={`${pos}: ${base}`}
                  className={[
                    'nt',
                    BASE_CLASS[base] || 'nt-n',
                    highlightSet.has(pos) ? 'nt-hit' : '',
                    groupEnd ? 'nt-group-end' : '',
                  ].join(' ').trim()}
                >
                  {base}
                </span>
              )
            })}
          </span>
        </div>
      ))}
      {truncated && (
        <p className="track-truncated">
          Showing first {MAX_RENDERED} of {sequence.length} bp.
        </p>
      )}
    </div>
  )
}
