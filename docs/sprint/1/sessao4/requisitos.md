# Requisitos da Sessão 4 — CI/CD: Deploy na Vercel

> **Sprint:** 1 — Setup & Infraestrutura
> **Sessão:** 4 de 4
> **Base:** `docs/sprint/1/sessoes-sprint.md` § Sessão 4

---

## 1. Objetivo

Configurar o deploy contínuo do Neuroxus na Vercel e validar que a aplicação responde corretamente em produção.

## 2. Subtarefas

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 1.4.1 | Conectar repositório GitHub à Vercel | ✅ Concluído | — |
| 1.4.2 | Configurar variáveis de ambiente na Vercel | ✅ Concluído | Atualmente iguais ao `.env` de dev (localhost) — **serão ajustadas** |
| 1.4.3 | Configurar domínio personalizado | ✅ Concluído | Sem domínio próprio — usando `https://neuroxus.vercel.app/` |
| 1.4.4 | Verificar deploy automático | 🔄 A verificar | Confirmar se push na `main` dispara build + deploy |
| 1.4.5 | Configurar preview deployments | ❓ Não iniciado | Explicar conceito e validar se Vercel já habilita automaticamente |
| 1.4.6 | Smoke test em produção | ❌ Com falha | `curl https://neuroxus.vercel.app/api/health` retorna 500 |

## 3. Diagnóstico do Problema (1.4.6)

### Sintoma

`GET /api/health` retorna **HTTP 500** em produção.

### Causa Raiz Identificada

- `.env` de desenvolvimento aponta `ARANGO_URL=http://localhost:8529`
- Variáveis de ambiente na Vercel estão configuradas com os mesmos valores de desenvolvimento
- Na Vercel (serverless), não há ArangoDB rodando em `localhost`
- O `loadConfig()` em `server/utils/arango.ts` lança erro ao tentar conectar, resultando em 500

### Correção Necessária

1. Descobrir o IP público da VM na GCP onde o ArangoDB está rodando
2. Verificar se o firewall na GCP (VPC Firewall + UFW) permite conexão externa na porta 8529
3. Atualizar as variáveis de ambiente na Vercel para apontarem para o IP público da VM
4. Testar conectividade remota com `arangosh` ou `curl` apontando para o IP público

## 4. Critérios de Aceitação da Sessão

- [ ] Push na `main` dispara deploy automático na Vercel
- [ ] `GET /api/health` retorna HTTP 200 em produção
- [ ] Preview deployments funcionam para PRs
- [ ] Documento de fechamento da sessão gerado

## 5. Riscos

| Risco | Mitigação |
|-------|-----------|
| GCP VM não tem IP público fixo ou está com IP interno | Usar IP externo da VM; verificar no Console GCP |
| Firewall da GCP bloqueia tráfego da Vercel | Liberar porta 8529 para `0.0.0.0/0` OU para o range de IPs da Vercel |
| UFW na VM bloqueia conexão | Verificar `sudo ufw status` e adicionar regra se necessário |
| ArangoDB configurado apenas para localhost | Verificar `--server.endpoint` no docker-compose |

---

*Documento gerado em: 9 de Maio de 2026*
*Propósito: Especificação detalhada da Sessão 4*