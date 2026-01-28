# Vetorial Search Service (MCP Provider)

API Backend para registro e busca semântica de dados, atuando como um provedor de contexto MCP (Model Context Protocol).

## Stack Tecnológica

- **Node.js + TypeScript** (Strict mode)
- **NestJS** (Framework HTTP e Injeção de Dependência)
- **PostgreSQL + pgvector** (Banco de dados vetorial)
- **Prisma** (ORM)
- **OpenAI / Gemini / Claude (Voyage AI)** (Adapters de Embeddings Intercambiáveis)

## Arquitetura

O projeto segue **Clean Architecture** e **Hexagonal Architecture**:

- **Domain**: Entidades e Interfaces (Ports) agnósticas a framework.
- **Application**: Casos de uso (Use Cases) contendo as regras de negócio.
- **Infrastructure**: Implementações concretas (Prisma, Adapters de IA).
- **Interface**: Controladores HTTP (REST).

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:
   Copie `.env.example` para `.env` e preencha as chaves.
   ```bash
   cp .env.example .env
   ```

   **Adapters Suportados (`EMBEDDING_PROVIDER`):**
   - `openai`: Requer `OPENAI_API_KEY` (Modelo: `text-embedding-3-small`)
   - `gemini`: Requer `GOOGLE_GENAI_API_KEY` (Modelo: `text-embedding-004`)
   - `claude`: Requer `ANTHROPIC_API_KEY` (Modelo: `voyage-2`). *Nota: A Anthropic recomenda Voyage AI para embeddings.*

3. Banco de Dados:
   Certifique-se de ter um PostgreSQL com a extensão `vector` habilitada.
   Execute o script SQL em `migration.sql` ou use as migrations do Prisma (configuração necessária no `prisma/schema.prisma` se desejar automatizar).

   ```bash
   # Exemplo manual no psql
   psql -d vectordb -f migration.sql
   ```

4. Inicie a aplicação:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### 1. Registrar Dados (Upsert)

**POST** `/data/register`

Registra dados para um projeto e ID de conteúdo. Substitui dados existentes (idempotente).

**Payload:**
```json
{
  "projectId": "projeto-alpha",
  "contentId": "doc-123",
  "data": [
    "O MCP permite conectar IAs a dados externos.",
    "Busca vetorial usa embeddings para similaridade."
  ]
}
```

### 2. Buscar Dados

**POST** `/data/search`

Busca semântica nos dados registrados.

**Payload:**
```json
{
  "search": "como funciona busca vetorial?",
  "projectId": "projeto-alpha",
  "limit": 3
}
```

**Response:**
```json
{
  "result": [
    {
      "projectId": "projeto-alpha",
      "contentId": "doc-123",
      "data": [
        "Busca vetorial usa embeddings para similaridade."
      ]
    }
  ]
}
```

## Estrutura de Pastas

```
src/
├── application/       # Regras de Negócio (Use Cases)
├── domain/            # Entidades e Interfaces
├── infrastructure/    # Implementações (DB, Adapters)
├── interface/         # Controllers e DTOs
└── main.ts            # Entrypoint
```
