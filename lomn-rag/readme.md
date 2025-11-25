# RAG-ST: Retrieval-Augmented Generation Pipeline for Transparent LOMN Generation

**Author:** Abid Farhan Jeem  
**Date:** November 2025

## Overview

This project implements a Retrieval-Augmented Generation (RAG) pipeline for generating transparent, consistent, and evidence-grounded Letters of Medical Necessity (LOMNs). The system supports clinical documentation workflows while operationalizing the Social Transparency (ST-Lens) framework.

### Key Features

- **Local-First Architecture**: Fully local embedding and retrieval stack to avoid PHI exposure
- **Semantic Search**: FAISS vector indexing for efficient retrieval
- **Evidence-Grounded Generation**: LLaMA 3 via Ollama for transparent LOMN generation
- **Multi-Category Support**: Psychiatric, cancer, chronic medical, cardiac, and terminal illness conditions
- **Transparent Reasoning**: Explicit surfacing of evidence chunks that influenced generation

## Architecture

The system integrates four core components:

1. **Curated Dataset**: Synthetically expanded LOMNs across major clinical categories
2. **Local Embeddings**: SentenceTransformers for semantic representation
3. **Vector Index**: FAISS for efficient similarity search
4. **LLM Generation**: Locally hosted LLaMA 3 for grounded text generation

## Dataset Structure

Each LOMN is stored in structured JSON format:
```json
{
  "id": "psych_001",
  "category": "psychiatric",
  "payer": "Aetna",
  "diagnosis": "Recurrent major depressive disorder",
  "patient_age": 19,
  "author_role": "psychiatrist",
  "body": "Full LOMN text..."
}
```

## Technical Implementation

### Text Chunking

- Overlapping chunks of ~500 characters
- 50-character overlap for semantic continuity
- Sliding-window method for fine-grained clinical content preservation

### Embedding Pipeline

Using `all-MiniLM-L6-v2` from SentenceTransformers:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunks)
```

- **Dimensions**: 384-dimensional vector space
- **Performance**: CPU-efficient, robust semantic search
- **Privacy**: Runs entirely on local resources

### FAISS Indexing
```python
import faiss

index = faiss.IndexFlatL2(dim)
index.add(embeddings)
```

**Storage Components:**
- `chunks.npy` - Raw chunk text
- `metadata.json` - Category, diagnosis, and payer information
- FAISS index file

### Retrieval-Augmented Generation

**Retrieval Step:**
```python
query_vec = model.encode([query])
D, I = index.search(query_vec, k)
```

**Generation Step:**

- Locally hosted LLaMA 3 via Ollama
- Retrieved evidence incorporated into prompt
- Preserves clinical accuracy and payer context
- Adapts treatment justification patterns

## Transparency Outputs

For each generated LOMN, the system provides:

1. **Full LOMN text** - Complete letter ready for clinical review
2. **Retrieved evidence chunks** - Source material that influenced generation
3. **Metadata** - Document IDs, categories, and relevance scores

This enables clinicians to:
- Inspect reasoning behind recommendations
- Identify influential prior patterns
- Verify category-appropriate retrieval
- Detect potential misalignment

## Example Usage

**Input Request:**
> "Write a LOMN for a 19-year-old with severe MDD needing continued IOP from Aetna."

**Output:**
- Clinically appropriate letter
- Evidence from psychiatric LOMN category
- Metadata showing retrieval sources

## Social Transparency Framework

This RAG pipeline operationalizes key ST-Lens principles:

- **Collective Recourse**: New letters benefit from patterns across many prior cases
- **Transparency**: Evidence and patterns explicitly surfaced
- **Controllability**: Clinicians can validate, critique, or replace evidence
- **Explainability**: Reasoning substrate is visible and inspectable
- **Auditability**: Reproducible outputs grounded in inspectable index

## Future Development

- [ ] Category-filtered retrieval for improved accuracy
- [ ] Integration of insurer policy PDFs into index
- [ ] Clinician-facing Streamlit interface
- [ ] Reasoning explanation module
- [ ] Multi-RAG retrieval (LOMNs + policies + clinical guidelines)

## Installation
```bash
# Clone repository
git clone https://github.com/yourusername/rag-st.git
cd rag-st

# Install dependencies
pip install sentence-transformers faiss-cpu numpy

# Install Ollama and pull LLaMA 3
# Follow instructions at https://ollama.ai
ollama pull llama3
```

## License

I made this whole pipeline from scratch using local and FREE models.

## Citation

If you use this work, please cite:
```bibtex
@misc{jeem2025ragst,
  author = {Jeem, Abid Farhan},
  title = {RAG-ST: Retrieval-Augmented Generation Pipeline for Transparent LOMN Generation},
  year = {2025},
  month = {November}
}
```

## Contact

For questions or collaboration inquiries, please contact ajeem@mail.wlu.edu
