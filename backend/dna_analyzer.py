"""
DNAAnalyzer — core Biopython logic.

This is your original DNA_analyzer.py, refactored so every method RETURNS a
plain dict/list (JSON-serializable) instead of only printing to the console.
That's the only change needed to plug it into a web API: FastAPI just takes
whatever these methods return and sends it to the browser as JSON.

The actual Biopython logic (Seq, transcribe, translate, Restriction,
PairwiseAligner, NCBIWWW) is untouched from your version.
"""

from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from Bio import Restriction
from Bio.Align import PairwiseAligner
from Bio.Blast import NCBIWWW, NCBIXML


class DNAAnalyzer:
    def __init__(self, sequence_str: str):
        self.raw_seq = "".join(sequence_str.upper().split())
        self.seq_obj = None

    # 1. Sequence Input and Validation
    def validate_and_load(self) -> dict:
        """Validates if the sequence contains only standard IUPAC DNA nucleotides."""
        valid_nucleotides = set("ATCGN")

        if not self.raw_seq:
            return {"valid": False, "message": "Sequence is empty."}

        invalid_chars = sorted({c for c in self.raw_seq if c not in valid_nucleotides})
        if invalid_chars:
            return {
                "valid": False,
                "message": f"Invalid characters found: {invalid_chars}. "
                           "Only A, T, C, G, and N (unknown) are allowed.",
            }

        self.seq_obj = Seq(self.raw_seq)
        return {"valid": True, "message": "Sequence successfully validated and loaded."}

    # 2. Basic Statistics
    def get_basic_statistics(self) -> dict:
        """Calculates length, GC%, and nucleotide counts."""
        length = len(self.seq_obj)
        gc_pct = gc_fraction(self.seq_obj) * 100
        counts = {base: self.seq_obj.count(base) for base in "ATCGN"}

        return {
            "length": length,
            "gc_content": round(gc_pct, 2),
            "at_content": round(100 - gc_pct, 2),
            "counts": counts,
        }

    # 3. Reverse Complement
    def get_reverse_complement(self) -> dict:
        """Generates the 5' -> 3' reverse complement."""
        rev_comp = self.seq_obj.reverse_complement()
        return {"result": str(rev_comp)}

    # 4. Transcription
    def transcribe_dna(self) -> dict:
        """Transcribes DNA coding strand into mRNA (T -> U)."""
        mrna = self.seq_obj.transcribe()
        return {"result": str(mrna)}

    # 5. Translation
    def translate_dna(self) -> dict:
        """Translates the DNA sequence into a protein sequence."""
        protein = self.seq_obj.translate(to_stop=False)
        return {"result": str(protein)}

    # 6. Open Reading Frame (ORF) Finder
    def find_orfs(self, min_len_aa: int = 10) -> dict:
        """Finds ORFs across all 3 forward reading frames (ATG -> Stop)."""
        orfs = []

        for frame in range(3):
            shifted_seq = self.seq_obj[frame:]
            end_idx = len(shifted_seq) - (len(shifted_seq) % 3)
            protein = shifted_seq[:end_idx].translate()

            pro_str = str(protein)
            start_pos = 0

            while "M" in pro_str[start_pos:]:
                start_idx = pro_str.index("M", start_pos)
                stop_idx = pro_str.find("*", start_idx)

                if stop_idx == -1:
                    orf_aa = pro_str[start_idx:]
                    stop_idx = len(pro_str)
                else:
                    orf_aa = pro_str[start_idx:stop_idx]

                if len(orf_aa) >= min_len_aa:
                    dna_start = frame + (start_idx * 3)
                    dna_end = frame + ((stop_idx + 1) * 3)
                    orfs.append({
                        "frame": frame + 1,
                        "start": dna_start,
                        "end": dna_end,
                        "length_aa": len(orf_aa),
                        "protein": f"M{orf_aa[1:]}*",
                    })

                start_pos = start_idx + 1

        return {"orfs": orfs, "count": len(orfs)}

    # 7. Restriction Enzyme Analysis
    def restriction_analysis(self, enzyme_names: list[str] | None = None) -> dict:
        """Maps cut sites for restriction enzymes."""
        default_names = ["EcoRI", "HindIII", "BamHI"]
        names = enzyme_names or default_names

        try:
            enzyme_objs = [getattr(Restriction, name) for name in names]
        except AttributeError as e:
            return {"error": f"Unknown enzyme name: {e}"}

        batch = Restriction.RestrictionBatch(enzyme_objs)
        results = batch.search(self.seq_obj)

        return {
            "results": [
                {"enzyme": str(enzyme), "cuts": len(sites), "positions": sites}
                for enzyme, sites in results.items()
            ]
        }

    # 8. Motif Search
    def search_motif(self, motif: str) -> dict:
        """Searches for exact sub-sequence motifs within the DNA sequence."""
        motif = motif.upper()
        start = 0
        matches = []

        while True:
            pos = self.raw_seq.find(motif, start)
            if pos == -1:
                break
            matches.append(pos + 1)  # 1-based indexing for biologists
            start = pos + 1

        return {"motif": motif, "positions": matches, "count": len(matches)}

    # 9. Pairwise Alignment
    def align_pairwise(self, target_seq_str: str) -> dict:
        """Performs a global pairwise alignment against a target sequence."""
        aligner = PairwiseAligner()
        aligner.mode = "global"

        alignments = aligner.align(self.seq_obj, Seq(target_seq_str.upper()))
        best_alignment = alignments[0]

        return {
            "num_optimal_alignments": len(alignments),
            "score": best_alignment.score,
            "alignment_text": str(best_alignment),
        }

    # 10. BLAST Integration
    def run_online_blast(self) -> dict:
        """Submits the sequence online to NCBI BLAST (blastn). Slow: ~30-60s."""
        try:
            result_handle = NCBIWWW.qblast("blastn", "nt", self.seq_obj, hitlist_size=3)
            blast_records = NCBIXML.parse(result_handle)

            hits = []
            for record in blast_records:
                for alignment in record.alignments:
                    for hsp in alignment.hsps:
                        hits.append({
                            "title": alignment.title,
                            "length": alignment.length,
                            "e_value": hsp.expect,
                            "query_match": hsp.query[:50] + "...",
                            "sbjct_match": hsp.sbjct[:50] + "...",
                        })
            result_handle.close()
            return {"hits": hits}
        except Exception as e:
            return {"error": f"Failed to perform online BLAST: {e}"}

    # 11. Mutation Comparison
    def compare_mutations(self, mutant_seq_str: str) -> dict:
        """Compares original sequence with a mutant strand to find point mutations (SNPs)."""
        mutant_clean = "".join(mutant_seq_str.upper().split())

        if len(self.raw_seq) != len(mutant_clean):
            alignment_result = self.align_pairwise(mutant_clean)
            return {
                "length_mismatch": True,
                "message": "Sequences differ in length; showing alignment instead.",
                "alignment": alignment_result,
            }

        mutations = []
        for idx, (ref, mut) in enumerate(zip(self.raw_seq, mutant_clean)):
            if ref != mut:
                mutations.append({"position": idx + 1, "reference": ref, "mutant": mut})

        return {"length_mismatch": False, "mutations": mutations, "count": len(mutations)}
