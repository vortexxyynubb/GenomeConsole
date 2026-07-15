const BASES = ['A', 'T', 'C', 'G', 'N']

export default function CompositionBar({ counts, length }) {
  if (!length) return null

  return (
    <div className="comp-bar-wrap">
      <div className="comp-bar">
        {BASES.map((base) => {
          const count = counts[base] || 0
          const pct = (count / length) * 100
          if (pct === 0) return null
          return (
            <div
              key={base}
              className={`comp-segment comp-${base.toLowerCase()}`}
              style={{ width: `${pct}%` }}
              title={`${base}: ${count} (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div className="comp-legend">
        {BASES.filter((b) => counts[b] > 0).map((base) => (
          <span key={base} className="comp-legend-item">
            <span className={`comp-dot comp-${base.toLowerCase()}`} />
            {base} {((counts[base] / length) * 100).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  )
}
