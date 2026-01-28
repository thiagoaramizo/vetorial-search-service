# Vector Search Service (MCP Provider)

Backend API for data registration and semantic search, acting as an MCP (Model Context Protocol) context provider.

## Tech Stack

- **Node.js + TypeScript** (Strict mode)
- **NestJS** (HTTP Framework and Dependency Injection)
- **PostgreSQL + pgvector** (Vector Database)
- **Prisma** (ORM)
- **OpenAI / Gemini / Claude (Voyage AI)** (Interchangeable Embedding Adapters)
- **Helmet + Throttler** (Security headers and Rate Limiting)

## Architecture

The project follows **Clean Architecture** and **Hexagonal Architecture**:

- **Domain**: Framework-agnostic Entities and Interfaces (Ports).
- **Application**: Use Cases containing business rules.
- **Infrastructure**: Concrete implementations (Prisma, AI Adapters).
- **Interface**: HTTP Controllers (REST).

## Configuration

### 1. Installation and Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in the keys.
   ```bash
   cp .env.example .env
   ```

   **Supported Adapters (`EMBEDDING_PROVIDER`):**
   - `openai`: Requires `OPENAI_API_KEY` (Model: `text-embedding-3-small`) (Recommended)
   - `gemini`: Requires `GOOGLE_GENAI_API_KEY` (Model: `text-embedding-004`)
   - `claude`: Requires `ANTHROPIC_API_KEY` and `VOYAGE_API_KEY` (Model: `voyage-large-2`).
  
  **Security Configuration:**
  - `MAX_CONTENT_ITEMS`: Maximum number of items allowed in the `data` array (Default: 100).

### 2. Database with Docker

You can start the PostgreSQL database with pgvector extension using Docker Compose:

```bash
docker compose up -d
```

This will start the database on port `5432`. Default credentials are in `docker-compose.yml`.

### 3. Database Migration

Run the Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

### 4. Execution

To start the application in development mode:

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`.

### 5. Swagger Documentation

Interactive API documentation (Swagger UI) is available at:

**`http://localhost:3000/api`**

## API Endpoints

### 1. Register Data (Upsert)

**POST** `/data/register`

Registers data for a project and content ID. Replaces existing data (idempotent).

**Payload:**
```json
{
  "projectId": "project-alpha",
  "contentId": "doc-123",
  "data": [
    "MCP allows connecting AIs to external data.",
    "Vector search uses embeddings for similarity."
  ]
}
```

**Response (201):**
```json
{
  "message": "Data registered successfully"
}
```

### 2. Search Data

**POST** `/data/search`

Semantic search on registered data.

**Payload:**
```json
{
  "search": "how does vector search work?",
  "projectId": "project-alpha",
  "limit": 3
}
```

**Response (200):**
```json
{
  "results": [
    {
      "projectId": "project-alpha",
      "contentId": "doc-123",
      "data": [
        "Vector search uses embeddings for similarity."
      ]
    }
  ]
}
```

### 3. List Data (Grouped)

**GET** `/data`

Lists stored data, grouped by project and content, returning item counts. Supports pagination.

**Query Params:**
- `projectId` (optional): Filter by project.
- `contentId` (optional): Filter by content ID.
- `page` (default: 1): Page number.
- `limit` (default: 10): Items per page.

**Response (200):**
```json
{
  "results": [
    {
      "projectId": "project-alpha",
      "contents": [
        {
          "contentId": "doc-123",
          "items": 2
        }
      ]
    }
  ],
  "page": 1,
  "limit": 10
}
```

### 4. Remove Data

**DELETE** `/data`

Removes data filtering by project or content ID. At least one filter is required.

**Query Params:**
- `projectId`: Project ID.
- `contentId`: Content ID.

**Response (200):**
```json
{
  "message": "Data removed successfully"
}
```

## Security Features

- **Input Validation**: Strict DTO validation with `class-validator` (whitelist enabled).
- **Rate Limiting**: Global rate limiting (100 requests/minute) using `@nestjs/throttler`.
- **HTTP Headers**: Secure HTTP headers via `helmet`.
- **CORS**: Enabled with default settings.
- **SQL Injection Protection**: Uses Prisma's parameterized queries and raw SQL template literals for vector operations.
- **Payload Limits**: Configurable limit for input array size (`MAX_CONTENT_ITEMS`).


## Tests

### E2E Tests
```bash
npm run test:e2e
```

### Unit Tests
```bash
npm run test
```

## Folder Structure

```
src/
├── application/       # Business Rules (Use Cases)
├── domain/            # Entities and Interfaces
├── infrastructure/    # Implementations (DB, Adapters)
├── interface/         # Controllers and DTOs
└── main.ts            # Entrypoint
```
