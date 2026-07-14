// Renders the proportional A/T/C/G/N composition bar + legend shown under the
// "Overview" stats card. Consumes the `counts` dict and `length` returned by
// /api/stats (see dna_analyzer.py -> get_basic_statistics).
//
// Used in App.jsx as:
//   <CompositionBar counts={stats.counts} length={stats.length} />

const ORDER = ['A', 'T', 'C', 'G', 'N']
const CLASS_MAP = { A: 'comp-a', T: 'comp-t', C: 'comp-c', G: 'comp-g', N: 'comp-n' }
const LABEL_MAP = { A: 'Adenine', T: 'Thymine', C: 'Cytosine', G: 'Guanine', N: 'Unknown' }

export default function CompositionBar({ counts, length }) {
  if (!counts || !length) return null

  return (
    <div className="comp-bar-wrap">
      <div className="comp-bar">
        {ORDER.map((base) => {
          const count = counts[base] || 0
          if (count === 0) return null
          const pct = (count / length) * 100
          return (
            <div
              key={base}
              className={`comp-segment ${CLASS_MAP[base]}`}
              style={{ width: `${pct}%` }}
              title={`${LABEL_MAP[base]} (${base}): ${count} — ${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>
      <div className="comp-legend">
        {ORDER.map((base) => {
          const count = counts[base] || 0
          const pct = ((count / length) * 100).toFixed(1)
          return (
            <span className="comp-legend-item" key={base}>
              <span className={`comp-dot ${CLASS_MAP[base]}`} />
              {base}: {count} ({pct}%)
            </span>
          )
        })}
      </div>
    </div>
  )
}
