# Sessão 1 — Inicialização do Projeto

## Requisitos

> **Base:** `docs/sprint/1/sessoes-sprint.md` — Sessão 1
> **Subtarefas ignoradas:** 1.1.1 (criar repositório GitHub), 1.1.2 (inicializar Nuxt 3)
> **Escopo da sessão:** 1.1.3, 1.1.4, 1.1.5, 1.1.6

---

## 1. Requisitos Funcionais

### RF1 — Estrutura de Pastas (1.1.3)

- [ ] Criar estrutura de diretórios conforme `docs/planejamento/planejamento.md` §3.2, incluindo:
  - `server/api/` — rotas da API (Nitro)
  - `server/utils/` — funções utilitárias (ex: `arango.ts`)
  - `server/middleware/` — middleware de autenticação
  - `components/editor/` — componente editor TipTap
  - `components/graph/` — componente grafo Cytoscape
  - `components/ui/` — componentes de UI reutilizáveis
  - `pages/` — rotas do Nuxt (index.vue, article/[...slug].vue, profile/[username].vue, search.vue)
  - `composables/` — hooks reutilizáveis
  - `plugins/` — plugins Vue
  - `public/` — assets estáticos

### RF2 — ESLint + Prettier (1.1.4)

- [ ] Instalar e configurar ESLint com regras padronizadas para TypeScript + Vue 3
- [ ] Instalar e configurar Prettier como formatador
- [ ] Integrar ESLint e Prettier (evitar conflitos entre regras)
- [ ] Adicionar scripts no `package.json`: `lint`, `lint:fix`, `format`
- [ ] Garantir compatibilidade com Nuxt 3

### RF3 — .env.example (1.1.5)

- [ ] Criar `.env.example` na raiz do projeto
- [ ] Documentar todas as variáveis de ambiente necessárias:
  - `ARANGO_URL` — URL de conexão com ArangoDB
  - `ARANGO_USER` — usuário do banco
  - `ARANGO_PASS` — senha do banco
  - `DB_NAME` — nome do banco de dados

### RF4 — Primeiro Commit (1.1.6)

- [ ] Commit inicial com mensagem semântica: `chore: init project structure`

---

## 2. Requisitos Não Funcionais

- **RNF1** — ESLint deve executar em modo watch durante `npm run dev`
- **RNF2** — Prettier deve ser executável via `npm run format`
- **RNF3** — `.env` não deve ser versionado (incluir em `.gitignore`)
- **RNF4** — Estrutura de pastas deve espelhar exatamente o `planejamento.md` §3.2

---

## 3. Critérios de Aceitação da Sessão

- `npm run dev` inicia sem erros (após estrutura criada)
- ESLint + Prettier funcionando (sem conflitos)
- Estrutura de pastas espelha `planejamento.md` §3.2
- `.env.example` contém todas as variáveis documentadas
- Primeiro commit realizado com mensagem semântica

---

## 4. Dependências

| Tarefa                  | Depende de                          | Notas                                                       |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------- |
| 1.1.4 (ESLint+Prettier) | 1.1.3 (pastas), Nuxt 3 inicializado | Presume-se que Nuxt 3 já foi inicializado fora desta sessão |
| 1.1.5 (.env.example)    | Nenhuma                             | Pode ser feito em paralelo                                  |
| 1.1.6 (commit)          | 1.1.3, 1.1.4, 1.1.5                 | Todas as anteriores devem estar completas                   |

---

## 5. Riscos

| Risco                          | Impacto    | Mitigação                                                |
| ------------------------------ | ---------- | -------------------------------------------------------- |
| Nuxt 3 não inicializado        | Bloqueante | Verificar antes de iniciar 1.1.3                         |
| Conflito ESLint vs Prettier    | Médio      | Usar `eslint-config-prettier`                            |
| Versão do Node.js incompatível | Bloqueante | Verificar `.node-version` ou `engines` no `package.json` |

---

## 6. Princípios a Praticar

- **KISS** — Estrutura simples, sem abstrações prematuras
- **YAGNI** — Apenas o necessário para o setup inicial
- **Versionamento** — Conventional Commits (`chore:`)
- **Organização** — Separação clara de responsabilidades nos diretórios

---

_Documento gerado em: 9 de Maio de 2026_
_Versão: 1.0_
