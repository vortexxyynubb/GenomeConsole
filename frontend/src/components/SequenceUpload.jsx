import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { api } from '../api'

// Reads the uploaded file as text in the browser, sends it to
// POST /api/parse-fasta (which uses Bio.SeqIO under the hood), and hands
// the chosen sequence back to the parent via onSequenceLoaded.
export default function SequenceUpload({ onSequenceLoaded }) {
  const fileInputRef = useRef(null)
  const [records, setRecords] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file) {
    setError(null)
    setLoading(true)
    setRecords(null)

    if (file.size > 20 * 1024 * 1024) {
      setError('That file is larger than 20 MB — too big to be a typical sequence file.')
      setLoading(false)
      return
    }

    try {
      const result = await api.parseFasta(file)
      setFileName(file.name)
      if (result.records.length === 1) {
        onSequenceLoaded(result.records[0].sequence)
      } else {
        setRecords(result.records) // let the user pick which one to load
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-block">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />
      <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={loading}>
        <UploadCloud size={15} strokeWidth={1.75} />
        {loading ? 'Reading file…' : 'Upload sequence file'}
      </button>

      {fileName && !error && <span className="upload-filename">{fileName}</span>}
      {error && <p className="field-error">{error}</p>}

      {records && (
        <div className="record-picker">
          <p className="hint">This file has {records.length} sequences — pick one to load:</p>
          {records.map((r, i) => (
            <button
              key={i}
              className="record-option"
              onClick={() => { onSequenceLoaded(r.sequence); setRecords(null) }}
            >
              <span className="record-id">{r.id}</span>
              <span className="record-desc">{r.description} · {r.length} bp</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
