# Sessão 3 — Conexão Backend ↔ Banco de Dados

## Requisitos

> **Base:** `docs/sprint/1/sessoes-sprint.md` — Sessão 3 (Tarefa 1.3)
> **Dependências:** Sessão 1 (projeto inicializado) e Sessão 2 (ArangoDB rodando no GCP)
> **Driver:** `arangojs` — driver oficial do ArangoDB para JavaScript/TypeScript

---

## 1. Requisitos Funcionais

### RF1 — Singleton de Conexão (`server/utils/arango.ts`)

- [ ] Implementar módulo `server/utils/arango.ts` que exporta:
  - Função `getDatabase()` — retorna instância singleton de `Database` do `arangojs`
  - Função `getConnectionStatus()` — verifica se a conexão está ativa
  - Função `disconnect()` — encerra a conexão (para testes e cleanup)
- [ ] Pool de conexão com `maxRetries` (3 tentativas) e exponential backoff
- [ ] Timeout configurável via variável de ambiente (`ARANGO_TIMEOUT`, default 30s)
- [ ] Conexão lazy-initialized (não conectar na importação do módulo, apenas na primeira chamada)
- [ ] Tratamento de erros: capturar falhas de conexão e propagar com mensagem clara

### RF2 — Variáveis de Ambiente

- [ ] Configurar `.env` na raiz do projeto com as credenciais de conexão:
  - `ARANGO_URL=http://<IP_DA_VM>:8529` — URL base do ArangoDB
  - `ARANGO_USER=app_user` — usuário da aplicação
  - `ARANGO_PASS=<senha>` — senha do usuário
  - `DB_NAME=knowledgebase` — nome do banco
  - `ARANGO_TIMEOUT=30000` — timeout em ms (opcional, default 30000)
- [ ] Configurar `.env.example` com valores genéricos (já criado na Sessão 1)

### RF3 — Rota `GET /api/health`

- [ ] Criar `server/api/health.ts` que:
  - Executa query simples no ArangoDB (ex: `RETURN 1`)
  - Mede latência da consulta
  - Retorna JSON:
    ```json
    {
      "status": "ok",
      "db": "knowledgebase",
      "latency": "12ms",
      "timestamp": "2026-05-09T12:00:00.000Z"
    }
    ```
- [ ] Em caso de falha de conexão, retornar:
  ```json
  {
    "status": "error",
    "error": "Database connection failed",
    "details": "Timeout connecting to http://<host>:8529",
    "timestamp": "2026-05-09T12:00:00.000Z"
  }
  ```
- [ ] Rota não deve exigir autenticação (health check público)

### RF4 — Script de Migração Inicial

- [ ] Criar `server/utils/migrate.ts` que cria:
  - **Coleções de documentos:**
    - `users` — chave primária `_key` como username
    - `articles` — chave primária `_key` como slug
    - `article_versions` — chave primária UUID
    - `comments` — chave primária UUID
    - `notifications` — chave primária UUID
  - **Coleções de arestas (edges):**
    - `authored` — liga `users` → `articles`
    - `article_links` — liga `articles` → `articles` (wikilinks)
    - `follows` — liga `users` → `users`
    - `comment_on` — liga `comments` → `articles`
    - `upvoted` — liga `users` → `articles` ou `comments`
  - **Índices:**
    - `users`: índice único em `email`
    - `articles`: índice em `status`, índice composto `authorId + createdAt`
    - `comments`: índice em `articleId`, índice composto `parentId + createdAt`
    - `notifications`: índice em `userId + read + createdAt`
- [ ] Script deve ser idempotente: usar `IF NOT EXISTS` ou verificar antes de criar
- [ ] Script deve poder ser executado via `npx tsx server/utils/migrate.ts`
- [ ] Adicionar script no `package.json`: `"migrate": "tsx server/utils/migrate.ts"`

### RF5 — Docker Compose Local para Desenvolvimento

- [ ] Criar `docker-compose.dev.yml` na raiz do projeto:
  - Serviço `arangodb` com imagem `arangodb:3.11`
  - Porta mapeada: `8529:8529`
  - Variáveis de ambiente: `ARANGO_ROOT_PASSWORD`
  - Volume nomeado `arango_dev_data` para persistência
  - Health check: `curl http://localhost:8529/_api/version`
- [ ] Adicionar script no `package.json`: `"db:up": "docker compose -f docker-compose.dev.yml up -d"`

### RF6 — Conectividade Dual

- [ ] Testar conexão contra ArangoDB local (Docker desktop)
- [ ] Testar conexão contra ArangoDB remoto (GCP)
- [ ] Alternar entre ambientes via valor de `ARANGO_URL` no `.env`

---

## 2. Requisitos Não Funcionais

| ID | Requisito |
|----|-----------|
| RNF1 | Conexão deve ser lazy-initialized (não bloquear startup do servidor) |
| RNF2 | Timeout configurável via `ARANGO_TIMEOUT` (default 30s) |
| RNF3 | Falha de conexão não deve derrubar o servidor (graceful degradation) |
| RNF4 | `ARANGO_URL` deve suportar `http://localhost:8529` (local) e `http://<IP>:8529` (remoto) |
| RNF5 | Singleton de conexão deve ser thread-safe (Nitro roda em múltiplas workers) |
| RNF6 | Migração deve ser executável independente do servidor (script standalone) |

---

## 3. Critérios de Aceitação da Sessão

- `GET /api/health` retorna 200 com `status: "ok"`, nome do banco e latência
- `GET /api/health` retorna 503 com mensagem de erro se banco estiver inacessível
- Script de migração cria todas as 10 coleções/arestas + índices sem erro (idempotente)
- Conexão funciona localmente (Docker) e remotamente (GCP)
- `npm run migrate` executa migração standalone sem o servidor rodando

---

## 4. Dependências

| Tarefa | Depende de | Notas |
|--------|-----------|-------|
| RF1 (arango.ts) | Nenhuma | Pode ser implementada primeiro |
| RF2 (.env) | Nenhuma | Pode ser feito em paralelo com RF1 |
| RF3 (health route) | RF1, RF2 | Precisa da conexão funcionando |
| RF4 (migração) | RF1, RF2 | Precisa da conexão funcionando |
| RF5 (Docker local) | Nenhuma | Pode ser feito em paralelo |
| RF6 (testes) | RF3, RF4, RF5 | Dependente de todas as anteriores |

---

## 5. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Driver `arangojs` incompatível com ESM/Nitro | Bloqueante | Verificar compatibilidade, usar `arangojs@8.x` |
| Timeout de conexão com GCP (firewall) | Alto | Verificar UFW + GCP VPC Firewall, testar com `curl` antes |
| Porta 8529 bloqueada na VM GCP | Alto | Confirmar regra `allow-arangodb` no GCP VPC Firewall |
| TLS mismatch (HTTP vs HTTPS) | Médio | Usar HTTP enquanto Caddy não estiver configurado |
| Permissão do `app_user` no banco | Médio | Verificar se `app_user` tem permissão RW no `knowledgebase` |

---

## 6. Princípios a Praticar

| Princípio | Aplicação |
|-----------|-----------|
| **SRP (SOLID)** | `arango.ts` cuida apenas da conexão; `migrate.ts` cuida apenas da migração; `health.ts` cuida apenas do health check |
| **DIP (SOLID)** | Abstrair o driver `arangojs` atrás de funções (`getDatabase`, `getConnectionStatus`) — o resto do código não depende do driver diretamente |
| **Tratamento Explícito de Erros** | Capturar e propagar erros de conexão com mensagens claras, nunca `throw` genérico |
| **KISS** | Singleton simples, sem DI container ou abstrações desnecessárias |
| **DRY** | Função de conexão centralizada, não repetir `new Database()` em cada rota |

---

## 7. Estrutura de Arquivos Esperada

```
server/
├── api/
│   └── health.ts              ← Rota de health check (RF3)
├── utils/
│   ├── arango.ts              ← Singleton de conexão (RF1)
│   └── migrate.ts             ← Script de migração (RF4)
docker-compose.dev.yml         ← Docker Compose local (RF5)
.env                           ← Configuração local (RF2)
package.json                   ← Script migrate + db:up (RF4, RF5)
```

---

*Documento gerado em: 9 de Maio de 2026*
*Versão: 1.0*
