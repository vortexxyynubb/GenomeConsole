import { Link } from 'react-router-dom'
import {
  Dna, FlipHorizontal2, FileText, Binary, ScanSearch, Scissors,
  Target, GitCompareArrows, Bug, Globe2, ArrowRight, UploadCloud, Activity,
} from 'lucide-react'

const FEATURES = [
  { icon: Activity, title: 'Validation & statistics', desc: 'Sequence validation with live length, GC/AT content, and nucleotide composition.' },
  { icon: FlipHorizontal2, title: 'Reverse complement', desc: "Generates the 5'→3' reverse complement strand." },
  { icon: FileText, title: 'Transcription', desc: 'Converts the coding strand into its mRNA equivalent.' },
  { icon: Binary, title: 'Translation', desc: 'Reads codons and translates them into the amino acid chain.' },
  { icon: ScanSearch, title: 'ORF finder', desc: 'Scans all reading frames for candidate open reading frames.' },
  { icon: Scissors, title: 'Restriction sites', desc: 'Maps cut sites for common restriction enzymes.' },
  { icon: Target, title: 'Motif search', desc: 'Finds every occurrence of a chosen sub-sequence.' },
  { icon: GitCompareArrows, title: 'Pairwise alignment', desc: 'Global alignment scoring between two sequences.' },
  { icon: Bug, title: 'Mutation comparison', desc: 'Flags single-nucleotide variants between two sequences.' },
  { icon: Globe2, title: 'NCBI BLAST', desc: 'Live BLAST search against NCBI databases.' },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <Dna size={22} strokeWidth={1.75} />
          <div>
            <div className="brand-name">GenomeConsole</div>
            <div className="brand-sub">Sequence Analysis Suite</div>
          </div>
        </div>
        <Link to="/workspace" className="nav-cta">
          Launch workspace <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </header>

      <section className="hero">
        <span className="hero-eyebrow">Python · Biopython · FastAPI · React</span>
        <h1>A complete DNA sequence<br />analysis workbench.</h1>
        <p className="hero-sub">
          Paste a sequence or upload a FASTA file, and run validation, statistics,
          transcription, translation, ORF detection, restriction mapping,
          alignment, mutation comparison, and live NCBI BLAST — all from one console.
        </p>
        <div className="hero-actions">
          <Link to="/workspace" className="run-btn hero-btn">
            Enter workspace <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <span className="hero-hint">
            <UploadCloud size={14} strokeWidth={1.75} /> Upload a FASTA file or paste a sequence directly
          </span>
        </div>
      </section>

      <section className="landing-track-preview">
        <div className="track-preview-label">Sample sequence track</div>
        <div className="track">
          <div className="track-line">
            <span className="track-pos">1</span>
            <span className="track-bases">
              <span className="nt nt-a">ATGCG</span> <span className="nt nt-t">ATCGA</span>{' '}
              <span className="nt nt-c">TCGAT</span> <span className="nt nt-g">CGATC</span>{' '}
              <span className="nt nt-a">GATCG</span> <span className="nt nt-t">ATCGA</span>
            </span>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <h2 className="section-title">Everything the console can run</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <f.icon size={19} strokeWidth={1.75} />
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/workspace" className="run-btn">
          Enter workspace <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </footer>
    </div>
  )
}
