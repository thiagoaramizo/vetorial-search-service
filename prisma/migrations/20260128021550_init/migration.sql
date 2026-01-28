-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "project_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
