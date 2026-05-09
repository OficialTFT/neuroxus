# Plano de Desenvolvimento: Plataforma de Conhecimento Colaborativo

> **Documento gerado a partir das discussões de planejamento em 2025-03-22**
> Stack final, requisitos, arquitetura e modelo de dados para o MVP.

---

## 1. Visão Geral

### 1.1 Propósito

Plataforma web para co-criadores produzirem conteúdo educacional em formato Markdown, organizado como um **grafo de conhecimento público**, com interações sociais (seguidores, comentários, upvotes) e visualização estilizada no formato de "galáxia de conhecimento".

### 1.2 Inspirações

- **Obsidian** – Edição Markdown com links internos e visualização em grafo.
- **Astro** – Conteúdo estático com Markdown/MDX e preview em tempo real.
- **Ponder** – Canvas infinito com IA e visualização de conexões.
- **brainful** – Blocos versionados, entidades imutáveis e grafo colaborativo.

### 1.3 Diferenciação

União entre **produção de conteúdo educacional**, **grafo de conhecimento público** e **gamificação social**, tudo hospedado em infraestrutura de custo zero.

---

## 2. Stack Final

| Camada                    | Tecnologia                    | Versão | Justificativa                                                                                                     |
| ------------------------- | ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| **Frontend**              | Vue.js + Nuxt 3               | 3.x    | Experiência do desenvolvedor, SSR/SSG, ótimo SEO, server routes integradas.                                       |
| **Backend / API**         | Nitro (server routes do Nuxt) | –      | Backend integrado ao mesmo repositório. API serverless no deploy (Vercel) ou Node.js completo.                    |
| **Editor de Conteúdo**    | TipTap                        | 2.x    | Editor rich-text/Markdown extensível, suporte nativo Vue 3, preview customizável.                                 |
| **Grafo de Conhecimento** | Cytoscape.js                  | 3.x    | Biblioteca madura para visualização de grafos 2D, fácil estilização CSS, layouts interativos.                     |
| **Banco de Dados**        | ArangoDB                      | 3.11   | Multi-modelo nativo (documentos, grafos, busca full-text). Ideal para artigos + relações + busca.                 |
| **Autenticação**          | `nuxt-auth-utils`             | –      | Biblioteca interna (controle total, sessões seguras, hash de senhas). Sem dependência de serviços externos pagos. |
| **Proxy Reverso / TLS**   | Caddy                         | 2.x    | HTTPS automático com Let's Encrypt, configuração mínima, renovação transparente.                                  |
| **Containerização (dev)** | Docker Compose                | –      | ArangoDB local para desenvolvimento e testes.                                                                     |
| **Hospedagem Frontend**   | Vercel                        | Hobby  | Deploy automático via Git, preview por PR, SSL incluso, 100 GB banda, funções serverless.                         |
| **Hospedagem Banco**      | Oracle Cloud Always Free      | –      | VM ARM 4 OCPUs / 24 GB RAM vitalícia. Zero custo.                                                                 |
| **CI/CD**                 | Git + Vercel automático       | –      | Push na branch principal → build e deploy automáticos.                                                            |

### 2.1 Por que as escolhas? (em 1 frase)

- **Vue.js + Nuxt 3**: Você trabalha com isso e entrega SSR/SSG nativo com backend integrado.
- **Nitro**: Não adiciona complexidade de um backend separado; todas as APIs vivem no mesmo repositório.
- **TipTap**: Editor moderno, extensível e com suporte Vue 3 de primeira classe.
- **Cytoscape.js**: Permite o estilo “galáctico” desejado com CSS avançado e tem bom desempenho para milhares de nós.
- **ArangoDB**: Multi-modelo nativo perfeito para o domínio (documentos para conteúdo, grafos para relações, busca full-text integrada, time-travel para versionamento).
- **`nuxt-auth-utils`**: Controle total sem riscos de mudança de preços futuros.
- **Caddy**: HTTPS automático sem scripts manuais de renovação.
- **Vercel**: Maior simplicidade de deploy, domínio próprio, preview por PR.
- **Oracle Cloud**: Custo zero permanente para o banco de dados.

---

## 3. Arquitetura Geral

```
[Usuário] → Vercel (Nuxt 3 + Nitro API) → ArangoDB (VM Oracle Cloud)
                 ↓                             ↓
            Frontend + Backend            Banco Multi-Modelo
            (SSR/SSG/API)                 (Documentos + Grafos + Busca)
```

### 3.1 Fluxos principais

| Fluxo                        | Caminho                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| **Leitura de artigo**        | Cliente → Vercel (SSR/SSG) → CDN → Usuário                                       |
| **Criação/edição de artigo** | Cliente → TipTap → API `/api/articles` (Nitro) → ArangoDB                        |
| **Visualização do grafo**    | Cliente → API `/api/graph` (Nitro) → AQL traversal → ArangoDB → JSON → Cytoscape |
| **Busca**                    | Cliente → API `/api/search` (Nitro) → ArangoSearch View → ArangoDB               |
| **Autenticação**             | Cliente → API `/api/auth/*` (Nitro + `nuxt-auth-utils`) → sessão segura          |
| **Notificações**             | Cliente → API `/api/notifications` (Nitro) → ArangoDB                            |

### 3.2 Estrutura de pastas (Nuxt 3)

```
/
├── .env                    # Variáveis de ambiente (ARANGO_URL, ARANGO_USER, ARANGO_PASS, etc.)
├── nuxt.config.ts
├── server/
│   ├── api/                # Rotas da API (Nitro)
│   │   ├── articles/
│   │   │   ├── [...id].ts  # GET, PUT, DELETE artigo
│   │   │   ├── index.ts    # GET lista, POST criar
│   │   │   ├── [...id]/versions.ts  # GET versões, POST restaurar
│   │   │   └── [...id]/comments.ts  # GET, POST comentários
│   │   ├── graph.ts        # GET dados do grafo
│   │   ├── search.ts       # GET motor de busca
│   │   ├── auth/           # Rotas de autenticação
│   │   └── users/          # Perfis, seguidores
│   ├── utils/
│   │   └── arango.ts       # Conexão com ArangoDB
│   └── middleware/         # Middleware de autenticação
├── components/             # Componentes Vue
│   ├── editor/             # TipTap, preview
│   ├── graph/              # Cytoscape, filtros
│   └── ui/                 # Botões, modais, etc.
├── pages/                  # Rotas do Nuxt
│   ├── index.vue           # Home com grafo de conhecimento
│   ├── article/
│   │   └── [...slug].vue   # Página de artigo
│   ├── profile/
│   │   └── [username].vue  # Perfil do co-criador
│   └── search.vue          # Página de busca
├── composables/            # Hooks reutilizáveis
├── plugins/                # Plugins Vue
└── public/                 # Assets estáticos
```

---

## 4. Modelo de Dados (ArangoDB)

### 4.1 Coleções de Documentos (nós)

**`users`**

```json
{
  "_key": "alex123",
  "username": "Alex Silva",
  "email": "alex@example.com",
  "passwordHash": "$argon2id...",
  "bio": "Criador de conteúdo sobre ciência da computação",
  "avatar": "https://...",
  "createdAt": "2025-03-22T10:00:00Z"
}
```

**`articles`**

```json
{
  "_key": "art101",
  "title": "Introdução a Algoritmos Genéticos",
  "slug": "introducao-algoritmos-geneticos",
  "content": "# Introdução\n\nOs algoritmos genéticos...",
  "authorId": "alex123",
  "status": "published",
  "tags": ["algoritmos", "IA", "evolução"],
  "createdAt": "2025-03-22T10:00:00Z",
  "updatedAt": "2025-03-22T12:00:00Z"
}
```

**`article_versions`**

```json
{
  "_key": "art101_v3",
  "articleId": "art101",
  "versionNumber": 3,
  "content": "# Introdução\n\nOs algoritmos genéticos são inspirados...",
  "createdAt": "2025-03-22T12:00:00Z",
  "expiresAt": null,
  "restorable": true
}
```

**`comments`**

```json
{
  "_key": "cmt200",
  "articleId": "art101",
  "authorId": "user456",
  "content": "Excelente artigo! Você planeja abordar também algoritmos de enxame?",
  "parentId": null,
  "upvotes": 15,
  "createdAt": "2025-03-22T13:00:00Z"
}
```

**`notifications`**

```json
{
  "_key": "not300",
  "recipientId": "alex123",
  "type": "new_comment",
  "relatedId": "cmt200",
  "read": false,
  "createdAt": "2025-03-22T13:00:00Z"
}
```

### 4.2 Coleções de Arestas (grafos)

**`authored`**
_De `users` para `articles`_

```json
{
  "_from": "users/alex123",
  "_to": "articles/art101",
  "createdAt": "2025-03-22T10:00:00Z"
}
```

**`article_links`**
_De `articles` para `articles` (citações internas)_

```json
{
  "_from": "articles/art101",
  "_to": "articles/art205",
  "context": "veja também a explicação sobre fitness",
  "type": "reference",
  "createdAt": "2025-03-22T10:00:00Z"
}
```

**`follows`**
_De `users` para `users` (rede social)_

```json
{
  "_from": "users/user456",
  "_to": "users/alex123",
  "createdAt": "2025-03-22T14:00:00Z"
}
```

**`comment_on`**
_De `comments` para `articles`_

```json
{
  "_from": "comments/cmt200",
  "_to": "articles/art101",
  "createdAt": "2025-03-22T13:00:00Z"
}
```

**`upvoted`**
_De `users` para `articles` ou `comments`_

```json
{
  "_from": "users/user456",
  "_to": "comments/cmt200",
  "createdAt": "2025-03-22T14:00:00Z"
}
```

### 4.3 Views de Busca (ArangoSearch)

**`article_search`**
View que indexa campos de `articles` para busca full-text:

- `title` – text search
- `content` – text search
- `tags` – array filter
- `authorId` – facet
- `status` – filter
- `createdAt` – range filter

### 4.4 Grafos Nomeados

- **knowledge_graph** – contém as arestas `article_links` e os vértices `articles`.
- **social_graph** – contém as arestas `follows` e os vértices `users`.

### 4.5 Exemplo de Queries AQL

**Grafo de conhecimento (base para visualização):**

```aql
FOR v, e, p IN 1..3 ANY 'articles/art101' article_links
  FILTER v.status == 'published'
  RETURN { vertex: v, edge: e, depth: LENGTH(p.edges) }
```

**Busca full-text:**

```aql
FOR doc IN article_search
  SEARCH ANALYZER(doc.title IN TOKENS("algoritmo genético", "text_en"), "text_en")
  SORT BM25(doc) DESC
  RETURN doc
```

**Galáxia pessoal (artigos de um usuário + suas conexões):**

```aql
FOR v IN authored
  FILTER v._from == 'users/alex123'
  FOR doc IN articles
    FILTER doc._key == v._to
    LET links = (
      FOR e IN article_links
        FILTER e._from == doc._id OR e._to == doc._id
        RETURN DISTINCT { edge: e, node: DOCUMENT(e._from == doc._id ? e._to : e._from) }
    )
    RETURN { article: doc, links: links }
```

---

## 5. Funcionalidades MVP – Plano de Implementação

### 5.1 Fase 1: Fundação (sem usuários públicos)

| Funcionalidade                  | Tarefa                                            | Rota API                 | Prioridade |
| ------------------------------- | ------------------------------------------------- | ------------------------ | ---------- |
| Editor Markdown + Preview       | Integrar TipTap com split-screen, salvar rascunho | `POST /api/articles`     | Essencial  |
| Criação/edição de artigo        | Frontend + API para salvar/atualizar artigo       | `PUT /api/articles/[id]` | Essencial  |
| Visualização de artigo          | Página SSR/SSG que renderiza Markdown → HTML      | `GET /api/articles/[id]` | Essencial  |
| Links internos (`[[wikilink]]`) | Parsing de wikilinks, criação de arestas no grafo | –                        | Essencial  |

### 5.2 Fase 2: Conhecimento em Rede

| Funcionalidade                | Tarefa                                          | Rota API                          | Prioridade |
| ----------------------------- | ----------------------------------------------- | --------------------------------- | ---------- |
| Grafo de conhecimento público | Página inicial com cytoscape renderizando grafo | `GET /api/graph`                  | Essencial  |
| Motor de busca                | ArangoSearch View + interface de pesquisa       | `GET /api/search`                 | Essencial  |
| Versionamento de artigos      | Histórico de versões, restaurar até 10          | `GET /api/articles/[id]/versions` | Essencial  |
| Perfil básico de autor        | Bio e lista de artigos do autor                 | `GET /api/users/[username]`       | Essencial  |

### 5.3 Fase 3: Colaboração Social

| Funcionalidade        | Tarefa                                                   | Rota API                            | Prioridade  |
| --------------------- | -------------------------------------------------------- | ----------------------------------- | ----------- |
| Autenticação          | Registro + login com sessões seguras                     | `/api/auth/*`                       | Diferencial |
| Seguidores            | Seguir e deixar de seguir co-criadores                   | `POST /api/users/[username]/follow` | Diferencial |
| Comentários estáticos | Criação e listagem de comentários                        | `/api/articles/[id]/comments`       | Diferencial |
| Upvotes               | Votar em artigos e comentários                           | `POST /api/upvote`                  | Diferencial |
| Notificações          | Feed de notificações (novo seguidor, comentário, upvote) | `GET /api/notifications`            | Diferencial |

### 5.4 Fase 4: Polimento e Escala

| Funcionalidade            | Tarefa                                                 | Rota API                           | Prioridade |
| ------------------------- | ------------------------------------------------------ | ---------------------------------- | ---------- |
| Galáxia pessoal           | Visualização dos próprios artigos como grafo no perfil | `GET /api/users/[username]/galaxy` | Polimento  |
| Ajustes visuais           | Temas, responsividade, animações                       | –                                  | Polimento  |
| Exportação de artigos     | Baixar como PDF, Markdown                              | `GET /api/articles/[id]/export`    | Polimento  |
| Otimização de performance | Paginação, virtualização, lazy loading no grafo        | –                                  | Polimento  |

---

## 6. Setup de Infraestrutura

### 6.1 ArangoDB na Oracle Cloud (Passos)

1. **Criar conta Oracle Cloud e provisionar VM**
   - Imagem: Ubuntu 22.04 LTS
   - Shape: VM.Standard.A1.Flex (ARM Ampere, 2-4 OCPUs, 8-24 GB RAM)
   - Boot volume: 50 GB
   - Upload da chave SSH pública

2. **Configurar acesso e firewall**

   ```bash
   ssh -i /caminho/para/sua-chave opc@<IP_PUBLICO>
   sudo apt update && sudo apt upgrade -y
   sudo ufw allow OpenSSH && sudo ufw enable
   # Na console Oracle: liberar portas 80 e 443 (Security Lists)
   ```

3. **Instalar Docker e Docker Compose**

   ```bash
   # Seguir documentação oficial do Docker para Ubuntu
   sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo usermod -aG docker $USER && newgrp docker
   ```

4. **Levantar container do ArangoDB**

   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     arangodb:
       image: arangodb/arangodb:3.11
       container_name: arangodb
       restart: unless-stopped
       ports:
         - '8529:8529'
       environment:
         ARANGO_ROOT_PASSWORD: SuaSenhaForteAqui
       volumes:
         - arango_data:/var/lib/arangodb3
         - arango_apps:/var/lib/arangodb3-apps
       command: |
         arangod --server.authentication=true
         --server.endpoint=tcp://0.0.0.0:8529
         --server.statistics=true
         --log.level=INFO
   volumes:
     arango_data:
     arango_apps:
   ```

   ```bash
   docker compose up -d
   ```

5. **Instalar e configurar Caddy (proxy reverso + TLS)**

   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install caddy
   ```

   Editar `/etc/caddy/Caddyfile`:

   ```
   arango.seudominio.com {
       reverse_proxy localhost:8529
   }
   ```

   ```bash
   sudo systemctl reload caddy
   ```

6. **Criar banco de dados e usuário**
   - Acessar `https://arango.seudominio.com` → login root
   - Criar usuário `app_user` com senha forte
   - Criar banco `knowledgebase`

7. **Backup básico (opcional)**
   ```bash
   # Script /home/ubuntu/backup-arango.sh
   # Agendado via crontab diariamente
   ```

### 6.2 Nuxt 3 na Vercel

1. **Configurar variáveis de ambiente**
   .env:

   ```
   ARANGO_URL=https://arango.seudominio.com
   ARANGO_USER=app_user
   ARANGO_PASS=SuaSenhaApp
   DB_NAME=knowledgebase
   ```

2. **Deploy automático**
   ```bash
   # Conectar GitHub → Vercel
   # Toda push na branch principal → build e deploy automáticos
   ```

### 6.3 Desenvolvimento Local

```bash
# docker-compose.yml local (igual ao da VM Oracle)
docker compose up -d

# .env local
ARANGO_URL=http://localhost:8529
ARANGO_USER=root
ARANGO_PASS=senha_local
DB_NAME=knowledgebase

# Iniciar Nuxt
npm run dev
```

---

## 7. Padrões e Práticas Recomendadas

Com base nos princípios do **TO-LEARN.md**, estas práticas devem ser seguidas durante o desenvolvimento:

### 7.1 Princípios de Código

| Princípio | Aplicação no Projeto                                                                                                                                                                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SOLID** | – **SRP**: modelos de dados separados das APIs, componentes Vue com responsabilidade única.<br>– **OCP**: plugins/extensões para o editor TipTap, layouts intercambiáveis para o grafo.<br>– **DIP**: server routes dependem de abstrações (interfaces/contratos), não da implementação específica do ArangoDB. |
| **DRY**   | – Extrair lógica de conexão com ArangoDB para composables reutilizáveis.<br>– Componentes compartilhados (botões, modais, formulários).                                                                                                                                                                         |
| **KISS**  | – Começar com implementações simples e iterar.<br>– Evitar abstrações prematuras.<br>– Usar apenas os recursos do ArangoDB que são necessários.                                                                                                                                                                 |
| **YAGNI** | – Não implementar features futuras agora.<br>– Não adicionar WebSockets para comentários em tempo real (definido como estático).<br>– Não implementar cache complexo antes de medir performance.                                                                                                                |

### 7.2 Versionamento e Commits

- Seguir especificação **Semantic Versioning** (MAJOR.MINOR.PATCH).
- Usar **Conventional Commits** (feat:, fix:, docs:, refactor:).
- Manter **CHANGELOG.md** atualizado.
- Versionar conteúdo dos artigos via modelo de dados (coleção `article_versions`).

### 7.3 Testes

| Tipo           | Ferramenta              | O que testar                                                      |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| **Unitários**  | Vitest (Vue)            | Lógica de parsing de wikilinks, funções utilitárias, composables. |
| **Integração** | Vitest + TestContainers | Rotas API com ArangoDB real (via Docker).                         |
| **End-to-End** | Playwright              | Fluxo completo: criar artigo, buscar, visualizar grafo.           |

### 7.4 Segurança

- **Autenticação**: Hash de senhas com bcrypt/argon2, sessões seguras, CSRF protection.
- **Autorização**: Verificar permissões no servidor (nunca confiar no cliente).
- **Input validation**: Sanitizar e validar todos os inputs (Markdown, parâmetros de query).
- **Error handling**: Não expor detalhes de implementação em mensagens de erro.
- **CORS**: Configurar apenas origens permitidas.

---

## 8. Riscos e Mitigações

| Risco                                              | Probabilidade             | Impacto | Mitigação                                                                                        |
| -------------------------------------------------- | ------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| **Oracle Cloud encerrar conta Always Free**        | Baixa                     | Alto    | Documentar processo de migração para Fly.io ou outro banco gerenciado.                           |
| **Limite de 10s nas funções serverless da Vercel** | Média (queries complexas) | Médio   | Otimizar queries AQL, paginar resultados, migrar rota específica para servidor contínuo.         |
| **ArangoDB não performar com muitos nós no grafo** | Média (escala)            | Médio   | Implementar LOD, carregamento sob demanda, clusterização.                                        |
| **Complexidade do editor Markdown**                | Média                     | Médio   | Começar com funcionalidades básicas (bold, italic, headings, wikilinks) e expandir gradualmente. |

---

## 9. Próximos Passos (Roadmap)

### Semana 1-2: Fundação

- [ ] Criar repositório no GitHub.
- [ ] Configurar Nuxt 3 com Nitro e estrutura de pastas.
- [ ] Provisionar VM Oracle e instalar ArangoDB (seguir guia da seção 6.1).
- [ ] Configurar variáveis de ambiente e conexão com ArangoDB.
- [ ] Implementar rota `POST /api/articles` (criação com status `draft`).
- [ ] Integrar editor TipTap com preview split-screen.
- [ ] Implementar visualização de artigo (SSR/SSG).

### Semana 3-4: Conhecimento em Rede

- [ ] Implementar sistema de links internos (parsing `[[wikilink]]`).
- [ ] Criar rota `GET /api/graph` (query AQL traversal).
- [ ] Integrar Cytoscape.js com tema galáctico inicial.
- [ ] Implementar busca via ArangoSearch.
- [ ] Implementar versionamento (histórico + restaurar até 10 versões).
- [ ] Criar página de perfil básico.

### Semana 5-6: Social

- [ ] Configurar `nuxt-auth-utils` (registro, login, sessões).
- [ ] Implementar sistema de seguidores.
- [ ] Implementar comentários estáticos.
- [ ] Implementar upvotes.
- [ ] Criar sistema de notificações.

### Semana 7-8: Polimento

- [ ] Galáxia pessoal no perfil (subgrafo).
- [ ] Ajustes visuais e responsividade.
- [ ] Otimização de performance.
- [ ] Testes e correções de bugs.
- [ ] Documentação e deploy final.

---

## 10. Considerações Finais

Este documento consolida todas as decisões de planejamento para o MVP da plataforma. A stack escolhida é **robusta, de custo zero e adequada ao domínio** – especialmente a escolha do ArangoDB como banco multi-modelo, que entrega documentos, grafos e busca full-text em um único sistema.

A arquitetura **Nuxt 3 + Nitro** elimina a necessidade de um backend separado, simplifica o deploy e mantém a produtividade alta com uma linguagem unificada (Vue.js/TypeScript).
