from sentence_transformers import SentenceTransformer
import numpy as np

_model=None

def load_model():
    global _model
    if _model is None:
        _model=SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model

def embed_texts(texts):
    model=load_model()
    embeddings=model.encode(texts, normalize_embeddings=True)
    return np.array(embeddings, dtype="float32")