// API Base URL
// Local Development:
//   VITE_API_URL=http://127.0.0.1:8000
//
// Production (Vercel):
//   VITE_API_URL=https://genomeconsole-api.onrender.com

const API_BASE = import.meta.env.PROD
  ? 'https://genomeconsole-api.onrender.com'
  : '';

// ------------------------------
// JSON POST Helper
// ------------------------------
async function post(path, body) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || `Request to ${path} failed (${res.status})`
    );
  }

  return data;
}

// ------------------------------
// File Upload Helper
// ------------------------------
async function postFile(path, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || `Upload to ${path} failed (${res.status})`
    );
  }

  return data;
}

// ------------------------------
// API Functions
// ------------------------------
export const api = {
  validate: (sequence) =>
    post('/validate', { sequence }),

  stats: (sequence) =>
    post('/stats', { sequence }),

  reverseComplement: (sequence) =>
    post('/reverse-complement', { sequence }),

  transcribe: (sequence) =>
    post('/transcribe', { sequence }),

  translate: (sequence) =>
    post('/translate', { sequence }),

  orfs: (sequence, min_len_aa) =>
    post('/orfs', { sequence, min_len_aa }),

  restriction: (sequence, enzymes) =>
    post('/restriction', { sequence, enzymes }),

  motif: (sequence, motif) =>
    post('/motif', { sequence, motif }),

  align: (sequence, target) =>
    post('/align', { sequence, target }),

  blast: (sequence) =>
    post('/blast', { sequence }),

  mutations: (sequence, mutant) =>
    post('/mutations', { sequence, mutant }),

  parseFasta: (file) =>
    postFile('/parse-fasta', file),
};