Você é um engenheiro de software sênior especializado em arquitetura de APIs, LLMs, busca vetorial e sistemas MCP (Model Context Protocol).
Crie uma API backend que funcionará como um MCP (context provider) responsável por registrar, indexar e recuperar dados textuais utilizando tokenização + embeddings vetoriais, com suporte a OpenAI, Gemini e Claude por meio de adapters intercambiáveis.

Stack obrigatória
Linguagem: Node.js + TypeScript (strict)
Framework HTTP: NestJS
Banco de dados: PostgreSQL
Extensão: pgvector
ORM / Query Builder: Prisma
Arquitetura: Clean Architecture / Hexagonal
Padrões:
Adapter
Strategy
Dependency Injection
Formato da API: REST (JSON)
Pronta para MCP (sem estado, determinística, desacoplada)

Funcionalidades obrigatórias
1 - Registro de dados (upsert semântico)
Endpoint
POST /data/register
Payload
{
  projectId: string;
  contentId: string;
  data: string[];
}

Regras de negócio
Cada item de data[] deve ser:
Normalizado
Tokenizado
Transformado em embedding vetorial
Se já existir um registro com o mesmo projectId e contentId:
Todos os dados anteriores devem ser substituídos
Os embeddings antigos devem ser removidos
Os embeddings devem ser persistidos individualmente
Associar cada embedding a:
projectId
contentId
texto original
A operação deve ser idempotente

2- Recuperação de dados (busca semântica)
Endpoint
POST /data/search
Payload
{
  search: string;
  projectId?: string;
  contentId?: string;
  limit?: number; // default = 5
}

Comportamento da busca
Converter search em embedding
Executar similaridade vetorial (cosine distance)
Ordenar resultados por relevância
Aplicar filtros:
Se projectId for informado → buscar em todos os contentId do projeto
Se contentId for informado → buscar apenas nele
Retornar apenas os trechos relevantes
Response
{
  result: {
    projectId: string;
    contentId: string;
    data: string[];
  }[];
}

data[] deve conter somente os textos semanticamente relevantes
Agrupar resultados por projectId + contentId

Adapters de LLM (obrigatório)
Crie um contrato comum para geração de embeddings:
interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

Implementações obrigatórias
OpenAIEmbeddingAdapter
GeminiEmbeddingAdapter
ClaudeEmbeddingAdapter
Requisitos:
Totalmente intercambiáveis
Selecionados por configuração (ENV)
Sem dependência direta do core da aplicação

Camadas da arquitetura
Domain
Entidades
Value Objects
Interfaces (ports)
Application
Use cases:
RegisterDataUseCase
SearchDataUseCase
Infrastructure
PostgreSQL + pgvector
Implementações dos adapters de embeddings
Repositórios
Interface (API)
Controllers
DTOs
Validações

Modelo de dados (exemplo)
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536)
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);


Requisitos não funcionais
Código 100% tipado
Pronto para escala horizontal
Stateless
Sem dependência direta de um único provedor de IA
Fácil de plugar em um agente MCP
Logs estruturados
Tratamento explícito de erros

Entregáveis esperados do agente
Estrutura de pastas completa
Código funcional
Migrations SQL
Exemplo de .env
README com instruções de uso
Exemplos de requisição (curl ou httpie)

Importante
Não simplifique a arquitetura
Não acople regras de negócio ao framework
Pense como se essa API fosse usada por vários agentes de IA simultaneamente
Priorize clareza, extensibilidade e isolamento de dependências externas