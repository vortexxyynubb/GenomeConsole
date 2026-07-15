# 🧬 GenomeConsole

![React](https://img.shields.io/badge/React-19-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Python](https://img.shields.io/badge/Python-3.12-yellow)
![Biopython](https://img.shields.io/badge/Biopython-1.84-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![Render](https://img.shields.io/badge/Backend-Render-purple)

🌐 **Live Demo:** https://genome-console.vercel.app

⚙️ **API Docs:** https://genomeconsole-api.onrender.com/docs


# 🧬 GenomeConsole — Full Stack DNA Sequence Analysis Suite

GenomeConsole is a full-stack bioinformatics web application that performs end-to-end DNA sequence analysis using **FastAPI**, **Biopython**, and **React**.

Users can analyze DNA sequences directly in the browser, upload FASTA or GenBank files, perform multiple bioinformatics analyses, and even run live NCBI BLAST searches—all from a modern web interface.

---

# 🌐 Live Demo

### Frontend
https://genome-console.vercel.app

### Backend API
https://genomeconsole-api.onrender.com

### FastAPI Interactive API Documentation
https://genomeconsole-api.onrender.com/docs

---

# Project Structure

```
GenomeConsole/
├── .gitignore
├── README.md
├── start-app.bat
│
├── backend/
│   ├── dna_analyzer.py
│   ├── file_parser.py
│   ├── main.py
│   ├── requirements.txt
│   └── runtime.txt
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── api.js
    │   └── components/
    │       ├── SequenceTrack.jsx
    │       └── CompositionBar.jsx
```

---

# Application Architecture

GenomeConsole consists of three layers.

```
React Frontend (Vercel)

        │
        │ HTTPS Requests
        ▼

FastAPI Backend (Render)

        │
        │ Python Function Calls
        ▼

Biopython Analysis Engine
```

The React frontend never performs biological analysis itself.

Instead, it sends requests to the FastAPI backend, which creates a `DNAAnalyzer` object and executes the requested Biopython workflow before returning JSON back to the browser.

---

# How Everything Connects

## 1. dna_analyzer.py

This file contains the complete biological analysis engine.

It performs:

- Sequence validation
- Basic statistics
- Reverse complement
- DNA transcription
- Protein translation
- ORF detection
- Restriction enzyme analysis
- Motif search
- Pairwise alignment
- Mutation comparison
- Online BLAST search

Every function returns structured Python dictionaries instead of printing results.

---

## 2. file_parser.py

Responsible for uploaded sequence files.

Supported formats:

- FASTA
- GenBank
- Plain Text

The parser automatically detects the format using both

- filename extension
- file contents

and returns structured JSON objects that the frontend can immediately display.

---

## 3. main.py

FastAPI converts every DNAAnalyzer method into an API endpoint.

Example:

```python
@app.post("/api/stats")
def stats(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.get_basic_statistics()
```

When the frontend sends

```
POST /api/stats
```

FastAPI returns JSON like

```json
{
    "length": 1250,
    "gc_content": 48.7
}
```

---

## 4. React Frontend

The frontend never directly communicates with Biopython.

Instead,

```
App.jsx
        ↓
api.js
        ↓
FastAPI
        ↓
DNAAnalyzer
```

`api.js` is the only file that knows where the backend API lives.

For development:

```
http://127.0.0.1:8000
```

For production:

```
https://genomeconsole-api.onrender.com
```

using

```
VITE_API_URL
```

---

# Features

GenomeConsole currently supports

- DNA Sequence Validation
- Basic Sequence Statistics
- GC Content Analysis
- Reverse Complement
- DNA → RNA Transcription
- DNA → Protein Translation
- Open Reading Frame Detection
- Restriction Enzyme Mapping
- Motif Search
- Pairwise Sequence Alignment
- Mutation Comparison
- NCBI Online BLAST Search
- FASTA Upload
- GenBank Upload
- Plain Text Upload
- Multiple Sequence Selection
- Interactive Sequence Visualization

---

# Supported File Formats

| Extension | Format |
|-----------|---------|
| .fasta | FASTA |
| .fa | FASTA |
| .fna | FASTA |
| .ffn | FASTA |
| .frn | FASTA |
| .gb | GenBank |
| .gbk | GenBank |
| .genbank | GenBank |
| .txt | Plain Text |
| .seq | Plain Text |

Maximum upload size:

```
20 MB
```

---

# Running Locally

## Backend

```
cd backend

python -m venv venv

Windows

venv\Scripts\activate

Linux/macOS

source venv/bin/activate

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

Backend

```
http://127.0.0.1:8000
```

API Docs

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```
cd frontend

npm install

npm run dev
```

Frontend

```
http://localhost:5173
```

---

## Windows Shortcut

Simply double-click

```
start-app.bat
```

which automatically starts both the backend and frontend.

---

# API Endpoints

| Method | Endpoint |
|---------|----------|
| POST | /api/validate |
| POST | /api/stats |
| POST | /api/reverse-complement |
| POST | /api/transcribe |
| POST | /api/translate |
| POST | /api/orfs |
| POST | /api/restriction |
| POST | /api/motif |
| POST | /api/align |
| POST | /api/mutations |
| POST | /api/blast |
| POST | /api/parse-fasta |

Interactive API documentation:

```
https://genomeconsole-api.onrender.com/docs
```

---

# Deployment

## Backend

Hosted on **Render**

Technology:

- FastAPI
- Uvicorn
- Python 3.12
- Biopython

Public API:

```
https://genomeconsole-api.onrender.com
```

---

## Frontend

Hosted on **Vercel**

Technology:

- React
- Vite

Live Website:

```
https://genome-console.vercel.app
```

---

# Technologies Used

Frontend

- React
- Vite
- JavaScript
- CSS

Backend

- FastAPI
- Uvicorn
- Pydantic
- Python

Bioinformatics

- Biopython
- NCBI BLAST
- PairwiseAligner
- Restriction Analysis
- SeqIO

Deployment

- Vercel
- Render
- GitHub

---

# Future Improvements

- Multiple Sequence Alignment
- Phylogenetic Tree Construction
- Codon Usage Analysis
- Primer Design
- Protein Structure Prediction
- Gene Annotation
- Interactive Genome Browser
- Downloadable PDF Reports
- User Authentication
- Saved Analysis History

---

# License

This project is intended for educational, research, and portfolio purposes.