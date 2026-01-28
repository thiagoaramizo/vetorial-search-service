-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536) -- Adjust dimension based on model (OpenAI: 1536, Gemini: 768, Voyage: 1024)
);

-- Create index for faster search (IVFFlat or HNSW)
-- Note: IVFFlat requires some data to be effective, HNSW is better generally but more expensive
CREATE INDEX IF NOT EXISTS embedding_index ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
