"""
Parses uploaded gene/sequence files (FASTA, GenBank, or plain text) into
plain dicts the API can return as JSON.

Kept as its own module, separate from dna_analyzer.py, because this is about
*reading files* (I/O + format detection), not sequence analysis.
"""

import io
from Bio import SeqIO

_FASTA_EXTENSIONS = {".fasta", ".fa", ".fna", ".ffn", ".frn"}
_GENBANK_EXTENSIONS = {".gb", ".gbk", ".genbank"}
_RAW_TEXT_EXTENSIONS = {".txt", ".seq"}

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB — generous for gene/genome-fragment files


def _extension(filename: str) -> str:
    idx = filename.rfind(".")
    return filename[idx:].lower() if idx != -1 else ""


def parse_sequence_file(contents: bytes, filename: str) -> dict:
    """
    Parses uploaded file bytes into {"records": [...]} or {"error": "..."}.
    Each record: {"id": str, "description": str, "length": int, "sequence": str}.
    """
    if len(contents) > MAX_FILE_SIZE_BYTES:
        return {"error": f"File too large ({len(contents) // (1024*1024)} MB). Max is 20 MB."}

    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        return {"error": "File isn't readable as text. Please upload a FASTA, GenBank, or plain-text sequence file."}

    stripped = text.strip()
    if not stripped:
        return {"error": "File is empty."}

    ext = _extension(filename)
    looks_like_fasta = stripped.startswith(">")
    looks_like_genbank = stripped.upper().startswith("LOCUS")

    if ext in _GENBANK_EXTENSIONS or (looks_like_genbank and ext not in _FASTA_EXTENSIONS):
        fmt = "genbank"
    elif ext in _FASTA_EXTENSIONS or looks_like_fasta:
        fmt = "fasta"
    elif ext in _RAW_TEXT_EXTENSIONS or ext == "":
        fmt = "raw"
    else:
        return {
            "error": f"Unsupported file type '{ext or '(none)'}'. "
                     "Supported: .fasta, .fa, .fna, .gb, .gbk, .txt"
        }

    if fmt == "raw":
        raw_seq = "".join(stripped.split()).upper()
        if not raw_seq:
            return {"error": "No sequence data found in file."}
        return {
            "records": [{
                "id": filename,
                "description": "Raw sequence (no FASTA/GenBank header found)",
                "length": len(raw_seq),
                "sequence": raw_seq,
            }]
        }

    try:
        records = list(SeqIO.parse(io.StringIO(text), fmt))
    except Exception as e:
        return {"error": f"Couldn't parse file as {fmt.upper()}: {e}"}

    if not records:
        return {"error": f"No sequence records found in this {fmt.upper()} file."}

    return {
        "records": [
            {
                "id": r.id,
                "description": r.description or r.id,
                "length": len(r.seq),
                "sequence": str(r.seq).upper(),
            }
            for r in records
        ]
    }
