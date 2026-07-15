// Every function here hits a FastAPI route defined in backend/main.py.
// In dev, Vite's proxy (see vite.config.js) forwards "/api/*" to
// http://127.0.0.1:8000, so we can just call relative paths.

async function post(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detail || `Request to ${path} failed (${res.status})`)
  }
  return data
}

// File uploads use multipart/form-data (not JSON) since the backend's
// file_parser.py works on raw bytes + the original filename.
async function postFile(path, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api${path}`, { method: 'POST', body: formData })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detail || `Upload to ${path} failed (${res.status})`)
  }
  return data
}

export const api = {
  validate: (sequence) => post('/validate', { sequence }),
  stats: (sequence) => post('/stats', { sequence }),
  reverseComplement: (sequence) => post('/reverse-complement', { sequence }),
  transcribe: (sequence) => post('/transcribe', { sequence }),
  translate: (sequence) => post('/translate', { sequence }),
  orfs: (sequence, min_len_aa) => post('/orfs', { sequence, min_len_aa }),
  restriction: (sequence, enzymes) => post('/restriction', { sequence, enzymes }),
  motif: (sequence, motif) => post('/motif', { sequence, motif }),
  align: (sequence, target) => post('/align', { sequence, target }),
  blast: (sequence) => post('/blast', { sequence }),
  mutations: (sequence, mutant) => post('/mutations', { sequence, mutant }),
  parseFasta: (file) => postFile('/parse-fasta', file),
}
