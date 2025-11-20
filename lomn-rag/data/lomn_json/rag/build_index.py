import os
import json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Path to your JSON files
DATA_DIR = "/Users/jeem/Downloads/lomn-rag/data/lomn_json/LOMN_dataset"
OUTPUT_DIR = "./faiss_index"

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def load_json_files():
    documents = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            file_path = os.path.join(DATA_DIR, filename)
            with open(file_path, "r") as f:
                obj = json.load(f)
                body = obj.get("body", "")
                meta = {
                    "id": obj.get("id", ""),
                    "category": obj.get("category", ""),
                    "diagnosis": obj.get("diagnosis", ""),
                    "payer": obj.get("payer", "")
                }
                documents.append((body, meta))
    return documents

def chunk_text(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
    return chunks

def build_index():
    docs = load_json_files()
    all_chunks = []
    metadata_list = []

    for body, meta in docs:
        chunks = chunk_text(body)
        for ch in chunks:
            all_chunks.append(ch)
            metadata_list.append(meta)

    if not all_chunks:
        print("ERROR: No chunks were found. Check your JSON folder.")
        return

    print(f"Embedding {len(all_chunks)} chunks...")
    embeddings = model.encode(all_chunks, convert_to_numpy=True)

    # Build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Save everything
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    faiss.write_index(index, os.path.join(OUTPUT_DIR, "index.faiss"))
    np.save(os.path.join(OUTPUT_DIR, "chunks.npy"), np.array(all_chunks))
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
        json.dump(metadata_list, f)

    print("FAISS index built successfully!")

if __name__ == "__main__":
    build_index()
