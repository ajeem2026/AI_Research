import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

INDEX_DIR = "./faiss_index"

# Load model + index
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index(os.path.join(INDEX_DIR, "index.faiss"))
chunks = np.load(os.path.join(INDEX_DIR, "chunks.npy"), allow_pickle=True)
metadata = json.load(open(os.path.join(INDEX_DIR, "metadata.json")))

def retrieve(query, k=4):
    query_vec = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_vec, k)
    results = []
    for idx in I[0]:
        results.append({
            "text": chunks[idx],
            "metadata": metadata[idx]
        })
    return results

if __name__ == "__main__":
    while True:
        query = input("\nEnter your query: ")
        results = retrieve(query)

        print("\n=== Top Results ===")
        for r in results:
            print("\n---")
            print("Chunk:", r["text"][:300], "...")
            print("Metadata:", r["metadata"])
