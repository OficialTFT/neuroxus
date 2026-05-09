# Plano de Sprints — Plataforma de Conhecimento Colaborativo

> **Documento gerado a partir do planejamento (`docs/planejamento/planejamento.md`)**
> **Base conceitual: `.agents/TO-LEARN.md`** — princípios de engenharia de software,
> metodologias ágeis, qualidade de código e práticas essenciais.

---

## Visão Geral do Ciclo de Desenvolvimento

| Sprint       | Duração  | Fase                 | Tema                       | Entregável Principal                                                               |
| ------------ | -------- | -------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| **Sprint 1** | Semana 1 | Fundação             | Setup & Infraestrutura     | Repositório configurado, VM Oracle provisionada, ArangoDB operacional, CI/CD ativo |
| **Sprint 2** | Semana 2 | Fundação             | Conteúdo: CRUD & Editor    | Editor TipTap funcional, criação/edição/visualização de artigos com links internos |
| **Sprint 3** | Semana 3 | Conhecimento em Rede | Grafo & Busca              | Grafo de conhecimento com Cytoscape.js, busca full-text via ArangoSearch           |
| **Sprint 4** | Semana 4 | Conhecimento em Rede | Versionamento & Perfis     | Histórico de versões com restauração, páginas de perfil de autor                   |
| **Sprint 5** | Semana 5 | Social               | Autenticação & Rede Social | Registro/login com sessões seguras, sistema de seguidores                          |
| **Sprint 6** | Semana 6 | Social               | Interações & Notificações  | Comentários, upvotes e feed de notificações                                        |
| **Sprint 7** | Semana 7 | Polimento            | Galáxia Pessoal & Visual   | Subgrafo pessoal no perfil, temas, responsividade, animações                       |
| **Sprint 8** | Semana 8 | Polimento            | Performance & Lançamento   | Otimização, testes end-to-end, exportação, deploy de produção                      |

---

## Princípios Transversais (aplicados em todas as sprints)

Estes princípios, fundamentados no **TO-LEARN.md**, são inegociáveis e guiam cada decisão
de implementação:

### P1. Conventional Commits & SemVer

Todo commit segue o padrão **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`,
`test:`, `chore:`). O `CHANGELOG.md` é atualizado a cada release. Versões seguem
**MAJOR.MINOR.PATCH** (TO-LEARN.md §4.1).

### P2. Testes desde o Início

Nenhuma feature é considerada concluída sem testes. Prioridade: **unitários → integração →
E2E** (pirâmide de testes, TO-LEARN.md §4.3). Frameworks: Vitest (unitários/integração),
Playwright (E2E).

### P3. SOLID no Backend, Componentes no Frontend

- **SRP**: Cada rota Nitro tem uma responsabilidade; cada componente Vue faz uma coisa.
- **OCP**: Plugins/extensões do TipTap, layouts intercambiáveis do Cytoscape.
- **DIP**: Server routes dependem de abstrações, não da implementação concreta do ArangoDB.
  (TO-LEARN.md §3.1)

### P4. KISS & YAGNI

Começar com a implementação mais simples que resolve o problema. Não antecipar features
futuras. Sem WebSockets para comentários em tempo real (definido como estático no MVP).
(TO-LEARN.md §3.3, §3.4)

### P5. Documentação por Sessão

Cada sprint produz:

- `docs/sessao[N]/requisitos.md` — especificação detalhada antes da implementação
- `docs/sessao[N]/sessao[N]-[título].md` — consolidação pós-implementação
  (AGENTS.md §4.2)

### P6. Tratamento Explícito de Erros

Nunca ignorar erros. Validar inputs em todas as funções públicas. Usar early returns.
Nunca usar `any` sem justificativa documentada. (AGENTS.md §7.1)

---

## Sprint 1 — Setup & Infraestrutura

**Duração:** 1 semana
**Fase:** Fundação
**Objetivo:** Projeto inicializado, ambiente de desenvolvimento configurado,
infraestrutura de produção provisionada.

### Objetivos de Aprendizado

| Princípio         | O que será praticado                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Versionamento** | Conventional Commits, estrutura inicial do CHANGELOG.md                                   |
| **DevOps**        | Containerização com Docker Compose, provisionamento de VM, CI/CD com Vercel               |
| **Segurança**     | Configuração de firewall, proxy reverso com TLS automático (Caddy), variáveis de ambiente |
| **IaC**           | Docker Compose como infraestrutura como código reprodutível                               |

### Tarefas

#### 1.1 Criação do Repositório e Estrutura Base

- **Criar repositório no GitHub** com `README.md`, `.gitignore` (Node/ArangoDB/Vercel), `LICENSE`
- **Inicializar projeto Nuxt 3** com `npx nuxi init`
- **Estrutura de pastas** conforme `planejamento.md §3.2`
- **Configurar ESLint + Prettier** (regras padronizadas)
- **Criar `.env.example`** com todas as variáveis documentadas
- **Primeiro commit:** `chore: init project structure`

**Critérios de aceitação:**

- `npm run dev` inicia o servidor local sem erros
- ESLint e Prettier configurados e funcionando
- Estrutura de pastas espelha o planejamento

#### 1.2 Provisionamento da VM Oracle Cloud

- **Criar conta Oracle Cloud** e provisionar VM ARM (4 OCPUs / 24 GB RAM)
- **Instalar Docker e Docker Compose** na VM
- **Subir container ArangoDB 3.11** via `docker-compose.yml`
- **Instalar e configurar Caddy** como proxy reverso com TLS automático
- **Configurar firewall** (Oracle Security Lists + UFW)
- **Criar banco `knowledgebase` e usuário `app_user`** no ArangoDB

**Critérios de aceitação:**

- ArangoDB acessível via `https://arango.<domínio>.com` com HTTPS válido
- `arangosh` conecta e executa queries AQL
- Backup script funcional (testar restore)

#### 1.3 Conexão Nuxt ↔ ArangoDB

- **Implementar `server/utils/arango.ts`** — singleton de conexão
- **Configurar variáveis de ambiente** (`ARANGO_URL`, `ARANGO_USER`, `ARANGO_PASS`, `DB_NAME`)
- **Teste de conectividade:** rota `GET /api/health` que pinga o ArangoDB
- **Criar coleções e índices iniciais** via script de migração

**Critérios de aceitação:**

- `GET /api/health` retorna 200 com status do banco
- Conexão funciona tanto local (Docker) quanto remota (Oracle Cloud)

#### 1.4 Deploy na Vercel

- **Conectar repositório GitHub à Vercel**
- **Configurar variáveis de ambiente** no dashboard da Vercel
- **Verificar deploy automático** (push na main → build → deploy)
- **Configurar domínio personalizado** (se disponível)
- **Testar preview por PR** (branch deployment)

**Critérios de aceitação:**

- Push na `main` dispara deploy automático
- `/api/health` responde corretamente no ambiente de produção
- Preview deploy funciona em branches de PR

### Entregáveis da Sprint

- [x] Repositório GitHub com estrutura Nuxt 3 funcional
- [x] ArangoDB operacional na Oracle Cloud com TLS
- [x] Conexão backend ↔ banco de dados estabelecida
- [x] CI/CD funcional (Vercel + GitHub)
- [x] `docs/sessao1/requisitos.md` e `docs/sessao1/sessao1-setup-infra.md`

### Riscos

| Risco                         | Mitigação                                         |
| ----------------------------- | ------------------------------------------------- |
| Oracle Cloud recusar cadastro | Plano B: usar MongoDB Atlas free tier ou Supabase |
| DNS não propagado a tempo     | Usar IP direto da VM temporariamente              |
| Cold start nas funções Vercel | Configurar health check externo (cron job)        |

---

## Sprint 2 — Conteúdo: CRUD & Editor

**Duração:** 1 semana
**Fase:** Fundação
**Objetivo:** Editor Markdown funcional com preview, criação/edição/visualização
de artigos e sistema de links internos (`[[wikilink]]`).

### Objetivos de Aprendizado

| Princípio       | O que será praticado                                                     |
| --------------- | ------------------------------------------------------------------------ |
| **SRP (SOLID)** | Separação clara entre API routes, parsing de Markdown, e componentes Vue |
| **Clean Code**  | Funções pequenas, nomes significativos, tratamento explícito de erros    |
| **TDD**         | Escrever testes unitários ANTES da implementação do parser de wikilinks  |
| **DRY**         | Extrair lógica de parsing para composable reutilizável                   |

### Tarefas

#### 2.1 API de Artigos — CRUD

- **Rota `POST /api/articles`** — criar artigo (status `draft`)
  - Validar: título obrigatório (3-200 caracteres), conteúdo obrigatório, tags opcionais
  - Gerar slug automaticamente a partir do título
  - Salvar documento em `articles` e aresta `authored`
- **Rota `GET /api/articles/[id]`** — buscar artigo por ID ou slug
- **Rota `PUT /api/articles/[id]`** — atualizar artigo (apenas autor)
- **Rota `DELETE /api/articles/[id]`** — soft-delete (status `archived`)
- **Rota `GET /api/articles`** — listar artigos publicados (paginação, filtro por tags)

**Critérios de aceitação:**

- Testes de integração verificam CRUD completo contra ArangoDB real (Docker)
- Validação rejeita inputs inválidos com 422
- Aresta `authored` criada automaticamente na criação

#### 2.2 Integração do Editor TipTap

- **Instalar e configurar TipTap** com extensões essenciais:
  - Bold, Italic, Headings (H1-H6), Lists (ordered/unordered), Code blocks, Blockquote
  - Extensão customizada para `[[wikilink]]` (highlight + autocomplete)
- **Split-screen layout:** editor à esquerda, preview à direita
- **Preview em tempo real** renderizando Markdown → HTML
- **Salvamento automático de rascunho** (localStorage + debounce 2s)
- **Componente `<ArticleEditor>`** reutilizável

**Critérios de aceitação:**

- Editor renderiza e salva conteúdo Markdown
- Preview reflete mudanças em tempo real (< 500ms)
- Links internos digitados como `[[` disparam autocomplete
- Rascunho sobrevive a refresh da página

#### 2.3 Parser de Wikilinks e Criação de Arestas

- **Implementar parser `[[wikilink]]`** — regex para extrair links do conteúdo Markdown
  - Encontrar artigo alvo por slug (exato) ou título (fuzzy)
  - Criar aresta `article_links` (type: `reference`)
  - Atualizar arestas no save (remover links removidos, adicionar novos)
- **Testes unitários** para todas as variações de wikilink:
  - `[[artigo]]`, `[[artigo|texto customizado]]`, múltiplos links no mesmo parágrafo

**Critérios de aceitação:**

- Ao salvar artigo com `[[introducao-algoritmos]]`, aresta é criada
- Ao remover o wikilink do conteúdo, aresta é removida
- Links para artigos inexistentes não quebram (placeholder)

#### 2.4 Página de Visualização de Artigo

- **Página `pages/article/[...slug].vue`** — renderização SSR/SSG
- **Renderizar Markdown → HTML** com syntax highlighting (Prism.js ou Shiki)
- **Wikilinks renderizados como `<a>`** apontando para `/article/[slug]`
- **Metadados SEO:** title, description, og:image
- **Indicador de status** (draft vs published)

**Critérios de aceitação:**

- Artigo renderiza corretamente com todos os elementos Markdown
- Links internos são clicáveis e navegam corretamente
- SEO meta tags presentes no HTML fonte (SSR)

### Entregáveis da Sprint

- [x] API CRUD de artigos com validação e testes
- [x] Editor TipTap com preview e salvamento automático
- [x] Sistema de wikilinks com criação automática de arestas no grafo
- [x] Página de visualização SSR/SSG
- [x] `docs/sessao2/requisitos.md` e `docs/sessao2/sessao2-conteudo-crud.md`

### Riscos

| Risco                                    | Mitigação                                        |
| ---------------------------------------- | ------------------------------------------------ |
| Complexidade do parser de wikilinks      | Começar com regex simples, iterar com edge cases |
| Performance do preview em artigos longos | Debounce no render, virtualização se necessário  |
| TipTap API mudar (versão beta)           | Fixar versão exata no `package.json`             |

---

## Sprint 3 — Grafo & Busca

**Duração:** 1 semana
**Fase:** Conhecimento em Rede
**Objetivo:** Visualização interativa do grafo de conhecimento na página inicial
e motor de busca full-text com ArangoSearch.

### Objetivos de Aprendizado

| Princípio                    | O que será praticado                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| **Estruturas de Dados**      | Grafos como estrutura de dados, algoritmos de traversal (BFS/DFS via AQL) |
| **Full-Text Search**         | Indexação invertida, analyzers, BM25 scoring (TO-LEARN.md §10)            |
| **Performance**              | LOD (Level of Detail) no grafo, carregamento sob demanda                  |
| **Composição sobre Herança** | Componentes Vue compostos (GraphContainer + GraphControls + GraphLegend)  |

### Tarefas

#### 3.1 API do Grafo de Conhecimento

- **Rota `GET /api/graph`** — retorna nós e arestas para visualização
  - Parâmetros: `?center=[articleId]`, `?depth=2`, `?limit=100`
  - Query AQL: traversal 1..3 partindo do artigo central
  - Filtrar apenas artigos publicados
  - Response: `{ nodes: [...], edges: [...] }`
- **Rota `GET /api/graph/stats`** — estatísticas do grafo
  - Total de nós (artigos publicados), total de arestas, densidade
  - Artigos mais conectados (top 10 por grau)

**Critérios de aceitação:**

- Response formato compatível com Cytoscape.js
- Performance < 500ms para grafo com até 1000 nós
- Artigos sem links não quebram a query

#### 3.2 Integração Cytoscape.js — Tema Galáctico

- **Instalar e configurar Cytoscape.js** com plugins:
  - `cytoscape-cose-bilkent` (layout force-directed)
  - `cytoscape-navigator` (minimapa)
  - `cytoscape-panzoom` (navegação)
- **Componente `<KnowledgeGraph>`** — renderização do grafo
  - Nós: círculos com gradiente, label com título do artigo
  - Arestas: linhas curvas com opacidade proporcional à força da conexão
  - Cores por categoria/tag
  - Tamanho do nó proporcional ao número de conexões (grau)
- **Interações:**
  - Clique no nó → navegar para `/article/[slug]`
  - Hover → destacar vizinhos, tooltip com título e resumo
  - Zoom/pan suaves
- **Controles:**
  - Slider de profundidade (depth 1-3)
  - Filtro por tags
  - Botão "centralizar" e "resetar visão"

**Critérios de aceitação:**

- Grafo renderiza sem travamentos com até 500 nós
- Interações respondem em < 200ms
- Visual agradável e condizente com tema "galáctico"
- Responsivo (desktop e tablet)

#### 3.3 ArangoSearch — Motor de Busca

- **Criar ArangoSearch View `article_search`** indexando:
  - `title` (text_en analyzer)
  - `content` (text_en analyzer)
  - `tags` (identity analyzer, para filtro exato)
  - `authorId` (facet)
  - `status` (filter)
  - `createdAt` (range filter)
- **Rota `GET /api/search`** — busca full-text
  - Parâmetros: `?q=termo`, `?tag=algoritmos`, `?author=alex123`, `?page=1`
  - Query AQL usando `SEARCH ANALYZER()` com BM25 scoring
  - Paginação (20 resultados por página)
- **Página `pages/search.vue`** — interface de busca
  - Campo de busca com debounce (300ms)
  - Filtros laterais: tags, autor
  - Resultados com highlight do termo buscado
  - Ordenação: relevância (padrão) ou data

**Critérios de aceitação:**

- Busca retorna resultados relevantes em < 300ms
- Highlight funciona no título e snippet do conteúdo
- Filtros combinados funcionam (termo + tag + autor)
- Busca vazia retorna artigos recentes

### Entregáveis da Sprint

- [x] API do grafo com traversal AQL otimizado
- [x] Visualização interativa com Cytoscape.js (tema galáctico)
- [x] Motor de busca full-text com ArangoSearch
- [x] Página de busca com filtros e highlight
- [x] `docs/sessao3/requisitos.md` e `docs/sessao3/sessao3-grafo-busca.md`

### Riscos

| Risco                                   | Mitigação                                                          |
| --------------------------------------- | ------------------------------------------------------------------ |
| Performance do Cytoscape com muitos nós | Implementar LOD: esconder labels em zoom out, limitar nós visíveis |
| ArangoSearch analyzer para português    | Usar `text_pt` se disponível, fallback para `text_en`              |
| Limite de 10s nas funções Vercel        | Paginar resultados do grafo, cache no CDN                          |

---

## Sprint 4 — Versionamento & Perfis

**Duração:** 1 semana
**Fase:** Conhecimento em Rede
**Objetivo:** Sistema de versionamento de artigos (histórico + restauração)
e páginas de perfil de autor.

### Objetivos de Aprendizado

| Princípio              | O que será praticado                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| **Event Sourcing**     | Versionamento como sequência de snapshots imutáveis                        |
| **Clean Architecture** | Separação entre dados atuais (`articles`) e histórico (`article_versions`) |
| **Normalização**       | Modelagem de dados para evitar duplicação e inconsistência                 |
| **Segurança**          | Autorização: apenas o autor pode restaurar versões                         |

### Tarefas

#### 4.1 API de Versionamento

- **Snapshot automático ao salvar artigo:**
  - Middleware na rota `PUT /api/articles/[id]` que salva versão anterior em `article_versions`
  - Máximo de 10 versões por artigo (policy de retenção)
  - Campo `expiresAt` para TTL (opcional no ArangoDB)
- **Rota `GET /api/articles/[id]/versions`** — listar histórico de versões
  - Retorna: `versionNumber`, `createdAt`, snippet do conteúdo (primeiros 200 caracteres)
- **Rota `POST /api/articles/[id]/versions/[versionId]/restore`** — restaurar versão
  - Copia conteúdo da versão para o documento `articles`
  - Cria NOVA versão (snapshot do estado atual antes da restauração)
  - Verifica se o usuário é o autor do artigo

**Critérios de aceitação:**

- Cada save gera uma entrada em `article_versions`
- Limite de 10 versões é respeitado (versão mais antiga é removida)
- Restauração cria snapshot do estado atual (não perde histórico)
- Apenas o autor pode restaurar (403 para outros)

#### 4.2 UI de Versionamento

- **Componente `<VersionHistory>`** — lista de versões na página do artigo
  - Timeline visual com data e número da versão
  - Preview do conteúdo ao clicar em uma versão (modal ou expand)
  - Botão "Restaurar esta versão" com confirmação
- **Badge de versão** no artigo: "v3 — última edição em 22/03/2025"

**Critérios de aceitação:**

- Timeline mostra até 10 versões ordenadas por data
- Preview carrega conteúdo da versão sem sair da página
- Restauração com feedback visual (loading → sucesso)

#### 4.3 API de Perfil de Autor

- **Rota `GET /api/users/[username]`** — perfil público do autor
  - Bio, avatar, data de entrada, contagem de artigos
  - Lista dos últimos artigos publicados
  - Links para artigos (arestas `authored`)
- **Rota `GET /api/users/[username]/articles`** — listar artigos do autor
  - Paginação, filtro por status, ordenação por data

**Critérios de aceitação:**

- Perfil de autor que não existe retorna 404
- Lista de artigos paginada e ordenada
- Contagem de artigos inclui apenas `published`

#### 4.4 Página de Perfil

- **Página `pages/profile/[username].vue`** — perfil público
  - Avatar (placeholder se não definido), bio, data de entrada
  - Grid de cards com artigos do autor (título, tags, data, snippet)
  - Estatísticas: total de artigos, total de conexões no grafo
- **Placeholder para "Galáxia Pessoal"** (implementada na Sprint 7)

**Critérios de aceitação:**

- Página renderiza SSR com metadados do autor
- Cards de artigo linkam corretamente
- Design responsivo

### Entregáveis da Sprint

- [x] Sistema de versionamento com snapshots automáticos
- [x] UI de histórico de versões com restauração
- [x] API de perfil de autor com listagem de artigos
- [x] Página de perfil público
- [x] `docs/sessao4/requisitos.md` e `docs/sessao4/sessao4-versionamento-perfis.md`

### Riscos

| Risco                                | Mitigação                                         |
| ------------------------------------ | ------------------------------------------------- |
| Armazenamento excessivo de versões   | Limitar a 10 versões, implementar TTL             |
| Race condition em múltiplos saves    | Usar `_rev` do ArangoDB para optimistic locking   |
| Perfis sem avatar visualmente pobres | Gerar avatar padrão com iniciais (UI Avatars API) |

---

## Sprint 5 — Autenticação & Rede Social

**Duração:** 1 semana
**Fase:** Social
**Objetivo:** Sistema de autenticação completo (registro, login, sessões)
e funcionalidade de seguidores entre co-criadores.

### Objetivos de Aprendizado

| Princípio        | O que será praticado                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| **Segurança**    | Hash de senhas (Argon2id), proteção CSRF, sessões seguras (TO-LEARN.md §12)     |
| **Autorização**  | Middleware de autenticação, verificações server-side (nunca confiar no cliente) |
| **RBAC**         | Roles básicos: anonymous, user, admin                                           |
| **OWASP Top 10** | Prevenção de broken auth, broken access control, sensitive data exposure        |

### Tarefas

#### 5.1 Configuração do `nuxt-auth-utils`

- **Instalar e configurar `nuxt-auth-utils`**
  - Provider: credentials (email + senha)
  - Hash: Argon2id (via `@node-rs/argon2`)
  - Sessões server-side com cookies seguros (HttpOnly, SameSite=Lax, Secure)
- **Middleware de autenticação** em `server/middleware/auth.ts`
  - Proteger rotas que exigem login
  - Injetar `event.context.user` nas requisições autenticadas

**Critérios de aceitação:**

- Sessão persiste entre requests (cookie seguro)
- Rotas protegidas retornam 401 sem sessão válida
- Senhas NUNCA aparecem em logs ou respostas da API

#### 5.2 Registro e Login

- **Rota `POST /api/auth/register`** — criar conta
  - Validar: email único, username único (3-30 caracteres, alfanumérico + underscore)
  - Senha: mínimo 8 caracteres, pelo menos 1 número e 1 letra
  - Hash da senha com Argon2id
  - Criar documento em `users`
- **Rota `POST /api/auth/login`** — autenticar
  - Verificar email + senha
  - Criar sessão
  - Retornar dados do usuário (sem passwordHash)
- **Rota `POST /api/auth/logout`** — encerrar sessão
- **Páginas:**
  - `pages/login.vue` — formulário de login
  - `pages/register.vue` — formulário de registro
  - Validação client-side + server-side

**Critérios de aceitação:**

- Registro rejeita email/username duplicados com mensagem clara
- Login com credenciais erradas retorna 401 (sem revelar qual campo está errado)
- Rate limiting: máximo 5 tentativas de login por IP em 15 minutos
- Senhas nunca trafegam em texto plano (HTTPS + hash no servidor)

#### 5.3 Sistema de Seguidores

- **Rota `POST /api/users/[username]/follow`** — seguir/deixar de seguir
  - Toggle: se já segue, remove aresta; se não segue, cria aresta `follows`
  - Verificar se usuário está autenticado
  - Não permitir seguir a si mesmo
- **Rota `GET /api/users/[username]/followers`** — lista de seguidores
  - Paginação, retorna array de `{ username, avatar, bio }`
- **Rota `GET /api/users/[username]/following`** — lista de quem o usuário segue
- **UI no perfil:**
  - Botão "Seguir" / "Seguindo" (toggle)
  - Contadores: "X seguidores", "X seguindo"
  - Lista de seguidores/seguindo em modal

**Critérios de aceitação:**

- Toggle seguir/deixar de seguir responde em < 300ms
- Contadores atualizam em tempo real (otimistic UI update)
- Seguidores/seguindo carregam com lazy loading

### Entregáveis da Sprint

- [x] Autenticação completa (registro, login, logout, sessões seguras)
- [x] Middleware de autorização
- [x] Sistema de seguidores com toggle e listas
- [x] Páginas de login e registro
- [x] `docs/sessao5/requisitos.md` e `docs/sessao5/sessao5-auth-social.md`

### Riscos

| Risco                             | Mitigação                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| Vazamento de passwordHash em logs | Configurar Pino (logger do Nitro) para redigir campos sensíveis |
| Ataques de força bruta no login   | Rate limiting por IP, lockout temporário (15 min após 5 falhas) |
| CSRF em ações de seguir           | Validar token CSRF em todas as mutations                        |

---

## Sprint 6 — Interações & Notificações

**Duração:** 1 semana
**Fase:** Social
**Objetivo:** Sistema de comentários estáticos, sistema de upvotes em artigos
e comentários, e feed de notificações em tempo quase-real.

### Objetivos de Aprendizado

| Princípio               | O que será praticado                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Modelagem de Dados**  | Threaded comments (parentId), contagem de upvotes desnormalizada                   |
| **Optimistic UI**       | Atualização otimista nos upvotes, rollback em caso de erro                         |
| **Eventos Assíncronos** | Notificações disparadas por hooks pós-ação (sem message queue no MVP)              |
| **Clean Code**          | Tratamento de edge cases: comentário vazio, upvote duplicado, artigo não publicado |

### Tarefas

#### 6.1 Sistema de Comentários

- **Rota `POST /api/articles/[id]/comments`** — criar comentário
  - Validar: conteúdo não vazio (1-5000 caracteres), artigo existe e está publicado
  - Suportar `parentId` para respostas (comentários aninhados, máximo 2 níveis)
  - Criar documento em `comments` + aresta `comment_on`
  - Disparar notificação para o autor do artigo
- **Rota `GET /api/articles/[id]/comments`** — listar comentários
  - Ordenação: mais recentes primeiro
  - Paginação
  - Incluir dados do autor (username, avatar) e contagem de upvotes
- **Componente `<CommentSection>`:**
  - Formulário de novo comentário (textarea + submit)
  - Threaded display: comentários pai, respostas indentadas
  - Autor pode deletar o próprio comentário (soft-delete)
  - Placeholder "Faça login para comentar" para usuários não autenticados

**Critérios de aceitação:**

- Comentários aninhados até 2 níveis renderizam com indentação
- Deleção é soft (não quebra threads existentes)
- Comentário de usuário não autenticado retorna 401

#### 6.2 Sistema de Upvotes

- **Rota `POST /api/upvote`** — votar/remover voto
  - Body: `{ targetType: "article" | "comment", targetId: "..." }`
  - Toggle: cria aresta `upvoted` ou remove se já existir
  - Incrementa/decrementa contador no documento alvo
- **Rota `GET /api/articles/[id]/upvotes`** — contagem e estado do voto do usuário atual
- **UI de upvote:**
  - Botão com ícone (coração/estrela/seta) + contador
  - Estado ativo/inativo (toggle visual)
  - Atualização otimista (update UI imediatamente, reverter se falhar)
  - Animação sutil no clique

**Critérios de aceitação:**

- Um usuário não pode upvotar o mesmo item duas vezes
- Contador atualiza atomicamente (sem race condition)
- UI otimista com rollback em caso de erro de rede

#### 6.3 Sistema de Notificações

- **Criação de notificações** (hooks disparados após ações):
  - Novo comentário → notificar autor do artigo
  - Resposta a comentário → notificar autor do comentário pai
  - Novo seguidor → notificar usuário seguido
  - Upvote → notificar autor do artigo/comentário
- **Rota `GET /api/notifications`** — feed do usuário autenticado
  - Paginação, ordenação por data (mais recentes primeiro)
  - Agrupar notificações similares (ex: "Fulano e mais 3 pessoas comentaram...")
  - Campo `read` (boolean)
- **Rota `POST /api/notifications/read-all`** — marcar todas como lidas
- **Componente `<NotificationBell>`:**
  - Ícone de sino no header com badge de não lidas
  - Dropdown com últimas 5 notificações
  - Clique na notificação → redirecionar para o item relacionado + marcar como lida
  - Link "Ver todas" → página de notificações

**Critérios de aceitação:**

- Notificações são criadas em até 1 segundo após a ação
- Badge atualiza sem refresh da página (polling a cada 30s no MVP)
- Notificações próprias não são geradas (ex: comentar no próprio artigo)

### Entregáveis da Sprint

- [x] Sistema de comentários com threading (2 níveis)
- [x] Sistema de upvotes toggle com optimistic UI
- [x] Feed de notificações com agrupamento e badge
- [x] Página de notificações completa
- [x] `docs/sessao6/requisitos.md` e `docs/sessao6/sessao6-interacoes-notificacoes.md`

### Riscos

| Risco                                                   | Mitigação                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Performance de contagem de upvotes em artigos populares | Contador desnormalizado no documento (atualizado atomicamente)                   |
| Notificações duplicadas em race condition               | Usar upsert com `_key` determinístico (ex: `notif_{userId}_{action}_{targetId}`) |
| Poluição de notificações (spam)                         | Rate limiting: máx 10 notificações por usuário por minuto                        |

---

## Sprint 7 — Galáxia Pessoal & Visual

**Duração:** 1 semana
**Fase:** Polimento
**Objetivo:** Visualização da "galáxia pessoal" no perfil do autor (subgrafo
dos próprios artigos), temas visuais, responsividade e animações.

### Objetivos de Aprendizado

| Princípio                 | O que será praticado                                           |
| ------------------------- | -------------------------------------------------------------- |
| **Visualização de Dados** | Subgrafos, LOD (Level of Detail), paletas de cores por domínio |
| **Design Responsivo**     | Mobile-first, breakpoints, touch interactions                  |
| **Animações CSS/JS**      | Transições suaves, animações com significado (não cosméticas)  |
| **Acessibilidade**        | Contraste, navegação por teclado, ARIA labels                  |

### Tarefas

#### 7.1 Galáxia Pessoal

- **Rota `GET /api/users/[username]/galaxy`** — subgrafo do autor
  - Query AQL: artigos do autor + conexões diretas entre eles + links para artigos de outros autores
  - Diferenciar visualmente: artigos do autor (cor destacada) vs artigos conectados (cor neutra)
- **Componente `<PersonalGalaxy>`** no perfil:
  - Instância menor do Cytoscape (não colidir com performance da página principal)
  - Layout fixo (não interativo além do hover para preview)
  - Clique no nó → navegar para o artigo
  - Animações sutis de entrada (fade-in dos nós)
- **Toggle entre visões:**
  - "Minha galáxia" — apenas artigos do autor e conexões entre eles
  - "Conexões externas" — expande 1 nível para artigos de outros autores

**Critérios de aceitação:**

- Galáxia carrega em < 1s para autores com até 50 artigos
- Visualização consistente com o grafo principal (mesma paleta)
- Navegação por clique funciona

#### 7.2 Temas e Estilo Visual

- **Sistema de temas:** Dark (padrão, "galáctico") e Light
  - CSS custom properties para cores
  - Toggle no header ou footer
  - Persistir preferência no localStorage
- **Paleta "Galáxia":**
  - Fundo: deep space (#0a0a1a a #1a1a3e)
  - Nós: cores vibrantes com glow (neon blue, purple, cyan, magenta)
  - Arestas: gradiente suave com opacidade
  - Tipografia: sans-serif limpa (Inter ou system font)
- **Animações:**
  - Transições de página (fade/slide)
  - Hover effects em cards e botões
  - Loading states com skeleton screens
  - Partículas sutis no fundo do grafo (opcional, performance-permitting)

**Critérios de aceitação:**

- Tema dark é o padrão
- Transição entre temas é suave (transition CSS)
- Contraste atende WCAG AA (ratio ≥ 4.5:1 para texto)

#### 7.3 Responsividade

- **Breakpoints:** mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- **Adaptações por componente:**
  - **Grafo:** full-width em mobile (sem minimapa), sidebar de controles em desktop
  - **Editor:** split-screen em desktop, tabs (editor | preview) em mobile
  - **Perfil:** grid de 3 colunas em desktop, 2 em tablet, 1 em mobile
  - **Busca:** filtros em sidebar no desktop, drawer/modal em mobile
- **Touch interactions:**
  - Grafo: pinch-to-zoom, tap para selecionar nó
  - Swipe em carrosséis (se houver)
- **Testes:** verificar todos os fluxos principais em viewport 375px e 1920px

**Critérios de aceitação:**

- Nenhum elemento quebra o layout em mobile
- Touch targets têm mínimo 44x44px (WCAG)
- Performance em mobile (Lighthouse score ≥ 80)

### Entregáveis da Sprint

- [x] Galáxia pessoal no perfil do autor
- [x] Sistema de temas dark/light
- [x] Paleta visual "galáxia" aplicada consistentemente
- [x] Layout responsivo completo
- [x] Animações de transição e loading states
- [x] `docs/sessao7/requisitos.md` e `docs/sessao7/sessao7-galaxia-visual.md`

### Riscos

| Risco                              | Mitigação                                                 |
| ---------------------------------- | --------------------------------------------------------- |
| Performance do Cytoscape em mobile | Reduzir nós visíveis, desabilitar animações de partículas |
| Consistência visual entre temas    | Usar design tokens (CSS custom properties)                |
| Acessibilidade do grafo            | Alternativa textual: lista de conexões abaixo do grafo    |

---

## Sprint 8 — Performance & Lançamento

**Duração:** 1 semana
**Fase:** Polimento
**Objetivo:** Otimização de performance, testes end-to-end, exportação de
artigos, documentação final e deploy de produção.

### Objetivos de Aprendizado

| Princípio           | O que será praticado                                            |
| ------------------- | --------------------------------------------------------------- |
| **Otimização**      | Medir ANTES de otimizar, Lighthouse, Web Vitals (LCP, FID, CLS) |
| **Testes E2E**      | Fluxos completos com Playwright, testes de regressão            |
| **Observabilidade** | Logging estruturado, métricas básicas, error tracking           |
| **DevOps**          | Deploy final, monitoramento, backup strategy                    |

### Tarefas

#### 8.1 Otimização de Performance

- **Auditoria inicial:** Lighthouse (Performance, Accessibility, SEO) para 5 páginas principais
- **Otimizações SSR/SSG:**
  - Configurar ISR (Incremental Static Regeneration) para páginas de artigo
  - Prefetch de dados no servidor para páginas com grafo
- **Otimizações de frontend:**
  - Virtualização no Cytoscape para grafos com > 200 nós
  - Lazy loading de componentes pesados (gráfico, editor)
  - Code splitting por rota
  - Compressão de imagens e uso de WebP
  - Cache headers otimizados (CDN da Vercel)
- **Otimizações de API:**
  - Revisar queries AQL (explicar planos de execução)
  - Adicionar índices faltantes
  - Paginar todas as listas (máximo 50 itens por página)
  - Response compression (gzip/brotli)
- **Métricas alvo:**
  - LCP < 2.5s
  - FID < 100ms (ou INP < 200ms)
  - CLS < 0.1
  - Lighthouse Performance ≥ 90

**Critérios de aceitação:**

- Lighthouse score ≥ 90 em todas as páginas principais
- Tempo de resposta da API < 500ms (p95)
- Grafo carrega em < 2s com até 500 nós

#### 8.2 Testes End-to-End (Playwright)

- **Fluxos críticos a testar:**
  1. **Registro → Login → Criar artigo → Publicar → Visualizar**
  2. **Buscar artigo → Navegar para artigo → Ver grafo → Clicar nó conectado**
  3. **Login → Seguir autor → Ver perfil → Ver seguidores**
  4. **Abrir artigo → Comentar → Responder comentário → Upvote**
  5. **Ver notificações → Marcar como lida → Navegar para item**
- **Configuração:**
  - Playwright com browsers: Chromium, Firefox, WebKit
  - Testes contra ambiente de staging (Vercel preview)
  - Dados de teste seedados no ArangoDB

**Critérios de aceitação:**

- Todos os fluxos críticos passam em 3 browsers
- Testes rodam em CI (GitHub Actions)

#### 8.3 Exportação de Artigos

- **Rota `GET /api/articles/[id]/export`** — exportar artigo
  - Parâmetro `?format=markdown` — download do conteúdo Markdown puro
  - Parâmetro `?format=pdf` — gerar PDF (usando `puppeteer` ou API serverless)
  - Incluir metadados: título, autor, data, tags
- **UI:** botão "Exportar" na página do artigo com dropdown (Markdown / PDF)

**Critérios de aceitação:**

- Export Markdown gera arquivo `.md` com metadados YAML frontmatter
- Export PDF gera documento formatado com título e conteúdo renderizado

#### 8.4 Documentação e Deploy Final

- **Atualizar `README.md`:**
  - Badges (build status, coverage, license)
  - Instruções de instalação e desenvolvimento local
  - Arquitetura resumida (diagrama Mermaid)
  - Links para documentação
- **Criar `CHANGELOG.md`** — primeiro release (v1.0.0)
- **Revisão de segurança:**
  - Verificar todas as rotas têm autorização apropriada
  - Verificar inputs são validados e sanitizados
  - Verificar headers de segurança (CSP, HSTS, X-Frame-Options)
  - Rodar `npm audit` e corrigir vulnerabilidades
- **Deploy final:**
  - Merge na `main` → deploy automático na Vercel
  - Configurar domínio de produção
  - Verificar SSL e redirecionamentos
  - Smoke test em produção (todos os fluxos críticos)
- **Backup strategy:**
  - Script de backup do ArangoDB agendado (crontab diário)
  - Documentar procedimento de restore

**Critérios de aceitação:**

- README completo e funcional (outro dev consegue rodar localmente)
- 0 vulnerabilidades `high` ou `critical` no `npm audit`
- Deploy de produção funcional com HTTPS
- Backup restore testado com sucesso

### Entregáveis da Sprint

- [x] Otimizações de performance (Lighthouse ≥ 90)
- [x] Testes E2E completos (5 fluxos críticos, 3 browsers)
- [x] Exportação de artigos (Markdown + PDF)
- [x] Documentação completa (README, CHANGELOG)
- [x] Deploy de produção com smoke test
- [x] `docs/sessao8/requisitos.md` e `docs/sessao8/sessao8-performance-lancamento.md`

### Riscos

| Risco                                               | Mitigação                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Export PDF complexo no serverless (10s timeout)     | Gerar PDF incrementalmente ou usar serviço externo (ex: Gotenberg) |
| Vazamento de dados em preview deployments da Vercel | Configurar autenticação básica nos previews ou IP allowlist        |
| Problemas de cache após deploy                      | Configurar purge de cache no deploy                                |

---

## Resumo de Entregáveis por Sprint

```
Sprint 1 ████░░░░░░░░░░░░░░░░ Setup & Infra
Sprint 2 ████████░░░░░░░░░░░░ CRUD & Editor
Sprint 3 ████████████░░░░░░░░ Grafo & Busca
Sprint 4 ████████████████░░░░ Versionamento & Perfis
Sprint 5 ████████████████████ Auth & Social
Sprint 6 ████████████████████ Interações
Sprint 7 ████████████████████ Visual
Sprint 8 ████████████████████ Launch
```

---

## Glossário de Princípios (referência rápida)

| Sigla      | Significado                                    | Fonte (TO-LEARN.md) |
| ---------- | ---------------------------------------------- | ------------------- |
| **SOLID**  | SRP, OCP, LSP, ISP, DIP                        | §3.1                |
| **DRY**    | Don't Repeat Yourself                          | §3.2                |
| **KISS**   | Keep It Simple, Stupid                         | §3.3                |
| **YAGNI**  | You Aren't Gonna Need It                       | §3.4                |
| **TDD**    | Test-Driven Development                        | §4.3                |
| **DDD**    | Domain-Driven Design                           | §7.3                |
| **SemVer** | Semantic Versioning                            | §4.1                |
| **ACID**   | Atomicity, Consistency, Isolation, Durability  | §10.1               |
| **CAP**    | Consistency, Availability, Partition tolerance | §10.3               |
| **CIA**    | Confidentiality, Integrity, Availability       | §12.1               |
| **LOD**    | Level of Detail                                | §7 (performance)    |

---

## Metodologia de Revisão

Ao final de cada sprint, o agente deve conduzir a **Fase 3 (Revisão e Reflexão)**
e **Fase 4 (Registro de Aprendizado)** conforme definido no `AGENTS.md §3.1`:

1. **Revisar o código** produzido na sprint
2. **Discutir pontos de melhoria** (code smells, padrões aplicados)
3. **Relacionar com conceitos do TO-LEARN.md** (quais princípios foram praticados)
4. **Atualizar `LEARNING.md`** com:
   - Conceitos praticados na sprint
   - Decisões tomadas e seus motivos
   - Pontos de melhoria identificados
   - Sugestões de estudo complementar
5. **Gerar documentação da sessão** (`docs/sessao[n]/sessao[n]-[título].md`)

---

_Documento gerado em: 9 de Maio de 2026_
_Base: `docs/planejamento/planejamento.md` e `.agents/TO-LEARN.md`_
_Versão: 1.0_
