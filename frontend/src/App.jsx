import { useEffect, useState } from 'react'
import {
  Dna, FlipHorizontal2, FileText, Binary, ScanSearch, Scissors,
  Target, GitCompareArrows, Bug, Globe2,
} from 'lucide-react'
import { api } from './api'
import SequenceTrack from './components/SequenceTrack'
import CompositionBar from './components/CompositionBar'

const SAMPLE_SEQ =
  'ATGCGATCGATCGATCGATCGATAGCGCGTATATATGCGTACGATCGATGAATTCGATCGATCGAAGCTT'

const TOOLS = [
  { id: 'revcomp', label: 'Reverse Complement', icon: FlipHorizontal2 },
  { id: 'transcribe', label: 'Transcription', icon: FileText },
  { id: 'translate', label: 'Translation', icon: Binary },
  { id: 'orfs', label: 'ORF Finder', icon: ScanSearch },
  { id: 'restriction', label: 'Restriction Sites', icon: Scissors },
  { id: 'motif', label: 'Motif Search', icon: Target },
  { id: 'align', label: 'Pairwise Alignment', icon: GitCompareArrows },
  { id: 'mutations', label: 'Mutation Comparison', icon: Bug },
  { id: 'blast', label: 'NCBI BLAST', icon: Globe2 },
]

export default function App() {
  const [sequence, setSequence] = useState(SAMPLE_SEQ)
  const [validation, setValidation] = useState(null)
  const [stats, setStats] = useState(null)
  const [activeTool, setActiveTool] = useState('revcomp')

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!sequence.trim()) {
        setValidation(null)
        setStats(null)
        return
      }
      try {
        const v = await api.validate(sequence)
        setValidation(v)
        setStats(v.valid ? await api.stats(sequence) : null)
      } catch (e) {
        setValidation({ valid: false, message: e.message })
        setStats(null)
      }
    }, 350)
    return () => clearTimeout(handle)
  }, [sequence])

  const isValid = validation?.valid === true
  const cleanSeq = isValid ? sequence.toUpperCase().replace(/\s/g, '') : ''
  const ActiveIcon = TOOLS.find((t) => t.id === activeTool)?.icon

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <Dna size={22} strokeWidth={1.75} />
          <div>
            <div className="brand-name">GenomeConsole</div>
            <div className="brand-sub">Sequence Analysis Suite</div>
          </div>
        </div>
        <div className="topbar-status">
          {stats ? `${stats.length} bp loaded` : 'No sequence loaded'}
        </div>
      </header>

      <div className="body">
        <nav className="sidebar">
          <div className="sidebar-label">Analysis Tools</div>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              <t.icon size={17} strokeWidth={1.75} />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="dashboard">
          <section className="card input-card">
            <div className="card-head">
              <h2>Sequence Input</h2>
              {validation && (
                <span className={`badge ${validation.valid ? 'badge-ok' : 'badge-error'}`}>
                  {validation.valid ? 'Valid' : 'Invalid'}
                </span>
              )}
            </div>
            <textarea
              className="seq-input"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="Paste a DNA sequence (A, T, C, G, N)…"
              spellCheck={false}
            />
            {validation && !validation.valid && (
              <p className="field-error">{validation.message}</p>
            )}
          </section>

          {stats && (
            <section className="card overview-card">
              <div className="card-head"><h2>Overview</h2></div>
              <div className="stat-row">
                <div className="stat-block">
                  <span className="stat-value">{stats.length}</span>
                  <span className="stat-label">Length (bp)</span>
                </div>
                <div className="stat-block">
                  <span className="stat-value">{stats.gc_content}%</span>
                  <span className="stat-label">GC Content</span>
                </div>
                <div className="stat-block">
                  <span className="stat-value">{stats.at_content}%</span>
                  <span className="stat-label">AT Content</span>
                </div>
              </div>
              <CompositionBar counts={stats.counts} length={stats.length} />
            </section>
          )}

          {isValid && (
            <section className="card track-card">
              <div className="card-head"><h2>Sequence Track</h2></div>
              <SequenceTrack sequence={cleanSeq} />
            </section>
          )}

          <section className="card tool-card">
            <div className="card-head">
              {ActiveIcon && <ActiveIcon size={18} strokeWidth={1.75} />}
              <h2>{TOOLS.find((t) => t.id === activeTool)?.label}</h2>
            </div>
            {!isValid ? (
              <p className="hint">Enter a valid sequence above to use this tool.</p>
            ) : (
              <ToolPanel toolId={activeTool} sequence={sequence} />
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

// ---------- Tool panels ----------

function useRun(fn) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      setResult(await fn(...args))
    } catch (e) {
      setError(e.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }
  return { result, error, loading, run }
}

function ToolPanel({ toolId, sequence }) {
  switch (toolId) {
    case 'revcomp':
      return <SimpleTool fetcher={() => api.reverseComplement(sequence)} render={(r) => <Readout text={r.result} />} />
    case 'transcribe':
      return <SimpleTool fetcher={() => api.transcribe(sequence)} render={(r) => <Readout text={r.result} />} />
    case 'translate':
      return <SimpleTool fetcher={() => api.translate(sequence)} render={(r) => <Readout text={r.result} />} />
    case 'orfs':
      return <OrfTool sequence={sequence} />
    case 'restriction':
      return <RestrictionTool sequence={sequence} />
    case 'motif':
      return <MotifTool sequence={sequence} />
    case 'align':
      return <AlignTool sequence={sequence} />
    case 'mutations':
      return <MutationTool sequence={sequence} />
    case 'blast':
      return <BlastTool sequence={sequence} />
    default:
      return null
  }
}

function ToolActions({ onRun, loading }) {
  return (
    <button className="run-btn" onClick={onRun} disabled={loading}>
      {loading ? 'Running…' : 'Run analysis'}
    </button>
  )
}

function Readout({ text }) {
  return <pre className="readout">{text}</pre>
}

function ResultState({ error, loading, hasResult }) {
  if (error) return <p className="field-error">{error}</p>
  if (!hasResult && !loading) return <p className="hint">Results will appear here.</p>
  return null
}

function SimpleTool({ fetcher, render }) {
  const { result, error, loading, run } = useRun(fetcher)
  useEffect(() => { run() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="tool-body">
      {result && render(result)}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function OrfTool({ sequence }) {
  const [minLen, setMinLen] = useState(10)
  const { result, error, loading, run } = useRun(() => api.orfs(sequence, Number(minLen)))
  return (
    <div className="tool-body">
      <div className="field-row">
        <label className="field-label">Minimum ORF length (aa)</label>
        <input className="text-input" type="number" min="1" value={minLen} onChange={(e) => setMinLen(e.target.value)} />
        <ToolActions onRun={run} loading={loading} />
      </div>
      {result && result.count === 0 && <p className="hint">No ORFs matched.</p>}
      {result && result.orfs.map((o, i) => (
        <pre key={i} className="readout">
          {`Frame +${o.frame}  |  ${o.start}-${o.end} bp  |  ${o.length_aa} aa\n${o.protein}`}
        </pre>
      ))}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function RestrictionTool({ sequence }) {
  const { result, error, loading, run } = useRun(() => api.restriction(sequence))
  useEffect(() => { run() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="tool-body">
      {result && (
        <table className="data-table">
          <thead><tr><th>Enzyme</th><th>Cuts</th><th>Positions</th></tr></thead>
          <tbody>
            {result.results.map((r) => (
              <tr key={r.enzyme}>
                <td className="mono">{r.enzyme}</td>
                <td>{r.cuts}</td>
                <td className="mono">{r.positions.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function MotifTool({ sequence }) {
  const [motif, setMotif] = useState('')
  const { result, error, loading, run } = useRun(() => api.motif(sequence, motif))
  return (
    <div className="tool-body">
      <div className="field-row">
        <label className="field-label">Motif</label>
        <input className="text-input" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="e.g. CGCGT" />
        <ToolActions onRun={run} loading={loading} />
      </div>
      {result && (
        <>
          <p className="hint">{result.count} match(es) at positions: {result.positions.join(', ') || '—'}</p>
          <SequenceTrack sequence={sequence.toUpperCase().replace(/\s/g, '')} highlightPositions={result.positions} />
        </>
      )}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function AlignTool({ sequence }) {
  const [target, setTarget] = useState('')
  const { result, error, loading, run } = useRun(() => api.align(sequence, target))
  return (
    <div className="tool-body">
      <label className="field-label">Target sequence</label>
      <textarea className="seq-input small" value={target} onChange={(e) => setTarget(e.target.value)} />
      <ToolActions onRun={run} loading={loading} />
      {result && (
        <>
          <p className="hint">Score: {result.score} · Optimal alignments: {result.num_optimal_alignments}</p>
          <Readout text={result.alignment_text} />
        </>
      )}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function MutationTool({ sequence }) {
  const [mutant, setMutant] = useState('')
  const { result, error, loading, run } = useRun(() => api.mutations(sequence, mutant))
  return (
    <div className="tool-body">
      <label className="field-label">Mutant sequence</label>
      <textarea className="seq-input small" value={mutant} onChange={(e) => setMutant(e.target.value)} />
      <ToolActions onRun={run} loading={loading} />
      {result && result.length_mismatch && (
        <>
          <p className="hint">{result.message}</p>
          <Readout text={result.alignment.alignment_text} />
        </>
      )}
      {result && !result.length_mismatch && (
        result.count === 0
          ? <p className="hint">No point mutations found. Sequences are identical.</p>
          : (
            <table className="data-table">
              <thead><tr><th>Position</th><th>Reference</th><th>Mutant</th></tr></thead>
              <tbody>
                {result.mutations.map((m) => (
                  <tr key={m.position}><td>{m.position}</td><td className="mono">{m.reference}</td><td className="mono">{m.mutant}</td></tr>
                ))}
              </tbody>
            </table>
          )
      )}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}

function BlastTool({ sequence }) {
  const { result, error, loading, run } = useRun(() => api.blast(sequence))
  return (
    <div className="tool-body">
      <p className="hint">Submits to NCBI over the network — this can take 30–60 seconds.</p>
      <ToolActions onRun={run} loading={loading} />
      {result && result.hits.length === 0 && <p className="hint">No hits returned.</p>}
      {result && result.hits.map((h, i) => (
        <pre key={i} className="readout">
          {`${h.title}\nlength=${h.length}  ·  e-value=${h.e_value}\nquery: ${h.query_match}\nsbjct: ${h.sbjct_match}`}
        </pre>
      ))}
      <ResultState error={error} loading={loading} hasResult={!!result} />
    </div>
  )
}
