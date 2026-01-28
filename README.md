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

### 1. Instalação e Ambiente

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
   - `claude`: Requer `VOYAGE_API_KEY` (Modelo: `voyage-large-2`).

### 2. Banco de Dados com Docker

Você pode subir o banco de dados PostgreSQL com a extensão pgvector usando Docker Compose:

```bash
docker-compose up -d
```

Isso iniciará o banco na porta `5432`. As credenciais padrão estão no `docker-compose.yml`.

### 3. Execução

Para iniciar a aplicação em modo de desenvolvimento:

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 4. Documentação Swagger

A documentação interativa da API (Swagger UI) está disponível em:

**`http://localhost:3000/api`**

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

**Response (201):**
```json
{
  "message": "Data registered successfully"
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

**Response (200):**
```json
{
  "results": [
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

### 3. Listar Dados (Agrupado)

**GET** `/data`

Lista os dados armazenados, agrupados por projeto e conteúdo, retornando a contagem de itens. Suporta paginação.

**Query Params:**
- `projectId` (opcional): Filtrar por projeto.
- `contentId` (opcional): Filtrar por ID de conteúdo.
- `page` (padrão: 1): Número da página.
- `limit` (padrão: 10): Itens por página.

**Response (200):**
```json
{
  "results": [
    {
      "projectId": "projeto-alpha",
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

### 4. Remover Dados

**DELETE** `/data`

Remove dados filtrando por projeto ou ID de conteúdo. Pelo menos um filtro é obrigatório.

**Query Params:**
- `projectId`: ID do projeto.
- `contentId`: ID do conteúdo.

**Response (200):**
```json
{
  "message": "Data removed successfully"
}
```

## Testes

### Testes E2E
```bash
npm run test:e2e
```

### Testes Unitários
```bash
npm run test
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
