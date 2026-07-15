"""
FastAPI backend for the DNA Sequence Analyzer.

Run with:
    uvicorn main:app --reload --port 8000

Every endpoint takes a JSON body, builds a DNAAnalyzer from the "sequence"
field, validates it, then calls the matching method from dna_analyzer.py
and returns its dict as JSON. See README.md for the full list of routes.
"""

from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dna_analyzer import DNAAnalyzer
from file_parser import parse_sequence_file

app = FastAPI(title="DNA Sequence Analyzer API")

# Allow the React dev server (Vite default: http://localhost:5173) to call this API.
# In production, replace "*" with your deployed frontend's actual origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request bodies ----------

class SequenceRequest(BaseModel):
    sequence: str

class OrfRequest(BaseModel):
    sequence: str
    min_len_aa: int = 10

class RestrictionRequest(BaseModel):
    sequence: str
    enzymes: Optional[List[str]] = None

class MotifRequest(BaseModel):
    sequence: str
    motif: str

class AlignRequest(BaseModel):
    sequence: str
    target: str

class MutationRequest(BaseModel):
    sequence: str
    mutant: str


# ---------- Helper ----------

def build_validated_analyzer(sequence: str) -> DNAAnalyzer:
    """Creates an analyzer and raises a 400 if the sequence is invalid."""
    analyzer = DNAAnalyzer(sequence)
    validation = analyzer.validate_and_load()
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["message"])
    return analyzer


# ---------- Routes ----------

@app.get("/")
def health_check():
    return {"status": "ok", "message": "DNA Analyzer API is running"}


@app.post("/api/parse-fasta")
async def parse_fasta(file: UploadFile = File(...)):
    """
    Accepts a real uploaded file (multipart/form-data) — any extension.
    Reads its raw bytes and hands them, along with the filename, to
    file_parser.parse_sequence_file(), which decides the format from the
    extension/content (FASTA, GenBank, or raw text) and returns records.
    """
    contents = await file.read()
    result = parse_sequence_file(contents, file.filename)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/validate")
def validate(req: SequenceRequest):
    analyzer = DNAAnalyzer(req.sequence)
    return analyzer.validate_and_load()


@app.post("/api/stats")
def stats(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.get_basic_statistics()


@app.post("/api/reverse-complement")
def reverse_complement(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.get_reverse_complement()


@app.post("/api/transcribe")
def transcribe(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.transcribe_dna()


@app.post("/api/translate")
def translate(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.translate_dna()


@app.post("/api/orfs")
def orfs(req: OrfRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.find_orfs(min_len_aa=req.min_len_aa)


@app.post("/api/restriction")
def restriction(req: RestrictionRequest):
    analyzer = build_validated_analyzer(req.sequence)
    result = analyzer.restriction_analysis(enzyme_names=req.enzymes)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/motif")
def motif(req: MotifRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.search_motif(req.motif)


@app.post("/api/align")
def align(req: AlignRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.align_pairwise(req.target)


@app.post("/api/blast")
def blast(req: SequenceRequest):
    analyzer = build_validated_analyzer(req.sequence)
    result = analyzer.run_online_blast()
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result


@app.post("/api/mutations")
def mutations(req: MutationRequest):
    analyzer = build_validated_analyzer(req.sequence)
    return analyzer.compare_mutations(req.mutant)
