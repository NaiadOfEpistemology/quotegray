import faiss
import numpy as np
import pickle
import os
DIM=384
BASE_DIR=os.path.dirname(__file__)
INDEX_PATH=os.path.join(BASE_DIR, "index.faiss")
META_PATH=os.path.join(BASE_DIR, "meta.pkl")
class VectorStore:
    def __init__(self):
        self.index=faiss.IndexFlatIP(DIM)
        self.metadata=[]
        if os.path.exists(INDEX_PATH):
            self.index=faiss.read_index(INDEX_PATH)
            with open(META_PATH, "rb") as f:
                self.metadata=pickle.load(f)
    def add(self, embeddings,meta):
        embeddings=embeddings.astype("float32")
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        self.metadata.extend(meta)
        self._persist()
    def search(self, query_embedding, k=5):
        query_embedding=query_embedding.astype("float32")
        faiss.normalize_L2(query_embedding)
        scores, ids=self.index.search(query_embedding, k)
        seen=set()
        results=[]
        for idx in ids[0]:
            if idx not in seen and idx<len(self.metadata):
                seen.add(idx)
                results.append(self.metadata[idx])
        return results
    def _persist(self):
        faiss.write_index(self.index, INDEX_PATH)
        with open(META_PATH, "wb") as f:
            pickle.dump(self.metadata, f)
