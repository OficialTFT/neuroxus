# Sessões da Sprint 1 — Setup & Infraestrutura

> **Documento de divisão da Sprint 1 em sessões de pair-programming**
> Base metodológica: `.agents/AGENTS.md` §3.1 (Protocolo de Pair-Programming) e §5.2 (Início de Feature/Tarefa)
> Sprint definida em: `docs/sprint/sprint.md`

---

## Visão Geral da Sprint

|                      |                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Duração**          | 1 semana                                                                                               |
| **Fase**             | Fundação                                                                                               |
| **Objetivo**         | Projeto inicializado, ambiente de desenvolvimento configurado, infraestrutura de produção provisionada |
| **Total de Sessões** | 4                                                                                                      |

### Estrutura de cada sessão

Cada sessão segue o protocolo do AGENTS.md (§3.1):

1. **Fase 1 — Planejamento** (usuário lidera com suporte do agente)
2. **Fase 2 — Execução** (agente lidera com observação do usuário)
3. **Fase 3 — Revisão e Reflexão** (conjunta)
4. **Fase 4 — Registro de Aprendizado** (agente gera resumo)

### Artefatos por sessão

```
docs/
├── sessao1/
│   ├── requisitos.md
│   └── sessao1-inicializacao-projeto.md
├── sessao2/
│   ├── requisitos.md
│   └── sessao2-infraestrutura-gcp.md
├── sessao3/
│   ├── requisitos.md
│   └── sessao3-conexao-backend-banco.md
└── sessao4/
    ├── requisitos.md
    └── sessao4-deploy-cicd.md
```

---

## Sessão 1 — Inicialização do Projeto

| Campo                               | Valor                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Dias estimados**                  | 1–2                                                                                                                 |
| **Tarefa da Sprint**                | 1.1                                                                                                                 |
| **Princípios praticados**           | Versionamento (Conventional Commits), KISS, YAGNI                                                                   |
| **Critério de aceitação da sessão** | `npm run dev` inicia sem erros, ESLint + Prettier funcionando, estrutura de pastas espelha o `planejamento.md` §3.2 |

### Subtarefas

| #     | Tarefa                       | Descrição                                                                                                                       |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 | Criar repositório GitHub     | `README.md`, `.gitignore` (Node/ArangoDB/Vercel), `LICENSE`                                                                     |
| 1.1.2 | Inicializar Nuxt 3           | `npx nuxi init` com TypeScript                                                                                                  |
| 1.1.3 | Estruturar pastas            | Conforme `planejamento.md §3.2`: `server/api/`, `server/utils/`, `components/`, `pages/`, `composables/`, `plugins/`, `public/` |
| 1.1.4 | Configurar ESLint + Prettier | Regras padronizadas, integração com Nuxt 3                                                                                      |
| 1.1.5 | Criar `.env.example`         | Todas as variáveis documentadas: `ARANGO_URL`, `ARANGO_USER`, `ARANGO_PASS`, `DB_NAME`                                          |
| 1.1.6 | Primeiro commit              | `chore: init project structure`                                                                                                 |

### Objetivos de Aprendizado

- **Conventional Commits**: estrutura do primeiro commit (`chore:`)
- **Estrutura Nuxt 3**: propósito de cada diretório (`server/`, `components/`, `pages/`, `composables/`)
- **ESLint + Prettier**: diferença entre linting e formatação, por que usar ambos
- **.env vs .env.example**: segurança de credenciais, rastreabilidade

### Riscos da Sessão

| Risco                            | Mitigação                                                |
| -------------------------------- | -------------------------------------------------------- |
| `npx nuxi init` pedir permissões | Usar `--yes` ou `npx --yes nuxi@latest init`             |
| Versão do Node.js incompatível   | Verificar `.node-version` ou `engines` no `package.json` |

---

## Sessão 2 — Infraestrutura: GCP + Docker + ArangoDB

| Campo                               | Valor                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| **Dias estimados**                  | 1                                                                                           |
| **Tarefa da Sprint**                | 1.2                                                                                        |
| **Princípios praticados**           | DevOps, IaC (Docker Compose), Segurança (firewall em camadas)                                    |
| **Critério de aceitação da sessão** | ArangoDB rodando em Docker, acessível via `localhost:8529`, UFW + GCP Firewall configurados, backup funcional |

### Subtarefas

| #     | Tarefa                           | Descrição                                                                            |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------ |
| ~~1.2.1~~ | ~~Criar conta Oracle Cloud~~         | Ignorado — Oracle Cloud indisponível                                        |
| ~~1.2.2~~ | ~~Provisionar VM ARM~~               | Ignorado — VM criada manualmente no GCP                                      |
| ~~1.2.3~~ | ~~Configurar acesso SSH~~            | Ignorado — já configurado                                                    |
| 1.2.4 | Instalar Docker e Docker Compose | `docker-ce`, `docker-compose-plugin`, adicionar usuário ao grupo `docker`    |
| 1.2.5 | Subir container ArangoDB 3.11    | Via `docker-compose.yml` com volumes persistentes e limite de memória (400 MB)|
| ~~1.2.6~~ | ~~Instalar e configurar Caddy~~  | Adiado — sem domínio disponível                                              |
| 1.2.7 | Configurar firewall              | GCP VPC Firewall (porta 8529) + UFW (apenas SSH, 8529)                       |
| 1.2.8 | Criar banco e usuário            | Banco `knowledgebase`, usuário `app_user` com permissão RW                   |
| 1.2.9 | Script de backup                 | `backup-arango.sh` agendado no crontab (container temporário na rede Docker) |

### Objetivos de Aprendizado

- **IaC com Docker Compose**: infraestrutura reprodutível como código
- **Proxy Reverso + TLS**: papel do Caddy, Let's Encrypt, renovação automática
- **Firewall em camadas**: Security Lists (nuvem) + UFW (SO) — defesa em profundidade
- **Volumes Docker**: persistência de dados (`arango_data`, `arango_apps`)

### Riscos da Sessão

| Risco                         | Mitigação                                                         |
| ----------------------------- | ----------------------------------------------------------------- |
| RAM limitada (952 MB)         | Swap de 2 GB + `mem_limit: 400m` no container                     |
| GCP VM pode ser reiniciada    | Configurar persistência do swap em `/etc/fstab` posteriormente    |
| Sem domínio para TLS          | Acesso via HTTP temporariamente; Caddy adiado                     |

---

## Sessão 3 — Conexão Backend ↔ Banco de Dados

| Campo                               | Valor                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Dias estimados**                  | 1–2                                                                                                  |
| **Tarefa da Sprint**                | 1.3                                                                                                  |
| **Princípios praticados**           | SRP (utils separadas das rotas), Tratamento Explícito de Erros, DIP (abstração da conexão)           |
| **Critério de aceitação da sessão** | `GET /api/health` retorna 200 com status do banco, conexão funciona local (Docker) e remota (Oracle) |

### Subtarefas

| #     | Tarefa                               | Descrição                                                                                                                                                                 |
| ----- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1 | Implementar `server/utils/arango.ts` | Singleton de conexão com `Database` do driver `arangojs`, pool de conexão, retry logic                                                                                    |
| 1.3.2 | Configurar variáveis de ambiente     | `ARANGO_URL`, `ARANGO_USER`, `ARANGO_PASS`, `DB_NAME` no `.env`                                                                                                           |
| 1.3.3 | Criar rota `GET /api/health`         | Ping no ArangoDB, retorna `{ status: "ok", db: "knowledgebase", latency: "12ms" }`                                                                                        |
| 1.3.4 | Script de migração inicial           | Criar coleções: `users`, `articles`, `article_versions`, `comments`, `notifications` + arestas: `authored`, `article_links`, `follows`, `comment_on`, `upvoted` + índices |
| 1.3.5 | Docker Compose local                 | Subir ArangoDB local para desenvolvimento (`docker compose up -d`)                                                                                                        |
| 1.3.6 | Testar conectividade dual            | Local (Docker) e remota (Oracle Cloud) alternando `.env`                                                                                                                  |

### Objetivos de Aprendizado

- **Singleton Pattern**: por que e como implementar uma conexão de banco compartilhada
- **Dependency Inversion**: abstrair o driver do ArangoDB atrás de uma interface
- **Graceful Error Handling**: retry com backoff, timeout, fallback
- **Migrações vs Schema-on-Read**: por que criar coleções e índices explicitamente

### Riscos da Sessão

| Risco                                           | Mitigação                                               |
| ----------------------------------------------- | ------------------------------------------------------- |
| Driver `arangojs` incompatível com Nuxt 3/Nitro | Verificar versão, usar `arangojs@8.x` (suporta ESM)     |
| Timeout de conexão com Oracle Cloud             | Aumentar `requestTimeout` no driver, verificar firewall |
| TLS mismatch (self-signed vs CA)                | Configurar Caddy para usar Let's Encrypt válido         |

---

## Sessão 4 — CI/CD: Deploy na Vercel

| Campo                               | Valor                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Dias estimados**                  | 1                                                                                                     |
| **Tarefa da Sprint**                | 1.4                                                                                                   |
| **Princípios praticados**           | CI/CD, DevOps, Segurança (variáveis de ambiente em produção)                                          |
| **Critério de aceitação da sessão** | Push na `main` dispara deploy automático, `/api/health` responde em produção, preview deploy funciona |

### Subtarefas

| #     | Tarefa                                     | Descrição                                                          |
| ----- | ------------------------------------------ | ------------------------------------------------------------------ |
| 1.4.1 | Conectar repositório GitHub à Vercel       | Importar projeto, selecionar branch `main`                         |
| 1.4.2 | Configurar variáveis de ambiente na Vercel | `ARANGO_URL`, `ARANGO_USER`, `ARANGO_PASS`, `DB_NAME` no dashboard |
| 1.4.3 | Configurar domínio personalizado           | Adicionar domínio (se disponível), apontar DNS para Vercel         |
| 1.4.4 | Verificar deploy automático                | Push na `main` → build → deploy, verificar `npm run build` passa   |
| 1.4.5 | Configurar preview deployments             | Verificar que PRs geram URLs de preview com ambiente isolado       |
| 1.4.6 | Smoke test em produção                     | `curl https://<domínio>/api/health` retorna 200                    |

### Objetivos de Aprendizado

- **CI/CD Automático**: pipeline Vercel (push → build → deploy)
- **Preview Deployments**: ambientes isolados por branch/PR
- **Variáveis de Ambiente em Produção**: secrets management no dashboard da Vercel
- **Smoke Testing**: verificação mínima pós-deploy

### Riscos da Sessão

| Risco                               | Mitigação                                                        |
| ----------------------------------- | ---------------------------------------------------------------- |
| Cold start nas funções serverless   | Configurar cron job externo (UptimeRobot) para ping a cada 5 min |
| Build falhar por falta de variáveis | Testar build localmente com `npm run build` antes de pushear     |
| Domínio não propagado               | Usar URL `*.vercel.app` temporariamente                          |

---

## Mapa de Dependências entre Sessões

```
Sessão 1 (Inicialização)
    │
    ▼
Sessão 2 (Infraestrutura Oracle)  ── paralelizável com Sessão 1 ──
    │
    ▼
Sessão 3 (Conexão Backend ↔ Banco)
    │
    ▼
Sessão 4 (CI/CD — Deploy Vercel)
```

- **Sessões 1 e 2 podem ocorrer em paralelo** (repositório local vs infraestrutura remota)
- **Sessão 3 depende das Sessões 1 e 2** (precisa do repositório configurado E do ArangoDB rodando)
- **Sessão 4 depende da Sessão 1** (repositório no GitHub) e da **Sessão 3** (a rota `/api/health` precisa existir)

---

## Check-list de Progresso da Sprint

```markdown
- [x] **Sessão 1**: npm run dev funciona, ESLint + Prettier ok, estrutura de pastas criada
- [x] **Sessão 2**: Docker + ArangoDB rodando (GCP — adaptado), firewall configurado, backup funcional
- [x] **Sessão 3**: GET /api/health → 200, migrações executadas, arango.ts implementado
- [ ] **Sessão 4**: Push na main → deploy automático, /api/health responde em produção
```

---

## Referências

- `docs/sprint/sprint.md` — Plano geral da Sprint 1 no contexto das 8 sprints
- `docs/planejamento/planejamento.md` — Stack, arquitetura, modelo de dados
- `.agents/AGENTS.md` — Protocolo de pair-programming, regras de sessão
- `.agents/TO-LEARN.md` — Base conceitual para os princípios praticados

---

_Documento gerado em: 9 de Maio de 2026_
_Propósito: Divisão da Sprint 1 em 4 sessões de pair-programming conforme metodologia AGENTS.md_
_Versão: 1.0_
