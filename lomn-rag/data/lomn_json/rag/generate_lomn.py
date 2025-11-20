import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from ollama import Client

# -------- CONFIG --------
INDEX_DIR = "./faiss_index"
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
LLM_MODEL = "llama3"   # local model running on Ollama
# ------------------------


def load_index():
    index_path = os.path.join(INDEX_DIR, "index.faiss")
    chunks_path = os.path.join(INDEX_DIR, "chunks.npy")
    meta_path = os.path.join(INDEX_DIR, "metadata.json")

    if not (os.path.exists(index_path) and os.path.exists(chunks_path) and os.path.exists(meta_path)):
        raise FileNotFoundError("FAISS index or files missing. Run build_index.py first.")

    index = faiss.read_index(index_path)
    chunks = np.load(chunks_path, allow_pickle=True)
    with open(meta_path, "r") as f:
        metadata = json.load(f)

    return index, chunks, metadata


# Load retrieval
embed_model = SentenceTransformer(EMBED_MODEL_NAME)
faiss_index, faiss_chunks, faiss_metadata = load_index()

# Local LLM client
client = Client()


def retrieve(query: str, k: int = 4):
    query_vec = embed_model.encode([query], convert_to_numpy=True)
    D, I = faiss_index.search(query_vec, k)
    results = []
    for idx in I[0]:
        results.append(
            {
                "text": str(faiss_chunks[idx]),
                "metadata": faiss_metadata[idx]
            }
        )
    return results


def build_prompt(request: str, retrieved_chunks):
    evidence = []
    for i, item in enumerate(retrieved_chunks, start=1):
        m = item["metadata"]
        label = f"[E{i}] category={m.get('category','')}, diagnosis={m.get('diagnosis','')}, payer={m.get('payer','')}"
        evidence.append(f"{label}\n{item['text']}\n")

    evidence_text = "\n\n".join(evidence)

    prompt = f"""
You are a clinical-writing assistant specializing in Letters of Medical Necessity (LOMNs).
Write clear, insurer-facing, evidence-grounded letters using the following rules:

- Use clinical specificity and appropriate justification.
- Incorporate patterns and reasoning from the retrieved evidence, but DO NOT copy text.
- Address payer requirements, diagnosis, treatment history, level of care, and consequences of denial.
- Maintain a professional and formal tone.

REQUEST:
{request}

EVIDENCE FOR CONTEXT (do not cite explicitly):
{evidence_text}

Now write the LOMN in full.
    """

    return prompt


def generate_lomn(request: str, k: int = 4) -> str:
    retrieved = retrieve(request, k=k)
    prompt = build_prompt(request, retrieved)

    response = client.generate(
        model=LLM_MODEL,
        prompt=prompt,
        stream=False
    )

    return response["response"], retrieved


if __name__ == "__main__":
    print("LOMN Generator (Local — LLaMA 3 + RAG)")
    print("--------------------------------------")
    print("Example request:")
    print("  'Write a LOMN for a 19-year-old with severe MDD needing continued IOP from Aetna.'")

    while True:
        req = input("\nEnter your LOMN request (or 'q' to quit): ")
        if req.strip() in {"q", "quit", "exit"}:
            break

        lomn_text, evidence = generate_lomn(req)

        print("\n========== GENERATED LOMN ==========\n")
        print(lomn_text)

        print("\n========== EVIDENCE USED ===========\n")
        for i, ev in enumerate(evidence, start=1):
            print(f"[E{i}] {ev['metadata']}")
            print(ev["text"][:300] + "...\n")
