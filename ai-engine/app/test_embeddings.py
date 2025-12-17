from embeddings import EmbeddingModel
embedder=EmbeddingModel()
v1=embedder.embed("i feel calm today")
v2=embedder.embed("today i feel peaceful")
print(v1.shape)
print((v1 @ v2.T)[0][0])