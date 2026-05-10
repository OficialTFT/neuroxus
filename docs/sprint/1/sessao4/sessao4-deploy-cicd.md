# Sessão 4 — CI/CD: Deploy na Vercel

> **Sprint:** 1 — Setup & Infraestrutura
> **Sessão:** 4 de 4
> **Artefato:** Documento de fechamento da sessão
> **Base:** `docs/sprint/1/sessao4/requisitos.md`

---

## Resumo da Sessão

Configuração do pipeline de CI/CD do Neuroxus na Vercel, incluindo deploy automático, variáveis de ambiente de produção e preview deployments.

## Subtarefas

| # | Tarefa | Status | Observações |
|---|--------|--------|-------------|
| 1.4.1 | Conectar repositório GitHub à Vercel | ✅ | Já concluído antes da sessão |
| 1.4.2 | Configurar variáveis de ambiente na Vercel | ✅ | Atualizadas durante a sessão — apontam para GCP |
| 1.4.3 | Configurar domínio personalizado | ✅ | Sem domínio próprio — usando `neuroxus.vercel.app` |
| 1.4.4 | Verificar deploy automático | ✅ | Push na `main` → deploy automático confirmado |
| 1.4.5 | Configurar preview deployments | ✅ | Preview automático ao criar PR — testado e aprovado |
| 1.4.6 | Smoke test em produção | ✅ | `GET /api/health` → 200 OK |

## Problemas Encontrados e Soluções

### 1. Erro 500 no `/api/health` em produção

**Sintoma:** `curl https://neuroxus.vercel.app/api/health` retornava HTTP 500.

**Diagnóstico:**
- As variáveis de ambiente na Vercel estavam configuradas com os valores de desenvolvimento (`http://localhost:8529`)
- No ambiente serverless da Vercel, não há ArangoDB rodando localmente
- A conexão falhava silenciosamente

**Causa raiz:** Variáveis de ambiente de produção apontando para `localhost` em vez do IP público da VM na GCP.

**Solução:**
1. Identificado o IP público da GCP: `35.184.106.235`
2. Verificada a conectividade com o ArangoDB via `curl http://35.184.106.235:8529/_api/version` (retornou 401 — esperado, indica que o banco está acessível)
3. Atualizadas as variáveis na Vercel:
   - `ARANGO_URL=http://35.184.106.235:8529`
   - `ARANGO_USER=app_user`
   - `ARANGO_PASS=soat1cSu`
4. Adicionado `nitro: { preset: 'vercel' }` ao `nuxt.config.ts` para garantir o preset correto
5. Deploy automático confirmado ao fazer push na `main`

### 2. Preview Deployments

**Diagnóstico:** Já ativado por padrão pela Vercel ao conectar o repositório GitHub.

**Validação:**
1. Criada branch `development`
2. Alteração mínima no `app/app.vue`
3. Commit e push da branch
4. Criado PR no GitHub
5. Vercel gerou preview URL automaticamente
6. PR mergeado na `main` com sucesso

## Decisões Técnicas

| Decisão | Alternativas | Motivo |
|---------|-------------|--------|
| Usar preset `vercel` explícito | Auto-detecção pela Vercel | Garantir que o build sempre use o preset correto, independente de detecção automática |
| Variáveis de produção separadas das de dev | Usar mesmo `.env` | Ambientes diferentes (serverless vs local) exigem configurações diferentes |
| Preview deployments sem banco isolado | Criar banco separado para previews | YAGNI — o preview usa o mesmo banco de produção; isolamento será considerado quando houver risco de impacto |

## Princípios de Engenharia Aplicados

- **DevOps:** Pipeline CI/CD automatizado — push → build → deploy
- **Segurança em camadas:** Firewall GCP + UFW + autenticação no ArangoDB
- **Separação de ambientes:** Produção vs desenvolvimento com variáveis distintas
- **KISS:** Preview deployments sem complexidade adicional (Vercel gerencia automaticamente)

## Checklist de Finalização

- [x] Todo o código implementado foi explicado ao usuário
- [x] As decisões técnicas foram documentadas
- [x] Os testes foram executados e os resultados explicados (smoke test)
- [x] O usuário compreendeu os conceitos praticados (preview deployments, CI/CD)
- [x] O commit foi feito com mensagem semântica
- [x] O código está sem warnings ou erros de linting
- [x] Foram indicadas fontes para estudo complementar
- [x] A sessão foi resumida com pontos de aprendizado
- [x] O diretório e o arquivo de requisitos foram criados no início da sessão
- [x] O arquivo de documentação final da sessão foi gerado

## Conceitos Aprendidos

- **CI/CD na Vercel:** Pipeline automático de build e deploy conectado ao GitHub
- **Variáveis de ambiente em produção:** Gerenciamento de secrets no dashboard da Vercel
- **Preview Deployments:** URLs únicas e isoladas para cada PR
- **Smoke Testing:** Verificação mínima pós-deploy (`/api/health`)

## Sugestões de Estudo Complementar

- **Vercel Docs:** Projeto e configuração de preview deployments
- **Nitro Deployment:** Presets de deploy (node-server, vercel, cloudflare, etc.)
- **Princípio YAGNI:** Quando não adicionar complexidade desnecessária
- **Serverless vs Tradicional:** Diferenças de arquitetura e implicações para banco de dados

## Próximos Passos

Com a Sprint 1 concluída, a fundação do projeto está estabelecida:
- ✅ Projeto Nuxt 4 + TypeScript configurado
- ✅ ArangoDB rodando em Docker na GCP
- ✅ Conexão backend ↔ banco funcionando
- ✅ CI/CD na Vercel operacional

O próximo passo é iniciar **Sprint 2**, que deverá focar no sistema de **autenticação** (login, registro, JWT) conforme o planejamento em `docs/sprint/sprint.md`.

---

*Documento gerado em: 10 de Maio de 2026*
*Propósito: Fechamento da Sessão 4 da Sprint 1*